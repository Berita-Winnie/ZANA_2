const express = require('express')
const { getSchools, createSchool } = require('../controllers/schoolController')
const auth = require('../middleware/authMiddleware')
const allowRoles = require('../middleware/roleMiddleware')

const router = express.Router()

router.get('/', auth, allowRoles('superAdmin', 'fieldOfficer', 'donor'), getSchools)
router.post('/', auth, allowRoles('superAdmin', 'fieldOfficer'), createSchool)

module.exports = router

