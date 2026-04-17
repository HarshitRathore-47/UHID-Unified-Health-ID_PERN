import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import net from 'net'
import dotenv from 'dotenv'
import './src/scheduleJobs/otpCleanup.js'

// Routes
import authRoutes from './src/Routes/auth.js'
import patientRoutes from './src/Routes/patients.js'
import doctorRoutes from './src/Routes/doctors.js'
import adminRoutes from './src/Routes/admin.js'
import consentRoutes from './src/Routes/consent.js'

dotenv.config()

const app = express()

// --- 1. CORS DEBUGGING & CONFIG ---
function getCorsOrigins() {
  const isProd = process.env.NODE_ENV === 'production'
  console.log('--- [DEBUG] CORS CONFIG START ---')
  console.log('NODE_ENV:', process.env.NODE_ENV)

  const raw = isProd ? process.env.CORS_ORIGIN_PROD : process.env.CORS_ORIGIN_DEV
  console.log('RAW ENV VALUE:', `"${raw}"`)

  const fallback = 'http://localhost:5173'
  const list = (raw || fallback)
    .split(',')
    .map(s => s.trim().replace(/\/$/, '').replace(/['"`\s]/g, ''))
    .filter(Boolean)

  console.log('FINAL ALLOWED LIST:', list)
  console.log('--- [DEBUG] CORS CONFIG END ---')
  return list
}

const allowedOrigins = getCorsOrigins()

app.use(cors({
  origin: (origin, callback) => {
    // Debugging: Log every incoming request's origin
    console.log(`[CORS Request] Origin: ${origin || 'Server-to-Server'}`)

    if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ''))) {
      callback(null, true)
    } else {
      console.error(`[CORS BLOCKED] Origin mismatch: ${origin}`)
      callback(null, false)
    }
  },
  credentials: true,
  optionsSuccessStatus: 200 // Best for OPTIONS preflight success
}))

// --- 2. NETWORK DEBUG ROUTE ---
app.get("/test-network", (req, res) => {
  console.log("[DEBUG] Testing SMTP Network connection...")
  const s = new net.Socket()
  s.setTimeout(5000)
  s.on('connect', () => { s.destroy(); res.send("✅ Port 2525 is OPEN on Brevo!"); })
    .on('timeout', () => { s.destroy(); res.send("❌ Port BLOCKED (Timeout)"); })
    .on('error', (e) => { s.destroy(); res.send("❌ Error: " + e.message); })
    .connect(2525, 'smtp-relay.brevo.com') // Using your Brevo port
})

// --- 3. MIDDLEWARES ---
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// --- 4. ROUTES ---
app.use('/api/auth', authRoutes)
app.use('/api/patients', patientRoutes)
app.use('/api/doctors', doctorRoutes)
app.use('api/admin', adminRoutes)
app.use('/consents', consentRoutes)

// --- 5. GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
  console.error('--- [SERVER ERROR] ---')
  console.error(err)

  if (err.name === 'ZodError' || err.issues) {
    return res.status(400).json({
      success: false,
      message: err.issues?.[0]?.message || 'Validation failed',
      errors: err.issues // Pura error list taaki frontend detailed validation dikha sake
    })
  }
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    data: err.data || null
  })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`🚀 Server is LIVE at port ${PORT}`)
  console.log(`🌍 NODE_ENV is set to: ${process.env.NODE_ENV}`)
})

export default app