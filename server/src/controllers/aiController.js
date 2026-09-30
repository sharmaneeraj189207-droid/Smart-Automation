import { classifyRequest } from '../ai/classifier.js';
import { extractInformation } from '../ai/extractor.js';
import { analyzePriority } from '../ai/priorityAnalyzer.js';
import { recommendNextAction } from '../ai/recommendationEngine.js';
import { generateWorkflowSummary } from '../ai/summaryGenerator.js';
import { checkDuplicate } from '../ai/duplicateDetector.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const classify = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    if (!title && !description) {
      return errorResponse(res, 'Title or description required for classification', [], 400);
    }
    const result = await classifyRequest(title, description);
    return successResponse(res, result, 'Classification completed');
  } catch (error) {
    next(error);
  }
};

export const extract = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    if (!title && !description) {
      return errorResponse(res, 'Title or description required for extraction', [], 400);
    }
    const result = await extractInformation(title, description);
    return successResponse(res, result, 'Information extraction completed');
  } catch (error) {
    next(error);
  }
};

export const priority = async (req, res, next) => {
  try {
    const { title, description, category, amount } = req.body;
    const result = await analyzePriority(title, description, category, amount);
    return successResponse(res, result, 'Priority analysis completed');
  } catch (error) {
    next(error);
  }
};

export const recommend = async (req, res, next) => {
  try {
    const { title, description, category, amount, priority, missingFields } = req.body;
    const result = await recommendNextAction({ title, description, category, amount, priority, missingFields });
    return successResponse(res, result, 'Action recommendation generated');
  } catch (error) {
    next(error);
  }
};

export const summarize = async (req, res, next) => {
  try {
    const { request, workflow, approvals, tasks } = req.body;
    const summary = await generateWorkflowSummary({
      request: request || {},
      workflow: workflow || {},
      approvals: approvals || [],
      tasks: tasks || []
    });
    return successResponse(res, { summary }, 'Summary generated');
  } catch (error) {
    next(error);
  }
};

export const duplicateCheck = async (req, res, next) => {
  try {
    const { title, description, amount, currentRequestId } = req.body;
    const result = await checkDuplicate({
      title,
      description,
      amount,
      creatorId: req.user._id,
      currentRequestId
    });
    return successResponse(res, result, 'Duplicate check completed');
  } catch (error) {
    next(error);
  }
};
