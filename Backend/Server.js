import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'

import authRoutes from './src/Routes/auth.js'
import patientRoutes from './src/Routes/patients.js'
import doctorRoutes from './src/Routes/doctors.js'
import adminRoutes from './src/Routes/admin.js'
import consentRoutes from './src/Routes/consent.js'
import dotenv from 'dotenv'
import './src/scheduleJobs/otpCleanup.js'

dotenv.config()
function getCorsOrigins () {
  const isProd = process.env.NODE_ENV === 'production'
  const raw = isProd
    ? process.env.CORS_ORIGIN_PROD
    : process.env.CORS_ORIGIN_DEV
  const fallback = 'http://localhost:5173'

  const list = (raw || fallback)
    .split(',')
    .map(s => s.trim().replace(/\/$/, '')) // 👈 Ye last wale '/' ko hata dega automatically
    .filter(Boolean)
  return list
}
const allowedOrigins = getCorsOrigins()

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(
  cors({
    origin (origin, callback) {
      if (!origin) return callback(null, true)

      // 💡 Origin ko check karne se pehle uska bhi aakhiri slash hata do
      const cleanedOrigin = origin.replace(/\/$/, '');
      if (allowedOrigins.includes(cleanedOrigin)) return callback(null, true)
      console.log('Blocked Origin:', origin);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  })
)

// mount routes
app.use('/api/auth', authRoutes)
app.use('/api/patients', patientRoutes)
app.use('/api/doctors', doctorRoutes)
app.use('/admin', adminRoutes)
app.use('/consents', consentRoutes)

// error handler
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err)
  const status = err.status || 500
  const message = err.message || 'Internal Server Error'

  res.status(status).json({
    success: false,
    message: message,
    field: err.field || null,
    data: err.data || null
  })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`🚀 Server running at ${PORT}`))

export default app
