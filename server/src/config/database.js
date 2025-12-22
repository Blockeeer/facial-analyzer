import mongoose from 'mongoose'

export async function connectDatabase() {
  const mongoUri = process.env.MONGODB_URI

  if (!mongoUri) {
    console.warn('⚠️  MONGODB_URI not set, running without database')
    console.warn('⚠️  Authentication features will not work!')
    return
  }

  console.log('🔄 Connecting to MongoDB...')
  console.log(`📍 URI: ${mongoUri.replace(/\/\/.*@/, '//***:***@')}`) // Hide credentials in logs

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      socketTimeoutMS: 45000,
    })

    console.log('✅ Connected to MongoDB successfully!')
    console.log(`📦 Database: ${mongoose.connection.name}`)
    console.log(`🖥️  Host: ${mongoose.connection.host}:${mongoose.connection.port}`)

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message)
    })

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...')
    })

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected!')
    })

  } catch (error) {
    console.error('❌ Failed to connect to MongoDB!')
    console.error(`   Error: ${error.message}`)

    if (error.message.includes('ECONNREFUSED')) {
      console.error('💡 Tip: Make sure MongoDB is running on your machine')
      console.error('   - Windows: Start "MongoDB Server" service or run "mongod"')
      console.error('   - Or use MongoDB Atlas cloud: https://cloud.mongodb.com/')
    } else if (error.message.includes('authentication failed')) {
      console.error('💡 Tip: Check your MongoDB username and password in .env')
    } else if (error.message.includes('ETIMEDOUT')) {
      console.error('💡 Tip: Connection timed out. Check your network or MongoDB Atlas whitelist')
    }

    process.exit(1)
  }
}

export async function disconnectDatabase() {
  await mongoose.disconnect()
  console.log('👋 Disconnected from MongoDB')
}
