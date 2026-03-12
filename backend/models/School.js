const mongoose = require('mongoose')

const schoolSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, default: '' },
    girlsCount: { type: Number, default: 0 },
    projectIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
  },
  { timestamps: true },
)

module.exports = mongoose.model('School', schoolSchema)

