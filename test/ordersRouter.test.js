const expect = require('chai').expect
const request = require('supertest')
const app = require('../app')
const testHelper = require('./testHelper')

describe('ordersRouter authentication test', () => {
  testHelper.suiteSetup()
  const agent = request.agent(app)
  it('Get own orders', (done) => {
    agent.get('/api/orders')
      .then((res) => {
        expect(res.statusCode).to.equals(401)
        done()
      })
      .catch((err) => done(err))
  })
  it('Post an order', (done) => {
    agent.post('/api/orders')
      .then((res) => {
        expect(res.statusCode).to.equals(401)
        done()
      })
      .catch((err) => done(err))
  })
  testHelper.postSignUp(agent)
  it('Get all orders as admin', (done) => {
    agent.get('/api/orders/admin')
      .then((res) => {
        expect(res.statusCode).to.equals(403)
        done()
      })
      .catch((err) => done(err))
  })
  it('Get report as admin', (done) => {
    agent.get('/api/orders/report')
      .then((res) => {
        expect(res.statusCode).to.equals(403)
        done()
      })
      .catch((err) => done(err))
  })
  testHelper.getLogout(agent)
})

describe('ordersRouter content test', () => {
  testHelper.suiteSetup()
  const agent = request.agent(app)
  const today = new Date()
  let ebookOneId
  const ebookOne = {
    name: 'Book1',
    author: 'Author',
    price: 16.56,
    description: 'Description',
    ISBN: '1234567890'
  }
  let ebookTwoId
  const ebookTwo = {
    name: 'Book2',
    author: 'Author',
    price: 25,
    description: 'Description',
    ISBN: '0987654321'
  }
  const userOneAccount = {
    email: 'user1@gmail.com',
    password: 'Password123',
    firstname: 'User',
    lastname: 'One'
  }
  const userTwoAccount = {
    email: 'user2@gmail.com',
    password: 'Password123',
    firstname: 'User',
    lastname: 'Two'
  }
  testHelper.postSignUp(agent, {
    makeAdmin: true
  })
  testHelper.postEbook(agent, {
    body: ebookOne,
    expects: (res) => {
      ebookOneId = res.body._id
    }
  })
  testHelper.postEbook(agent, {
    body: ebookTwo,
    expects: (res) => {
      ebookTwoId = res.body._id
    }
  })
  testHelper.postSignUp(agent, {
    body: userOneAccount
  })
  it('Post order of two books', (done) => {
    agent.post('/api/orders')
      .send({
        ebookIds: [ebookOneId, ebookTwoId]
      })
      .then((res) => {
        expect(res.statusCode).to.equals(200)
        done()
      })
      .catch((err) => done(err))
  })
  it('Get previous order', (done) => {
    agent.get('/api/orders')
      .then((res) => {
        expect(res.statusCode).to.equals(200)
        expect(res.body[0].amount).to.equals(41.56)
        done()
      })
      .catch((err) => done(err))
  })
  it('Check owned ebook', (done) => {
    agent.get('/api/users/profile')
      .then((res) => {
        expect(res.statusCode).to.equals(200)
        expect(res.body.ownedEBooks).to.have.members([ebookOneId, ebookTwoId])
        done()
      })
      .catch((err) => done(err))
  })
  testHelper.getLogout(agent)
  testHelper.postSignUp(agent, {
    body: userTwoAccount
  })
  it('Post order of one book', (done) => {
    agent.post('/api/orders')
      .send({
        ebookIds: [ebookOneId]
      })
      .then((res) => {
        expect(res.statusCode).to.equals(200)
        done()
      })
      .catch((err) => done(err))
  })
  testHelper.getLogout(agent)
  it('Check book one sold info', (done) => {
    agent.get(`/api/ebooks/single/${ebookOneId}`)
      .query({ ebookId: ebookOneId })
      .then((res) => {
        expect(res.statusCode).to.equals(200)
        expect(res.body.sold).to.equals(2)
        done()
      })
      .catch((err) => done(err))
  })
  it('Check book two sold info', (done) => {
    agent.get(`/api/ebooks/single/${ebookTwoId}`)
      .then((res) => {
        expect(res.statusCode).to.equals(200)
        expect(res.body.sold).to.equals(1)
        done()
      })
      .catch((err) => done(err))
  })
  testHelper.postLogIn(agent)
  it('Get orders from everyone', (done) => {
    agent.get('/api/orders/admin')
      .then((res) => {
        expect(res.statusCode).to.equals(200)
        expect(res.body).to.be.an('array')
        expect(res.body).to.have.lengthOf(2)
        done()
      })
      .catch((err) => done(err))
  })
  it('Get report for current month', (done) => {
    agent.get('/api/orders/report')
      .send({ month: today.getMonth() + 1, year: today.getFullYear() })
      .then((res) => {
        expect(res.statusCode).to.equals(200)
        expect(res.body.totalCount).to.equals(3)
        expect(res.body.revenue).to.equals(58.12)
        done()
      })
      .catch((err) => done(err))
  })
  testHelper.getLogout(agent)
})
