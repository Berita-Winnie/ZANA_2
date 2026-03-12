const School = require('../models/School')

exports.getSchools = async (req, res) => {
  try {
    const schools = await School.find().sort({ createdAt: -1 })
    return res.json(schools)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch schools' })
  }
}

exports.createSchool = async (req, res) => {
  try {
    const school = await School.create(req.body)
    return res.status(201).json(school)
  } catch (error) {
    return res.status(400).json({ message: 'Failed to create school' })
  }
}

