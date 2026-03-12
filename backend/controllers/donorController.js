const Donor = require('../models/Donor')

exports.getDonors = async (req, res) => {
  try {
    const donors = await Donor.find().sort({ createdAt: -1 })
    return res.json(donors)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch donors' })
  }
}

exports.createDonor = async (req, res) => {
  try {
    const donor = await Donor.create(req.body)
    return res.status(201).json(donor)
  } catch (error) {
    return res.status(400).json({ message: 'Failed to create donor' })
  }
}

