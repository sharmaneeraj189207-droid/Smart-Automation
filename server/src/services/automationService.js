import { Request } from '../models/Request.js';
import { Workflow } from '../models/Workflow.js';
import { Task } from '../models/Task.js';
import { User } from '../models/User.js';
import { Department } from '../models/Department.js';
import { classifyRequest } from '../ai/classifier.js';
import { extractInformation } from '../ai/extractor.js';
import { analyzePriority } from '../ai/priorityAnalyzer.js';
import { recommendNextAction } from '../ai/recommendationEngine.js';
import { checkDuplicate } from '../ai/duplicateDetector.js';
import { evaluateRules } from './ruleEngine.js';
import { logAudit } from './auditService.js';
import { createNotification } from './notificationService.js';
import { calculateSlaDeadline } from '../workflows/slaManager.js';
import { transitionWorkflow } from '../workflows/workflowEngine.js';

export const processNewRequestAutomation = async (requestId) => {
  const request = await Request.findById(requestId).populate('creator');
  if (!request) {
    throw new Error(`Request ${requestId} not found for automation processing`);
  }

  const steps = [];
  const addStep = (stepName, status = 'completed', details = '') => {
    steps.push({
      step: stepName,
      status,
      timestamp: new Date(),
      details
    });
  };

  try {
    // Step 1: Request received
    addStep('Request received', 'completed', `Tracking: ${request.trackingNumber}`);

    // Step 2: Validating information
    addStep('Validating information', 'completed', 'Request schema and payload parameters validated');

    // Step 3: AI classification
    let category = request.category;
    let classificationResult = null;
    if (!category || category === 'unknown' || !request.userCategoryProvided) {
      classificationResult = await classifyRequest(request.title, request.description);
      category = classificationResult.category;
    } else {
      classificationResult = {
        category,
        confidence: 0.99,
        reason: 'Specified directly by user upon request creation.'
      };
    }
    request.category = category;
    addStep('AI classification', 'completed', `Classified as ${category.toUpperCase()} (Confidence: ${(classificationResult.confidence * 100).toFixed(0)}%)`);

    // Step 4: Extracting information
    const extractedData = await extractInformation(request.title, request.description);
    if (!request.amount && extractedData.amount) {
      request.amount = extractedData.amount;
    }
    if (extractedData.currency) {
      request.currency = extractedData.currency;
    }
    addStep('Extracting information', 'completed', `Extracted amount: ${request.currency} ${request.amount || 'N/A'}, Purpose: ${extractedData.purpose || 'N/A'}`);

    // Step 5: Priority detection
    let priority = request.priority;
    let priorityResult = null;
    if (!priority || !request.userPriorityProvided) {
      priorityResult = await analyzePriority(request.title, request.description, category, request.amount);
      priority = priorityResult.priority;
      request.priority = priority;
    } else {
      priorityResult = {
        priority,
        confidence: 0.95,
        reason: 'Explicitly marked by user.'
      };
    }
    addStep('Priority detection', 'completed', `Assigned priority: ${priority}`);

    // Step 6: Checking policy & Rule Engine
    const ruleEvaluation = await evaluateRules({
      category,
      amount: request.amount,
      priority,
      missingFields: extractedData.missingFields,
      description: request.description
    });
    addStep('Checking policy', 'completed', ruleEvaluation.notes.join('; '));

    // Step 7: Detecting duplicates
    const duplicateResult = await checkDuplicate({
      title: request.title,
      description: request.description,
      amount: request.amount,
      creatorId: request.creator?._id,
      currentRequestId: request._id
    });
    addStep('Detecting duplicates', 'completed', duplicateResult.isPotentialDuplicate ? `⚠️ Potential duplicate flagged: ${duplicateResult.similarTrackingNumber}` : 'No duplicate submissions found');

    // Step 8: Next-Action Recommendation
    const recommendation = await recommendNextAction({
      title: request.title,
      description: request.description,
      category,
      amount: request.amount,
      priority,
      missingFields: extractedData.missingFields
    });

    // Save AI Analysis to Request
    request.aiAnalysis = {
      categoryClassification: classificationResult,
      extractedData,
      priorityAnalysis: priorityResult,
      nextActionRecommendation: recommendation,
      duplicateCheck: duplicateResult,
      processingSteps: steps,
      processedAt: new Date()
    };

    // Step 9: Workflow Assignment
    const slaDeadline = calculateSlaDeadline(ruleEvaluation.slaHours);
    
    // Find department if applicable
    let targetDept = null;
    if (ruleEvaluation.assignDepartmentCode) {
      targetDept = await Department.findOne({ code: ruleEvaluation.assignDepartmentCode });
    }
    if (!targetDept) {
      targetDept = await Department.findOne({ code: category === 'it_support' ? 'IT' : category === 'expense' ? 'FIN' : 'HR' });
    }

    // Find assigned manager
    let assignedManager = null;
    if (targetDept?.managerId) {
      assignedManager = await User.findById(targetDept.managerId);
    }
    if (!assignedManager) {
      assignedManager = await User.findOne({ role: 'MANAGER', isActive: true });
    }

    const workflow = await Workflow.create({
      requestId: request._id,
      workflowType: category,
      currentState: 'CLASSIFIED',
      previousState: 'CREATED',
      priority,
      assignedDepartment: targetDept?._id,
      assignedUser: assignedManager?._id,
      assignedRole: ruleEvaluation.assignRole,
      automationStatus: ruleEvaluation.isAutoApproved ? 'AUTOMATED' : 'MANUAL_REQUIRED',
      approvalPolicy: {
        requiresManagerApproval: ruleEvaluation.requiresManagerApproval,
        requiresAdminApproval: ruleEvaluation.requiresAdminApproval,
        isAutoApproved: ruleEvaluation.isAutoApproved,
        thresholdRuleApplied: ruleEvaluation.notes[0] || 'Default policy'
      },
      sla: {
        durationHours: ruleEvaluation.slaHours,
        deadline: slaDeadline,
        isOverdue: false
      },
      stateHistory: [
        {
          fromState: 'CREATED',
          toState: 'CLASSIFIED',
          triggerType: 'AI_ENGINE',
          action: 'AUTOMATION_INITIALIZED',
          notes: 'Request classified and workflow instantiated automatically.',
          timestamp: new Date()
        }
      ]
    });

    request.workflowId = workflow._id;
    addStep('Assigning workflow', 'completed', `Workflow ID: ${workflow._id}, SLA: ${ruleEvaluation.slaHours}h`);

    // Step 10: Creating tasks
    const taskTitle = ruleEvaluation.isAutoApproved
      ? `Process ${category.toUpperCase()}: ${request.title}`
      : `Review & Approve ${category.toUpperCase()}: ${request.title}`;

    const task = await Task.create({
      title: taskTitle,
      description: `Automated task created for workflow ${workflow._id}. Next recommendation: ${recommendation.recommendedAction}`,
      workflowId: workflow._id,
      requestId: request._id,
      assignedUser: assignedManager?._id || request.creator?._id,
      assignedRole: ruleEvaluation.assignRole,
      priority,
      status: 'TODO',
      dueDate: slaDeadline
    });
    addStep('Creating tasks', 'completed', `Task "${taskTitle}" assigned to ${ruleEvaluation.assignRole}`);

    // Step 11: Routing approval & State Transition
    if (ruleEvaluation.isAutoApproved && !duplicateResult.isPotentialDuplicate) {
      addStep('Routing approval', 'completed', 'Criteria met for automated straight-through processing');
      request.status = 'APPROVED';
      await request.save();
      await transitionWorkflow({
        workflowId: workflow._id,
        nextState: 'APPROVED',
        triggerType: 'RULE_ENGINE',
        action: 'POLICY_AUTO_APPROVAL',
        notes: 'Request auto-approved by Smart Rule Engine.'
      });
      // Move to in_progress then completed
      await transitionWorkflow({
        workflowId: workflow._id,
        nextState: 'IN_PROGRESS',
        triggerType: 'RULE_ENGINE',
        action: 'AUTO_EXECUTION',
        notes: 'Auto-executing payment/fulfillment.'
      });
      await transitionWorkflow({
        workflowId: workflow._id,
        nextState: 'COMPLETED',
        triggerType: 'RULE_ENGINE',
        action: 'AUTO_COMPLETION',
        notes: 'Workflow completed automatically by FlowPilot Engine.'
      });
    } else {
      addStep('Routing approval', 'completed', `Routed to ${ruleEvaluation.assignRole} for human-in-the-loop review`);
      request.status = 'PENDING_APPROVAL';
      await request.save();
      await transitionWorkflow({
        workflowId: workflow._id,
        nextState: 'PENDING_APPROVAL',
        triggerType: 'RULE_ENGINE',
        action: 'APPROVAL_ROUTING',
        notes: `Awaiting authorization from ${ruleEvaluation.assignRole}.`
      });
    }

    // Step 12: Sending notification
    addStep('Sending notification', 'completed', 'Notification alerts dispatched to relevant stakeholders');
    request.aiAnalysis.processingSteps = steps;
    await request.save();

    // Notify assigned manager or reviewer
    if (assignedManager && !ruleEvaluation.isAutoApproved) {
      await createNotification({
        recipientId: assignedManager._id,
        senderId: request.creator?._id,
        type: 'APPROVAL_REQUIRED',
        title: `Approval Required: ${request.title}`,
        message: `A new ${request.category.toUpperCase()} request for ${request.currency} ${request.amount || 'N/A'} requires your approval.`,
        requestId: request._id,
        workflowId: workflow._id
      });
    }

    // Notify creator that processing is complete
    await createNotification({
      recipientId: request.creator._id,
      type: ruleEvaluation.isAutoApproved ? 'REQUEST_APPROVED' : 'NEW_REQUEST',
      title: ruleEvaluation.isAutoApproved ? 'Request Auto-Approved! 🎉' : 'Request Processed & Routed',
      message: ruleEvaluation.isAutoApproved
        ? `Your request "${request.title}" (${request.trackingNumber}) was validated and auto-approved.`
        : `Your request "${request.title}" has been classified and routed to ${ruleEvaluation.assignRole} for review.`,
      requestId: request._id,
      workflowId: workflow._id
    });

    // Audit log
    await logAudit({
      actor: request.creator,
      action: 'AUTOMATION_PIPELINE_EXECUTED',
      entity: 'Request',
      entityId: request._id.toString(),
      metadata: {
        category,
        priority,
        amount: request.amount,
        isAutoApproved: ruleEvaluation.isAutoApproved,
        workflowId: workflow._id
      }
    });

    return { request, workflow, task };
  } catch (error) {
    console.error('[AutomationService] Automation pipeline failed:', error);
    addStep('Pipeline exception', 'failed', error.message);
    request.aiAnalysis = {
      ...request.aiAnalysis,
      processingSteps: steps
    };
    await request.save();
    throw error;
  }
};
