const express = require('express')
const { getDonors, createDonor } = require('../controllers/donorController')
const auth = require('../middleware/authMiddleware')
const allowRoles = require('../middleware/roleMiddleware')

const router = express.Router()

router.get('/', auth, allowRoles('superAdmin'), getDonors)
router.post('/', auth, allowRoles('superAdmin'), createDonor)

module.exports = router

