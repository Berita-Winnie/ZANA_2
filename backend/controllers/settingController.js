const Setting = require('../models/Setting')
const School = require('../models/School')
const Project = require('../models/Project')
const Distribution = require('../models/Distribution')

exports.getGeneralSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne()
    if (!settings) {
      settings = await Setting.create({
        organizationName: '',
        resourceCategories: [],
      })
    }
    return res.json(settings)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch settings' })
  }
}

exports.updateGeneralSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne()
    if (!settings) {
      settings = await Setting.create(req.body)
    } else {
      settings.organizationName = req.body.organizationName || ''
      settings.resourceCategories = req.body.resourceCategories || []
      await settings.save()
    }
    return res.json(settings)
  } catch (error) {
    return res.status(400).json({ message: 'Failed to update settings' })
  }
}

exports.seedDemoData = async (req, res) => {
  try {
    const [kijiji, hope] = await School.insertMany([
      {
        name: 'Kijiji Girls Secondary',
        location: 'Nairobi, Kenya',
        girlsCount: 320,
      },
      {
        name: 'Hope Valley Primary',
        location: 'Kisumu, Kenya',
        girlsCount: 210,
      },
    ])

    const [dignity, education] = await Project.insertMany([
      {
        name: 'Dignity Kits 2025',
        description: 'Provision of sanitary pads and underwear to partner schools.',
        donors: ['Zana Africa', 'Global Fund'],
        resourcesAllocated: 5000,
        resourcesRemaining: 3800,
        schoolsCovered: ['Kijiji Girls Secondary', 'Hope Valley Primary'],
        status: 'active',
        startDate: '2025-01-15',
        endDate: '2025-12-15',
      },
      {
        name: 'Menstrual Health Education',
        description: 'Workshops and educational materials for adolescent girls.',
        donors: ['UNICEF'],
        resourcesAllocated: 2000,
        resourcesRemaining: 1600,
        schoolsCovered: ['Kijiji Girls Secondary'],
        status: 'active',
        startDate: '2025-03-01',
        endDate: '2025-09-30',
      },
    ])

    await Distribution.insertMany([
      {
        schoolId: kijiji._id,
        projectId: dignity._id,
        resourceType: 'Sanitary pads',
        quantity: 600,
        girlsImpacted: 280,
        date: '2025-02-10',
        location: 'Nairobi',
        notes: '',
        submittedBy: req.user._id,
        approvalStatus: 'approved',
      },
      {
        schoolId: hope._id,
        projectId: dignity._id,
        resourceType: 'Sanitary pads',
        quantity: 400,
        girlsImpacted: 190,
        date: '2025-02-15',
        location: 'Kisumu',
        notes: '',
        submittedBy: req.user._id,
        approvalStatus: 'approved',
      },
      {
        schoolId: kijiji._id,
        projectId: education._id,
        resourceType: 'Education session',
        quantity: 5,
        girlsImpacted: 150,
        date: '2025-03-20',
        location: 'Nairobi',
        notes: '',
        submittedBy: req.user._id,
        approvalStatus: 'pending',
      },
    ])

    return res.json({ message: 'Demo data seeded successfully' })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to seed demo data' })
  }
}

