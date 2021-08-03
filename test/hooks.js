const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')

let mongod
exports.mochaHooks = {
  beforeAll: async function () {
    mongod = await MongoMemoryServer.create()
    const uri = mongod.getUri()
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    })
  },
  afterAll: async function () {
    await mongoose.connection.close()
    await mongod.stop()
  }
}
