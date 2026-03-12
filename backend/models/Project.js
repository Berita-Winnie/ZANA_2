const mongoose = require('mongoose')

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    donorIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Donor' }],
    donors: [{ type: String }],
    resourcesAllocated: { type: Number, default: 0 },
    resourcesRemaining: { type: Number, default: 0 },
    schoolsCovered: [{ type: String }],
    girlsImpacted: { type: Number, default: 0 },
    assignedOfficerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, default: 'active' },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Project', projectSchema)

