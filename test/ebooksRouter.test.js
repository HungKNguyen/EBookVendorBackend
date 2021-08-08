const expect = require('chai').expect
const request = require('supertest')
const app = require('../app')
const testHelper = require('./testHelper')
const mongoose = require('mongoose')

describe('ebooksRouter authorization test', (done) => {
  testHelper.suiteSetup()
  const agent = request.agent(app)
  testHelper.postSignUp(agent)
  testHelper.postEbook(agent, { expectedStatus: 403 })
  it('Changing the existing ebook', (done) => {
    agent.put('/api/ebooks')
      .then((res) => {
        expect(res.statusCode).to.equals(403)
        done()
      })
      .catch((err) => done(err))
  })
  it('Delete the ebook', (done) => {
    agent.delete('/api/ebooks')
      .then((res) => {
        expect(res.statusCode).to.equals(403)
        done()
      })
      .catch((err) => done(err))
  })
  testHelper.getLogout(agent)
})

describe('ebooksRouter content test', (done) => {
  testHelper.suiteSetup()
  let ebookId
  const ebook = {
    name: 'Name',
    author: 'Author',
    price: 69,
    description: 'Description',
    ISBN: '1234567890'
  }
  const updateEbook = {
    name: 'New Name',
    author: 'New Author',
    price: 420,
    description: 'New Description',
    ISBN: '0987654321'
  }
  const agent = request.agent(app)
  testHelper.postSignUp(agent, { makeAdmin: true })
  it('Testing favorite function', (done) => {
    const array = [
      { title: 'A', liked: 2 },
      { title: 'B', liked: 1 },
      { title: 'C', liked: 6 },
      { title: 'D', liked: 4 },
      { title: 'E', liked: 7 }
    ]
    mongoose.connection.db.collection('ebooks').insertMany(array)
      .then(() => {
        return agent.get('/api/ebooks/favorite')
      })
      .then((res) => {
        expect(res.statusCode).to.equals(200)
        expect(res.body).to.be.an('array')
        expect(res.body.length).to.equal(3)
        expect(res.body[0]).to.have.property('title', 'E')
        expect(res.body[1]).to.have.property('title', 'C')
        expect(res.body[2]).to.have.property('title', 'D')
        done()
      })
      .then(() => {
        mongoose.connection.db.dropCollection('ebooks')
      })
      .catch((err) => done(err))
  })
  testHelper.postEbook(agent, {
    body: ebook,
    expects: (res) => {
      expect(res.body).to.include(ebook)
      ebookId = res.body._id
    }
  })
  it('Getting ebooks, expecting one', (done) => {
    agent.get('/api/ebooks')
      .then((res) => {
        expect(res.statusCode).to.equals(200)
        expect(res.body).to.be.an('array')
        expect(res.body.length).to.equal(1)
        expect(res.body.filter((ebook) => ebook._id === ebookId)[0]).to.include(ebook)
        done()
      })
      .catch((err) => done(err))
  })
  it('Test getting specific ebook', (done) => {
    agent.get(`/api/ebooks/single/${ebookId}`)
      .then((res) => {
        expect(res.statusCode).to.equals(200)
        expect(res.body).to.include(ebook)
        done()
      })
      .catch((err) => done(err))
  })
  it('Changing the existing ebook', (done) => {
    agent.put('/api/ebooks')
      .send({
        ebookId: ebookId,
        ...updateEbook
      })
      .then((res) => {
        expect(res.statusCode).to.equals(200)
        expect(res.body).to.include(updateEbook)
        done()
      })
      .catch((err) => done(err))
  })
  it('Getting ebooks, expecting change', (done) => {
    agent.get('/api/ebooks')
      .then((res) => {
        expect(res.statusCode).to.equals(200)
        expect(res.body).to.be.an('array')
        expect(res.body.length).to.equal(1)
        expect(res.body.filter((ebook) => ebook._id === ebookId)[0]).to.include(updateEbook)
        done()
      })
      .catch((err) => done(err))
  })
  it('Delete the ebook', (done) => {
    agent.delete('/api/ebooks')
      .send({ ebookId: ebookId })
      .then((res) => {
        expect(res.statusCode).to.equals(200)
        done()
      })
      .catch((err) => done(err))
  })
  it('Getting ebooks, expecting none', (done) => {
    agent.get('/api/ebooks')
      .then((res) => {
        expect(res.statusCode).to.equals(200)
        expect(res.body).to.be.an('array')
        expect(res.body.length).to.equal(0)
        done()
      })
      .catch((err) => done(err))
  })
  testHelper.getLogout(agent)
})
