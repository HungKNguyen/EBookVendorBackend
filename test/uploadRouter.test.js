const expect = require('chai').expect
const request = require('supertest')
const app = require('../app')
const testHelper = require('./testHelper')
const fs = require('fs')

describe('uploadRouter authentication test', () => {
  testHelper.suiteSetup()
  const agent = request.agent(app)
  it('Add user profile', (done) => {
    agent.post('/api/upload/imgUser')
      .then((res) => {
        expect(res.statusCode).to.equals(401)
        done()
      })
      .catch((err) => done(err))
  })
  it('Remove user profile', (done) => {
    agent.delete('/api/upload/imgUser')
      .then((res) => {
        expect(res.statusCode).to.equals(401)
        done()
      })
      .catch((err) => done(err))
  })
  testHelper.postSignUp(agent)
  it('Add ebook picture', (done) => {
    agent.post('/api/upload/imgEbook')
      .then((res) => {
        expect(res.statusCode).to.equals(403)
        done()
      })
      .catch((err) => done(err))
  })
  it('Remove ebook picture', (done) => {
    agent.delete('/api/upload/imgEbook')
      .then((res) => {
        expect(res.statusCode).to.equals(403)
        done()
      })
      .catch((err) => done(err))
  })
})

describe('uploadRouter content test', () => {
  testHelper.suiteSetup()
  const agent = request.agent(app)
  let ebookId
  let filePath
  const fileSrc = 'test/mockImgs/img.jpg'
  const textSrc = 'test/mockImgs/text.txt'
  testHelper.postSignUp(agent, {
    makeAdmin: true
  })
  testHelper.postEbook(agent, {
    expects: (res) => {
      ebookId = res.body._id
    }
  })
  it('Add user profile', (done) => {
    agent.post('/api/upload/imgUser')
      .attach('imageFile', fileSrc)
      .then((res) => {
        expect(res.statusCode).to.equals(200)
        filePath = res.body.image
        expect(fs.existsSync(filePath)).to.be.true
        done()
      })
      .catch((err) => done(err))
  })
  it('Add user profile overwrite', (done) => {
    agent.post('/api/upload/imgUser')
      .attach('imageFile', fileSrc)
      .then((res) => {
        expect(res.statusCode).to.equals(200)
        expect(fs.existsSync(filePath)).to.be.false
        filePath = res.body.image
        expect(fs.existsSync(filePath)).to.be.true
        done()
      })
      .catch((err) => done(err))
  })
  it('Remove user profile', (done) => {
    agent.delete('/api/upload/imgUser')
      .then((res) => {
        expect(res.statusCode).to.equals(200)
        expect(res.body.image).to.equals('')
        expect(fs.existsSync(filePath)).to.be.false
        done()
      })
      .catch((err) => done(err))
  })
  it('Add ebook picture', (done) => {
    agent.post('/api/upload/imgEbook')
      .field('ebookId', ebookId)
      .attach('imageFile', fileSrc)
      .then((res) => {
        expect(res.statusCode).to.equals(200)
        filePath = res.body.image
        expect(fs.existsSync(filePath)).to.be.true
        done()
      })
      .catch((err) => done(err))
  })
  it('Add ebook picture overwrite', (done) => {
    agent.post('/api/upload/imgEbook')
      .field('ebookId', ebookId)
      .attach('imageFile', fileSrc)
      .then((res) => {
        expect(res.statusCode).to.equals(200)
        expect(fs.existsSync(filePath)).to.be.false
        filePath = res.body.image
        expect(fs.existsSync(filePath)).to.be.true
        done()
      })
      .catch((err) => done(err))
  })
  it('Remove ebook picture', (done) => {
    agent.delete('/api/upload/imgEbook')
      .field('ebookId', ebookId)
      .then((res) => {
        expect(res.statusCode).to.equals(200)
        expect(res.body.image).to.equals('')
        expect(fs.existsSync(filePath)).to.be.false
        done()
      })
      .catch((err) => done(err))
  })
  it('Add non image file for user profile', (done) => {
    agent.post('/api/upload/imgUser')
      .attach('imageFile', textSrc)
      .then((res) => {
        expect(res.statusCode).to.equals(500)
        done()
      })
      .catch((err) => done(err))
  })
  it('Add non image file for ebook', (done) => {
    agent.post('/api/upload/imgEbook')
      .field('ebookId', ebookId)
      .attach('imageFile', textSrc)
      .then((res) => {
        expect(res.statusCode).to.equals(500)
        done()
      })
      .catch((err) => done(err))
  })
  testHelper.getLogout(agent)
})
