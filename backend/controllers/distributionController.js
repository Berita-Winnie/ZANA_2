const Distribution = require('../models/Distribution')

exports.getDistributions = async (req, res) => {
  try {
    let filter = {}
    if (req.user.role === 'fieldOfficer') {
      const assigned = req.user.assignedProjects || []
      filter = {
        $or: [
          { submittedBy: req.user._id },
          { projectId: { $in: assigned } },
        ],
      }
    } else if (req.user.role === 'donor') {
      const donorProjects = req.user.donorProjects || []
      filter = { projectId: { $in: donorProjects } }
    }

    const distributions = await Distribution.find(filter).sort({ date: -1 })
    return res.json(distributions)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch distributions' })
  }
}

exports.createDistribution = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      submittedBy: req.user._id,
      approvalStatus: 'pending',
    }
    const distribution = await Distribution.create(payload)
    return res.status(201).json(distribution)
  } catch (error) {
    return res.status(400).json({ message: 'Failed to submit distribution' })
  }
}

exports.updateApproval = async (req, res) => {
  try {
    const distribution = await Distribution.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: req.body.approvalStatus },
      { new: true },
    )
    if (!distribution) {
      return res.status(404).json({ message: 'Distribution not found' })
    }
    return res.json(distribution)
  } catch (error) {
    return res.status(400).json({ message: 'Failed to update approval status' })
  }
}

