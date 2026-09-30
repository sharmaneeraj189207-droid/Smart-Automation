import { WorkflowRule } from '../models/WorkflowRule.js';

export const evaluateRules = async ({ category, amount, priority, missingFields = [], description = '' }) => {
  const result = {
    matchedRules: [],
    requiresManagerApproval: false,
    requiresAdminApproval: false,
    isAutoApproved: false,
    assignDepartmentCode: null,
    assignRole: 'MANAGER',
    slaHours: 24,
    escalateImmediately: false,
    requestMoreInfo: false,
    notes: []
  };

  // Rule 1: Missing information check
  if (missingFields && missingFields.length > 0) {
    result.requestMoreInfo = true;
    result.assignRole = 'EMPLOYEE';
    result.notes.push(`Missing fields detected: ${missingFields.join(', ')}`);
    return result;
  }

  // Load active custom rules from DB, ordered by priority
  const dbRules = await WorkflowRule.find({
    isActive: true,
    $or: [{ category: category }, { category: 'ALL' }]
  }).sort({ priorityOrder: 1 });

  for (const rule of dbRules) {
    const { conditions, actions } = rule;
    let matches = true;

    // Check amount conditions
    if (conditions.minAmount !== null && conditions.minAmount !== undefined) {
      if (amount === null || amount < conditions.minAmount) matches = false;
    }
    if (conditions.maxAmount !== null && conditions.maxAmount !== undefined) {
      if (amount === null || amount > conditions.maxAmount) matches = false;
    }

    // Check priority condition
    if (conditions.priorityLevel && conditions.priorityLevel.length > 0) {
      if (!conditions.priorityLevel.includes(priority)) matches = false;
    }

    // Check keyword conditions
    if (conditions.keywords && conditions.keywords.length > 0) {
      const descLower = description.toLowerCase();
      const hasKeyword = conditions.keywords.some(kw => descLower.includes(kw.toLowerCase()));
      if (!hasKeyword) matches = false;
    }

    if (matches) {
      result.matchedRules.push(rule.name);
      if (actions.autoApprove) result.isAutoApproved = true;
      if (actions.requiresManagerApproval) result.requiresManagerApproval = true;
      if (actions.requiresAdminApproval) result.requiresAdminApproval = true;
      if (actions.assignDepartmentCode) result.assignDepartmentCode = actions.assignDepartmentCode;
      if (actions.assignRole) result.assignRole = actions.assignRole;
      if (actions.slaHours) result.slaHours = actions.slaHours;
      result.notes.push(`Matched custom rule: "${rule.name}"`);
    }
  }

  // If no DB rules matched or overrode, apply baseline enterprise policies:
  if (result.matchedRules.length === 0) {
    if (category === 'expense') {
      if (amount !== null && amount < 5000) {
        result.isAutoApproved = true;
        result.notes.push('Baseline Rule: Expense < ₹5,000 eligible for auto-processing.');
      } else if (amount !== null && amount > 25000) {
        result.requiresManagerApproval = true;
        result.requiresAdminApproval = true;
        result.assignRole = 'ADMIN';
        result.notes.push('Baseline Rule: Expense > ₹25,000 requires dual Manager + Admin approval.');
      } else {
        result.requiresManagerApproval = true;
        result.assignRole = 'MANAGER';
        result.notes.push('Baseline Rule: Expense ₹5,000–₹25,000 requires Department Manager approval.');
      }
    } else if (category === 'purchase') {
      result.requiresManagerApproval = true;
      result.assignRole = 'MANAGER';
      result.notes.push('Baseline Rule: Purchase requests mandate Manager authorization.');
    } else if (category === 'leave') {
      result.requiresManagerApproval = true;
      result.assignRole = 'MANAGER';
      result.notes.push('Baseline Rule: Leave requests require Manager review.');
    } else {
      result.requiresManagerApproval = false;
      result.isAutoApproved = true;
      result.notes.push('Baseline Rule: General request automatically assigned for standard handling.');
    }

    // SLA hours based on priority
    if (priority === 'CRITICAL') {
      result.slaHours = 2;
      result.escalateImmediately = false;
    } else if (priority === 'HIGH') {
      result.slaHours = 4;
    } else if (priority === 'MEDIUM') {
      result.slaHours = 24;
    } else {
      result.slaHours = 72;
    }
  }

  return result;
};
