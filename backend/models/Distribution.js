const mongoose = require('mongoose')

const distributionSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    resourceType: { type: String, required: true, trim: true },
    quantity: { type: Number, default: 0 },
    girlsImpacted: { type: Number, default: 0 },
    date: { type: String, required: true },
    location: { type: String, default: '' },
    notes: { type: String, default: '' },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Distribution', distributionSchema)

