const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')

const app = express()
app.use(cors())
app.use(bodyParser.json())

const path = require('path')
const PORT = process.env.PORT || 4000
const JWT_SECRET = 'super-secret-demo-key'

// in-memory refresh token store (for demo only)
let refreshTokens = []

// demo user
const demoUser = { id: '1', name: 'Demo User', email: 'demo@example.com' }

function generateAccessToken(user) {
  // short lived access token
  return jwt.sign({ sub: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '30s' })
}

function generateRefreshToken(user) {
  // longer lived refresh token
  const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '7d' })
  refreshTokens.push(token)
  return token
}

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body
  console.log('POST /auth/login', { email })
  // simple demo auth: accept password 'password', and matching email
  if (email === demoUser.email && password === 'password') {
    console.log('  -> credentials OK')
    const accessToken = generateAccessToken(demoUser)
    const refreshToken = generateRefreshToken(demoUser)
    return res.json({ accessToken, refreshToken, user: demoUser })
  }
  console.log('  -> invalid credentials')
  return res.status(401).json({ message: 'Invalid credentials' })
})

app.post('/auth/refresh', (req, res) => {
  const { refreshToken } = req.body
  console.log('POST /auth/refresh', { hasToken: !!refreshToken })
  if (!refreshToken) return res.status(400).json({ message: 'Missing refresh token' })
  if (!refreshTokens.includes(refreshToken)) return res.status(403).json({ message: 'Invalid refresh token' })
  try {
    const payload = jwt.verify(refreshToken, JWT_SECRET)
    // payload.sub contains user id
    const user = demoUser // in real app lookup by id
    const accessToken = generateAccessToken(user)
    return res.json({ accessToken })
  } catch (e) {
    return res.status(403).json({ message: 'Refresh token expired or invalid' })
  }
})

app.post('/auth/logout', (req, res) => {
  const { refreshToken } = req.body
  if (refreshToken) refreshTokens = refreshTokens.filter(t => t !== refreshToken)
  return res.json({ ok: true })
})

function authenticateToken(req, res, next) {
  const auth = req.headers['authorization']
  if (!auth) return res.status(401).json({ message: 'Missing authorization header' })
  const parts = auth.split(' ')
  if (parts.length !== 2) return res.status(401).json({ message: 'Invalid auth header' })
  const token = parts[1]
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = payload
    next()
  } catch (e) {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

app.get('/protected/user', authenticateToken, (req, res) => {
  console.log('GET /protected/user for', req.user && req.user.sub)
  // return demo user info
  res.json(demoUser)
})
// Serve client in production (optional)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'dist')))
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`Mock auth server listening on http://localhost:${PORT}`)
})
