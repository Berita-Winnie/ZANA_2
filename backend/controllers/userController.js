const User = require('../models/User')

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 })
    return res.json(users)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch users' })
  }
}

exports.updateUserRole = async (req, res) => {
  try {
    const { role, assignedProjects, donorProjects, organization } = req.body
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, assignedProjects, donorProjects, organization },
      { new: true },
    ).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })
    return res.json(user)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update user' })
  }
}

