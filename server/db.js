import dns from 'dns'
import mongoose from 'mongoose'

let connected = false

export async function connectDB() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.warn('Warning: MONGODB_URI not set. Registrations will not be saved to database.')
    return false
  }

  if (connected) return true

  // Some ISPs block SRV lookups; Google DNS resolves Atlas reliably
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1'])

  try {
    await mongoose.connect(uri)
    connected = true
    console.log('MongoDB connected')
    return true
  } catch (err) {
    console.error('MongoDB connection failed:', err.message)
    return false
  }
}

export function isDBConnected() {
  return connected && mongoose.connection.readyState === 1
}
