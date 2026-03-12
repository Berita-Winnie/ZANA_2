const Project = require('../models/Project')

exports.getProjects = async (req, res) => {
  try {
    let filter = {}
    if (req.user.role === 'fieldOfficer') {
      const ids = req.user.assignedProjects || []
      filter = { _id: { $in: ids } }
    } else if (req.user.role === 'donor') {
      const ids = req.user.donorProjects || []
      filter = { _id: { $in: ids } }
    }

    const projects = await Project.find(filter).sort({ createdAt: -1 })
    return res.json(projects)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch projects' })
  }
}

exports.createProject = async (req, res) => {
  try {
    const project = await Project.create(req.body)
    return res.status(201).json(project)
  } catch (error) {
    return res.status(400).json({ message: 'Failed to create project' })
  }
}

exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })
    if (!project) return res.status(404).json({ message: 'Project not found' })
    return res.json(project)
  } catch (error) {
    return res.status(400).json({ message: 'Failed to update project' })
  }
}

exports.deleteProject = async (req, res) => {
  try {
    const deleted = await Project.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ message: 'Project not found' })
    return res.json({ message: 'Project deleted' })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete project' })
  }
}

