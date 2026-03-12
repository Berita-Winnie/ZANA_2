const jwt = require('jsonwebtoken')
const User = require('../models/User')

function createToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

function toProfile(userDoc) {
  return {
    uid: userDoc._id,
    fullName: userDoc.fullName,
    email: userDoc.email,
    role: userDoc.role,
    organization: userDoc.organization || '',
    assignedProjects: userDoc.assignedProjects || [],
    donorProjects: userDoc.donorProjects || [],
    createdAt: userDoc.createdAt,
  }
}

exports.register = async (req, res) => {
  try {
    const { fullName, email, password, organization } = req.body
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return res.status(409).json({ message: 'Email already exists' })
    }

    const usersCount = await User.countDocuments()
    const role = usersCount === 0 ? 'superAdmin' : 'fieldOfficer'

    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      password,
      organization: organization || '',
      role,
    })

    const token = createToken(user._id)
    return res.status(201).json({
      token,
      user: toProfile(user),
    })
  } catch (error) {
    return res.status(500).json({ message: 'Registration failed' })
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Missing credentials' })
    }

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const valid = await user.comparePassword(password)
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = createToken(user._id)
    return res.json({
      token,
      user: toProfile(user),
    })
  } catch (error) {
    return res.status(500).json({ message: 'Login failed' })
  }
}

exports.me = async (req, res) => {
  return res.json({
    user: {
      uid: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      role: req.user.role,
      organization: req.user.organization || '',
      assignedProjects: req.user.assignedProjects || [],
      donorProjects: req.user.donorProjects || [],
      createdAt: req.user.createdAt,
    },
  })
}

