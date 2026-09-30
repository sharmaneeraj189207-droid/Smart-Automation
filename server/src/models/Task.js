import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    workflowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workflow',
      required: true,
      index: true
    },
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Request',
      required: true,
      index: true
    },
    assignedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    assignedRole: {
      type: String,
      enum: ['ADMIN', 'MANAGER', 'EMPLOYEE'],
      default: 'EMPLOYEE'
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM'
    },
    status: {
      type: String,
      enum: ['TODO', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED', 'CANCELLED'],
      default: 'TODO',
      index: true
    },
    dueDate: {
      type: Date
    },
    completedAt: {
      type: Date,
      default: null
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    completionNotes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

export const Task = mongoose.model('Task', taskSchema);
