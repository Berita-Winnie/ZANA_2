const express = require('express')
const {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController')
const auth = require('../middleware/authMiddleware')
const allowRoles = require('../middleware/roleMiddleware')

const router = express.Router()

router.get('/', auth, allowRoles('superAdmin', 'fieldOfficer', 'donor'), getProjects)
router.post('/', auth, allowRoles('superAdmin'), createProject)
router.put('/:id', auth, allowRoles('superAdmin'), updateProject)
router.delete('/:id', auth, allowRoles('superAdmin'), deleteProject)

module.exports = router

