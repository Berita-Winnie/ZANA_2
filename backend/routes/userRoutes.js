const express = require('express')
const { getUsers, updateUserRole } = require('../controllers/userController')
const auth = require('../middleware/authMiddleware')
const allowRoles = require('../middleware/roleMiddleware')

const router = express.Router()

router.get('/', auth, allowRoles('superAdmin'), getUsers)
router.patch('/:id', auth, allowRoles('superAdmin'), updateUserRole)

module.exports = router

