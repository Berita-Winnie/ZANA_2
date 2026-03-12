const mongoose = require('mongoose')

const settingSchema = new mongoose.Schema(
  {
    organizationName: { type: String, default: '' },
    resourceCategories: [{ type: String }],
  },
  { timestamps: true },
)

module.exports = mongoose.model('Setting', settingSchema)

