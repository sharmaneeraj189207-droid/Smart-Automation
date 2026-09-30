import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema(
  {
    trackingNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Request title is required'],
      trim: true,
      maxlength: 200
    },
    description: {
      type: String,
      required: [true, 'Request description is required'],
      trim: true
    },
    category: {
      type: String,
      enum: ['leave', 'expense', 'purchase', 'it_support', 'administrative', 'unknown'],
      default: 'unknown',
      index: true
    },
    userCategoryProvided: {
      type: Boolean,
      default: false
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
      index: true
    },
    userPriorityProvided: {
      type: Boolean,
      default: false
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department'
    },
    departmentName: {
      type: String,
      default: 'General'
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    amount: {
      type: Number,
      default: null
    },
    currency: {
      type: String,
      default: 'INR'
    },
    requestedDate: {
      type: Date,
      default: null
    },
    attachments: [
      {
        name: String,
        url: String,
        fileType: String,
        size: Number
      }
    ],
    status: {
      type: String,
      enum: [
        'CREATED',
        'AI_PROCESSING',
        'CLASSIFIED',
        'PENDING_INFORMATION',
        'PENDING_APPROVAL',
        'APPROVED',
        'IN_PROGRESS',
        'COMPLETED',
        'REJECTED',
        'CANCELLED',
        'ESCALATED'
      ],
      default: 'CREATED',
      index: true
    },
    workflowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workflow'
    },
    aiAnalysis: {
      categoryClassification: {
        category: String,
        confidence: Number,
        reason: String
      },
      extractedData: {
        amount: Number,
        currency: String,
        purpose: String,
        date: String,
        urgency: String,
        vendor: String,
        missingFields: [String],
        raw: mongoose.Schema.Types.Mixed
      },
      priorityAnalysis: {
        priority: String,
        confidence: Number,
        reason: String
      },
      nextActionRecommendation: {
        recommendedAction: String,
        reason: String,
        requiresHumanApproval: Boolean,
        suggestedAssigneeRole: String
      },
      duplicateCheck: {
        isPotentialDuplicate: { type: Boolean, default: false },
        similarRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request' },
        similarTrackingNumber: String,
        confidence: Number,
        reason: String
      },
      completionSummary: {
        summary: String,
        generatedAt: Date
      },
      processingSteps: [
        {
          step: String,
          status: { type: String, enum: ['pending', 'in_progress', 'completed', 'skipped', 'failed'] },
          timestamp: { type: Date, default: Date.now },
          details: String
        }
      ],
      processedAt: Date
    }
  },
  {
    timestamps: true
  }
);

// Search index for title and description
requestSchema.index({ title: 'text', description: 'text' });

export const Request = mongoose.model('Request', requestSchema);
