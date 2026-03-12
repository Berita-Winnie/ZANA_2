const express = require('express')
const {
  getDistributions,
  createDistribution,
  updateApproval,
} = require('../controllers/distributionController')
const auth = require('../middleware/authMiddleware')
const allowRoles = require('../middleware/roleMiddleware')

const router = express.Router()

router.get('/', auth, allowRoles('superAdmin', 'fieldOfficer', 'donor'), getDistributions)
router.post('/', auth, allowRoles('superAdmin', 'fieldOfficer'), createDistribution)
router.patch('/:id/approval', auth, allowRoles('superAdmin'), updateApproval)

module.exports = router

