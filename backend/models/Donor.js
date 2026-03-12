const mongoose = require('mongoose')

const donorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true },
    organization: { type: String, default: '' },
    fundedProjectIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
  },
  { timestamps: true },
)

module.exports = mongoose.model('Donor', donorSchema)

