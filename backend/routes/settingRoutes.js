const express = require('express')
const {
  getGeneralSettings,
  updateGeneralSettings,
  seedDemoData,
} = require('../controllers/settingController')
const auth = require('../middleware/authMiddleware')
const allowRoles = require('../middleware/roleMiddleware')

const router = express.Router()

router.get('/general', auth, allowRoles('superAdmin'), getGeneralSettings)
router.put('/general', auth, allowRoles('superAdmin'), updateGeneralSettings)
router.post('/seed', auth, allowRoles('superAdmin'), seedDemoData)

module.exports = router

