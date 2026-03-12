const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const connectDB = require('./config/db')

const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const projectRoutes = require('./routes/projectRoutes')
const schoolRoutes = require('./routes/schoolRoutes')
const distributionRoutes = require('./routes/distributionRoutes')
const donorRoutes = require('./routes/donorRoutes')
const settingRoutes = require('./routes/settingRoutes')

dotenv.config()

const app = express()

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  }),
)
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/schools', schoolRoutes)
app.use('/api/distributions', distributionRoutes)
app.use('/api/donors', donorRoutes)
app.use('/api/settings', settingRoutes)

const PORT = process.env.PORT || 5000

async function start() {
  try {
    await connectDB()
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`API running on http://localhost:${PORT}`)
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Server failed to start', error)
    process.exit(1)
  }
}

start()

