import test from 'node:test';
import assert from 'node:assert/strict';
import { canTransition } from '../src/workflows/stateMachine.js';
import { evaluateRules } from '../src/services/ruleEngine.js';
import { classificationResponseSchema, heuristicClassify } from '../src/ai/classifier.js';
import { extractionResponseSchema, heuristicExtract } from '../src/ai/extractor.js';
import { priorityResponseSchema, heuristicPriority } from '../src/ai/priorityAnalyzer.js';
import { recommendationResponseSchema, heuristicRecommend } from '../src/ai/recommendationEngine.js';

test('1. AI Classification Zod validation and heuristics', () => {
  const result = heuristicClassify('I need reimbursement for flight tickets to Mumbai client office');
  assert.equal(result.category, 'expense');
  assert.ok(result.confidence > 0.8);

  const validated = classificationResponseSchema.parse(result);
  assert.equal(validated.category, 'expense');
});

test('2. AI Extraction Zod validation and currency parsing', () => {
  const result = heuristicExtract('Need reimbursement for ₹8,500 spent on client travel on 2026-09-25');
  assert.equal(result.amount, 8500);
  assert.equal(result.currency, 'INR');

  const validated = extractionResponseSchema.parse(result);
  assert.equal(validated.amount, 8500);
});

test('3. AI Priority analysis Zod validation', () => {
  const criticalResult = heuristicPriority('Critical server outage and security incident', 'it_support');
  assert.equal(criticalResult.priority, 'CRITICAL');

  const validated = priorityResponseSchema.parse(criticalResult);
  assert.equal(validated.priority, 'CRITICAL');
});

test('4. AI Next-Action Recommendation logic', () => {
  const lowExpenseRec = heuristicRecommend({ category: 'expense', amount: 3500, priority: 'LOW' });
  assert.equal(lowExpenseRec.recommendedAction, 'auto_process');
  assert.equal(lowExpenseRec.requiresHumanApproval, false);

  const highExpenseRec = heuristicRecommend({ category: 'expense', amount: 15000, priority: 'MEDIUM' });
  assert.equal(highExpenseRec.recommendedAction, 'manager_approval');
  assert.equal(highExpenseRec.requiresHumanApproval, true);

  const validated = recommendationResponseSchema.parse(highExpenseRec);
  assert.equal(validated.requiresHumanApproval, true);
});

test('5. Workflow State Machine transitions', () => {
  assert.equal(canTransition('CREATED', 'AI_PROCESSING'), true);
  assert.equal(canTransition('AI_PROCESSING', 'CLASSIFIED'), true);
  assert.equal(canTransition('CLASSIFIED', 'PENDING_APPROVAL'), true);
  assert.equal(canTransition('PENDING_APPROVAL', 'APPROVED'), true);
  assert.equal(canTransition('APPROVED', 'IN_PROGRESS'), true);
  assert.equal(canTransition('IN_PROGRESS', 'COMPLETED'), true);

  // Invalid transition test: Cannot jump directly from CREATED to COMPLETED
  assert.equal(canTransition('CREATED', 'COMPLETED'), false);
  assert.equal(canTransition('COMPLETED', 'PENDING_APPROVAL'), false);
});

test('6. State transition safety and invalid transitions', () => {
  assert.equal(canTransition('CREATED', 'COMPLETED'), false);
  assert.equal(canTransition('COMPLETED', 'PENDING_APPROVAL'), false);
  assert.equal(canTransition('REJECTED', 'APPROVED'), false);
  assert.equal(canTransition('PENDING_APPROVAL', 'APPROVED'), true);
  assert.equal(canTransition('PENDING_APPROVAL', 'REJECTED'), true);
  assert.equal(canTransition('PENDING_APPROVAL', 'ESCALATED'), true);
});
