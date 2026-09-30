import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Request',
      required: true,
      index: true
    },
    workflowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workflow'
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true
    },
    isInternal: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

export const Comment = mongoose.model('Comment', commentSchema);
