import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Department } from '../models/Department.js';
import { WorkflowRule } from '../models/WorkflowRule.js';
import { Request } from '../models/Request.js';
import { Workflow } from '../models/Workflow.js';
import { Task } from '../models/Task.js';
import { Approval } from '../models/Approval.js';
import { Notification } from '../models/Notification.js';
import { AuditLog } from '../models/AuditLog.js';
import { connectDB, disconnectDB } from '../config/db.js';

export const seedData = async () => {
  console.log('[Seed] Seeding database with FlowPilot initial data...');

  // 1. Departments
  const deptCount = await Department.countDocuments();
  let finDept, itDept, hrDept, opsDept;

  if (deptCount === 0) {
    finDept = await Department.create({
      name: 'Finance & Accounts',
      code: 'FIN',
      description: 'Handles corporate reimbursements, invoices, and expense auditing',
      budget: 1500000
    });
    itDept = await Department.create({
      name: 'Information Technology',
      code: 'IT',
      description: 'IT infrastructure, systems access, software and hardware procurement',
      budget: 800000
    });
    hrDept = await Department.create({
      name: 'Human Resources',
      code: 'HR',
      description: 'People operations, leave administration, talent onboarding',
      budget: 400000
    });
    opsDept = await Department.create({
      name: 'Operations & Facilities',
      code: 'OPS',
      description: 'Workplace administration and supply management',
      budget: 500000
    });
    console.log('[Seed] Departments created.');
  } else {
    finDept = await Department.findOne({ code: 'FIN' });
    itDept = await Department.findOne({ code: 'IT' });
    hrDept = await Department.findOne({ code: 'HR' });
    opsDept = await Department.findOne({ code: 'OPS' });
  }

  // 2. Users (Admin, Manager, Employee)
  let admin = await User.findOne({ email: 'admin@flowpilot.ai' });
  if (!admin) {
    admin = await User.create({
      name: 'System Admin',
      email: 'admin@flowpilot.ai',
      password: 'Admin@123',
      role: 'ADMIN',
      title: 'Chief Technology Administrator',
      department: itDept?._id
    });
    console.log('[Seed] Admin user created (admin@flowpilot.ai / Admin@123)');
  }

  let manager = await User.findOne({ email: 'manager@flowpilot.ai' });
  if (!manager) {
    manager = await User.create({
      name: 'Sarah Jenkins',
      email: 'manager@flowpilot.ai',
      password: 'Manager@123',
      role: 'MANAGER',
      title: 'Finance Operations Director',
      department: finDept?._id
    });
    console.log('[Seed] Manager user created (manager@flowpilot.ai / Manager@123)');
  }

  // Link manager to Department
  if (finDept && !finDept.managerId) {
    finDept.managerId = manager._id;
    await finDept.save();
  }

  let employee = await User.findOne({ email: 'employee@flowpilot.ai' });
  if (!employee) {
    employee = await User.create({
      name: 'Alex Rivera',
      email: 'employee@flowpilot.ai',
      password: 'Employee@123',
      role: 'EMPLOYEE',
      title: 'Senior Solutions Consultant',
      department: finDept?._id
    });
    console.log('[Seed] Employee user created (employee@flowpilot.ai / Employee@123)');
  }

  // 3. Workflow Rules
  const ruleCount = await WorkflowRule.countDocuments();
  if (ruleCount === 0) {
    await WorkflowRule.create([
      {
        name: 'Micro-Expense Auto-Approval',
        description: 'Auto-approves routine operational reimbursements under ₹5,000 without requiring manager intervention.',
        category: 'expense',
        isActive: true,
        priorityOrder: 1,
        conditions: {
          minAmount: 0,
          maxAmount: 4999.99
        },
        actions: {
          autoApprove: true,
          requiresManagerApproval: false,
          slaHours: 1,
          notificationMessage: 'Expense under ₹5,000 auto-processed.'
        }
      },
      {
        name: 'Manager Approval for Mid-Tier Expenses',
        description: 'Requires Department Manager authorization for expense claims between ₹5,000 and ₹25,000.',
        category: 'expense',
        isActive: true,
        priorityOrder: 2,
        conditions: {
          minAmount: 5000,
          maxAmount: 25000
        },
        actions: {
          autoApprove: false,
          requiresManagerApproval: true,
          assignRole: 'MANAGER',
          slaHours: 24,
          notificationMessage: 'Expense claim requires Manager verification.'
        }
      },
      {
        name: 'Executive Dual Approval for High-Value Capital',
        description: 'Enforces dual Manager + Executive Admin review for expenditures exceeding ₹25,000.',
        category: 'expense',
        isActive: true,
        priorityOrder: 3,
        conditions: {
          minAmount: 25000.01
        },
        actions: {
          autoApprove: false,
          requiresManagerApproval: true,
          requiresAdminApproval: true,
          assignRole: 'ADMIN',
          slaHours: 12,
          notificationMessage: 'High-value expenditure flagged for Admin signoff.'
        }
      },
      {
        name: 'IT Equipment Procurement Policy',
        description: 'Directs all hardware and software procurement requests to IT Department for asset inventory tracking.',
        category: 'purchase',
        isActive: true,
        priorityOrder: 4,
        conditions: {
          keywords: ['laptop', 'monitor', 'keyboard', 'license', 'software', 'cloud']
        },
        actions: {
          autoApprove: false,
          requiresManagerApproval: true,
          assignDepartmentCode: 'IT',
          assignRole: 'MANAGER',
          slaHours: 48,
          notificationMessage: 'IT Procurement request dispatched to IT Lead.'
        }
      },
      {
        name: 'Critical Infrastructure Outage Fast-Track',
        description: 'Immediately fast-tracks critical technical issues with a 2-hour SLA response target.',
        category: 'it_support',
        isActive: true,
        priorityOrder: 5,
        conditions: {
          priorityLevel: ['CRITICAL']
        },
        actions: {
          autoApprove: false,
          assignDepartmentCode: 'IT',
          assignRole: 'ADMIN',
          slaHours: 2,
          notificationMessage: 'URGENT: Production outage ticket created with 2-hour SLA.'
        }
      }
    ]);
    console.log('[Seed] Default workflow rules created.');
  }

  // 4. Sample Requests and Workflows for Rich Demo Dashboard
  const requestCount = await Request.countDocuments();
  if (requestCount === 0) {
    // 4.1 Sample Completed Auto-Approved Request
    const req1 = await Request.create({
      trackingNumber: 'FP-2026-1011',
      title: 'Taxi fare reimbursement for client pitch in Gurgaon',
      description: 'Cab travel from Cyber City office to client HQ for smart automation workshop on Monday.',
      category: 'expense',
      userCategoryProvided: true,
      priority: 'LOW',
      userPriorityProvided: false,
      amount: 1450,
      currency: 'INR',
      creator: employee._id,
      department: finDept?._id,
      departmentName: 'Finance & Accounts',
      status: 'COMPLETED',
      aiAnalysis: {
        categoryClassification: { category: 'expense', confidence: 0.98, reason: 'Travel reimbursement claim' },
        extractedData: { amount: 1450, currency: 'INR', purpose: 'client pitch cab fare', date: '2026-09-28' },
        priorityAnalysis: { priority: 'LOW', confidence: 0.91, reason: 'Routine reimbursement under ₹5,000 threshold' },
        nextActionRecommendation: { recommendedAction: 'auto_process', reason: 'Below auto-approval threshold', requiresHumanApproval: false },
        completionSummary: {
          summary: 'Workflow FP-2026-1011 for Taxi fare reimbursement (INR 1,450) was validated and straight-through processed via Micro-Expense Auto-Approval policy without human bottleneck.',
          generatedAt: new Date()
        }
      }
    });

    const wf1 = await Workflow.create({
      requestId: req1._id,
      workflowType: 'expense',
      currentState: 'COMPLETED',
      previousState: 'IN_PROGRESS',
      priority: 'LOW',
      assignedDepartment: finDept?._id,
      assignedUser: employee._id,
      assignedRole: 'EMPLOYEE',
      automationStatus: 'AUTOMATED',
      approvalPolicy: { isAutoApproved: true, thresholdRuleApplied: 'Micro-Expense Auto-Approval' },
      sla: { durationHours: 1, isOverdue: false },
      summary: { content: req1.aiAnalysis.completionSummary.summary, generatedAt: new Date() },
      stateHistory: [
        { fromState: 'CREATED', toState: 'CLASSIFIED', action: 'AI_INGESTION' },
        { fromState: 'CLASSIFIED', toState: 'APPROVED', action: 'POLICY_AUTO_APPROVAL' },
        { fromState: 'APPROVED', toState: 'COMPLETED', action: 'AUTO_PAYMENT_SCHEDULED' }
      ]
    });
    req1.workflowId = wf1._id;
    await req1.save();

    // 4.2 Sample Pending Approval Request (Demo Scenario Candidate!)
    const req2 = await Request.create({
      trackingNumber: 'FP-2026-1024',
      title: 'Need reimbursement of ₹12,500 for client dinner and venue hosting',
      description: 'Hosted executive dinner for prospective Enterprise tier client at Leela Palace. Attached receipt for ₹12,500.',
      category: 'expense',
      userCategoryProvided: true,
      priority: 'MEDIUM',
      userPriorityProvided: true,
      amount: 12500,
      currency: 'INR',
      creator: employee._id,
      department: finDept?._id,
      departmentName: 'Finance & Accounts',
      status: 'PENDING_APPROVAL',
      aiAnalysis: {
        categoryClassification: { category: 'expense', confidence: 0.96, reason: 'Food, hospitality and client hosting claim' },
        extractedData: { amount: 12500, currency: 'INR', purpose: 'executive dinner for Enterprise client', date: '2026-09-29' },
        priorityAnalysis: { priority: 'MEDIUM', confidence: 0.89, reason: 'Mid-tier expense between ₹5,000 and ₹25,000' },
        nextActionRecommendation: { recommendedAction: 'manager_approval', reason: 'Exceeds auto-approval limit of ₹5,000. Manager sign-off required.', requiresHumanApproval: true, suggestedAssigneeRole: 'MANAGER' },
        duplicateCheck: { isPotentialDuplicate: false, confidence: 0.95, reason: 'No matching receipts in current fiscal quarter.' }
      }
    });

    const wf2 = await Workflow.create({
      requestId: req2._id,
      workflowType: 'expense',
      currentState: 'PENDING_APPROVAL',
      previousState: 'CLASSIFIED',
      priority: 'MEDIUM',
      assignedDepartment: finDept?._id,
      assignedUser: manager._id,
      assignedRole: 'MANAGER',
      automationStatus: 'MANUAL_REQUIRED',
      approvalPolicy: { requiresManagerApproval: true, thresholdRuleApplied: 'Manager Approval for Mid-Tier Expenses' },
      sla: {
        durationHours: 24,
        deadline: new Date(Date.now() + 20 * 3600 * 1000),
        isOverdue: false
      }
    });
    req2.workflowId = wf2._id;
    await req2.save();

    await Task.create({
      title: 'Review & Authorize ₹12,500 Client Hospitality Claim',
      description: 'Verify bill receipt and authorize reimbursement payout for Alex Rivera.',
      workflowId: wf2._id,
      requestId: req2._id,
      assignedUser: manager._id,
      assignedRole: 'MANAGER',
      priority: 'MEDIUM',
      status: 'TODO',
      dueDate: wf2.sla.deadline
    });

    // 4.3 Sample IT Request
    const req3 = await Request.create({
      trackingNumber: 'FP-2026-1035',
      title: 'Request second monitor and USB-C multiport hub for developer workstation',
      description: 'Need additional 27-inch 4K monitor and docking station for testing multi-window workflow visualization modules.',
      category: 'purchase',
      userCategoryProvided: true,
      priority: 'MEDIUM',
      amount: 22000,
      currency: 'INR',
      creator: employee._id,
      department: itDept?._id,
      departmentName: 'Information Technology',
      status: 'IN_PROGRESS',
      aiAnalysis: {
        categoryClassification: { category: 'purchase', confidence: 0.94, reason: 'Hardware peripherals acquisition' },
        extractedData: { amount: 22000, purpose: 'developer monitor & hub', vendor: 'Dell Enterprise' },
        priorityAnalysis: { priority: 'MEDIUM', confidence: 0.9 }
      }
    });

    const wf3 = await Workflow.create({
      requestId: req3._id,
      workflowType: 'purchase',
      currentState: 'IN_PROGRESS',
      previousState: 'APPROVED',
      priority: 'MEDIUM',
      assignedDepartment: itDept?._id,
      assignedUser: manager._id,
      assignedRole: 'MANAGER',
      automationStatus: 'MANUAL_REQUIRED',
      sla: { durationHours: 48, deadline: new Date(Date.now() + 35 * 3600 * 1000), isOverdue: false }
    });
    req3.workflowId = wf3._id;
    await req3.save();

    // 4.4 Notifications
    await Notification.create([
      {
        recipientId: manager._id,
        senderId: employee._id,
        type: 'APPROVAL_REQUIRED',
        title: 'Approval Required: Client Dinner Reimbursement',
        message: 'Alex Rivera submitted an expense request for ₹12,500 awaiting your approval.',
        requestId: req2._id,
        workflowId: wf2._id,
        isRead: false
      },
      {
        recipientId: employee._id,
        type: 'REQUEST_APPROVED',
        title: '🎉 Taxi fare reimbursement Auto-Approved!',
        message: 'Your request FP-2026-1011 for ₹1,450 was processed automatically.',
        requestId: req1._id,
        workflowId: wf1._id,
        isRead: true
      }
    ]);

    // 4.5 Audit logs
    await AuditLog.create([
      {
        actor: employee._id,
        actorName: employee.name,
        actorRole: employee.role,
        action: 'REQUEST_CREATED',
        entity: 'Request',
        entityId: req1._id.toString(),
        metadata: { trackingNumber: 'FP-2026-1011', amount: 1450 }
      },
      {
        actorName: 'AI_RULE_ENGINE',
        actorRole: 'SYSTEM',
        action: 'POLICY_AUTO_APPROVAL',
        entity: 'Workflow',
        entityId: wf1._id.toString(),
        metadata: { rule: 'Micro-Expense Auto-Approval', amount: 1450 }
      },
      {
        actor: employee._id,
        actorName: employee.name,
        actorRole: employee.role,
        action: 'REQUEST_CREATED',
        entity: 'Request',
        entityId: req2._id.toString(),
        metadata: { trackingNumber: 'FP-2026-1024', amount: 12500 }
      }
    ]);

    console.log('[Seed] Sample requests, workflows, notifications, and audit records created.');
  }

  console.log('[Seed] Database initialization complete!');
};

// If run directly via "node src/utils/seed.js"
if (process.argv[1]?.endsWith('seed.js')) {
  (async () => {
    try {
      await connectDB();
      await seedData();
      await disconnectDB();
      process.exit(0);
    } catch (err) {
      console.error('[Seed Error]:', err);
      process.exit(1);
    }
  })();
}
