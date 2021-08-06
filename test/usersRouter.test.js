const expect = require('chai').expect
const request = require('supertest')
const app = require('../app')
const testHelper = require('./testHelper')

describe('usersRouter authorization test', () => {
  testHelper.suiteSetup()
  const agent = request.agent(app)
  testHelper.postSignUp(agent)
  it('Get all users', (done) => {
    agent.get('/api/users')
      .then((res) => {
        expect(res.statusCode).to.equals(403)
        done()
      })
      .catch((err) => done(err))
  })
  testHelper.getLogout(agent)
  it('Get personal profile', (done) => {
    agent.get('/api/users/profile')
      .then((res) => {
        expect(res.statusCode).to.equals(401)
        done()
      })
      .catch((err) => done(err))
  })
  it('Delete personal profile', (done) => {
    agent.delete('/api/users/profile')
      .then((res) => {
        expect(res.statusCode).to.equals(401)
        done()
      })
      .catch((err) => done(err))
  })
  it('Modify personal profile', (done) => {
    agent.put('/api/users/profile')
      .then((res) => {
        expect(res.statusCode).to.equals(401)
        done()
      })
      .catch((err) => done(err))
  })
  it('Change password', (done) => {
    agent.put('/api/users/password')
      .then((res) => {
        expect(res.statusCode).to.equals(401)
        done()
      })
      .catch((err) => done(err))
  })
  it('Get favorite', (done) => {
    agent.get('/api/users/favorite')
      .then((res) => {
        expect(res.statusCode).to.equals(401)
        done()
      })
      .catch((err) => done(err))
  })
  it('Add favorite', (done) => {
    agent.post('/api/users/favorite')
      .then((res) => {
        expect(res.statusCode).to.equals(401)
        done()
      })
      .catch((err) => done(err))
  })
  it('Remove favorite', (done) => {
    agent.delete('/api/users/favorite')
      .then((res) => {
        expect(res.statusCode).to.equals(401)
        done()
      })
      .catch((err) => done(err))
  })
})

describe('usersRouter content test', () => {
  testHelper.suiteSetup()
  let ebookId
  const agent = request.agent(app)
  const adminAccount = {
    email: 'admin@gmail.com',
    password: 'Admin123'
  }
  const userAccount = {
    email: 'johndoe@gmail.com',
    password: 'J0hnny',
    firstname: 'John',
    lastname: 'Doe'
  }
  const updatedUserAccount = {
    email: 'janesmith@gmail.com',
    password: 'Janni3',
    firstname: 'Jane',
    lastname: 'smith'
  }
  testHelper.postSignUp(agent, {
    makeAdmin: true,
    body: adminAccount
  })
  testHelper.postEbook(agent, {
    expects: (res) => {
      ebookId = res.body._id
    }
  })
  testHelper.getLogout(agent)
  testHelper.postSignUp(agent, {
    body: userAccount
  })
  it('Add favorite ebook', (done) => {
    agent.post('/api/users/favorite')
      .send({ ebookId: ebookId })
      .then((res) => {
        expect(res.statusCode).to.equals(200)
        expect(res.body.favEBooks).to.include(ebookId)
        done()
      })
      .catch((err) => done(err))
  })
  it('Add favorite ebook avoid dulicate', (done) => {
    agent.post('/api/users/favorite')
      .send({ ebookId: ebookId })
      .then((res) => {
        expect(res.statusCode).to.equals(200)
        expect(res.body.favEBooks).to.include(ebookId)
        expect(res.body.favEBooks).to.have.lengthOf(1)
        done()
      })
      .catch((err) => done(err))
  })
  it('Get favorite ebook', (done) => {
    agent.get('/api/users/favorite')
      .then((res) => {
        expect(res.statusCode).to.equals(200)
        expect(res.body.filter((ebook) => ebook._id === ebookId)[0].liked).to.equals(1)
        done()
      })
      .catch((err) => done(err))
  })
  it('Get profile', (done) => {
    agent.get('/api/users/profile')
      .then((res) => {
        expect(res.statusCode).to.equals(200)
        expect(res.body).to.include({
          firstname: userAccount.firstname,
          lastname: userAccount.lastname,
          email: userAccount.email,
          admin: false
        })
        expect(res.body.favEBooks).to.include(ebookId)
        done()
      })
      .catch((err) => done(err))
  })
  it('Put profile', (done) => {
    agent.put('/api/users/profile')
      .send({
        firstname: updatedUserAccount.firstname,
        lastname: updatedUserAccount.lastname,
        email: updatedUserAccount.email
      })
      .then((res) => {
        expect(res.statusCode).to.equals(200)
        expect(res.body).to.include({
          firstname: updatedUserAccount.firstname,
          lastname: updatedUserAccount.lastname,
          email: updatedUserAccount.email
        })
        done()
      })
      .catch((err) => done(err))
  })
  it('Remove favorite ebook', (done) => {
    agent.delete('/api/users/favorite')
      .send({ ebookId: ebookId })
      .then((res) => {
        expect(res.statusCode).to.equals(200)
        expect(res.body.favEBooks).to.have.lengthOf(0)
        done()
      })
      .catch((err) => done(err))
  })
  it('Remove favorite ebook avoid duplicate', (done) => {
    agent.delete('/api/users/favorite')
      .send({ ebookId: ebookId })
      .then((res) => {
        expect(res.statusCode).to.equals(200)
        expect(res.body.favEBooks).to.have.lengthOf(0)
        done()
      })
      .catch((err) => done(err))
  })
  it('Check removed like', (done) => {
    agent.get('/api/ebooks')
      .then((res) => {
        expect(res.statusCode).to.equals(200)
        expect(res.body.filter((ebook) => ebook._id === ebookId)[0].liked).to.equals(0)
        done()
      })
      .catch((err) => done(err))
  })
  it('Get profile', (done) => {
    agent.get('/api/users/profile')
      .then((res) => {
        expect(res.statusCode).to.equals(200)
        expect(res.body).to.include({
          firstname: updatedUserAccount.firstname,
          lastname: updatedUserAccount.lastname,
          email: updatedUserAccount.email
        })
        expect(res.body.favEBooks).to.have.lengthOf(0)
        done()
      })
      .catch((err) => done(err))
  })
  it('Change the password', (done) => {
    agent.put('/api/users/password')
      .send({
        oldPassword: userAccount.password,
        newPassword: updatedUserAccount.password
      })
      .then((res) => {
        expect(res.statusCode).to.equals(200)
        done()
      })
      .catch((err) => done(err))
  })
  testHelper.getUser(agent, {
    expectedStatus: 401
  })
  testHelper.postLogIn(agent, {
    body: adminAccount
  })
  it('Get all profiles', (done) => {
    agent.get('/api/users')
      .then((res) => {
        expect(res.statusCode).to.equals(200)
        expect(res.body).to.have.lengthOf(2)
        done()
      })
      .catch((err) => done(err))
  })
  testHelper.getLogout(agent)
  testHelper.postLogIn(agent, {
    body: updatedUserAccount
  })
  it('Delete account', (done) => {
    agent.delete('/api/users/profile')
      .then((res) => {
        expect(res.statusCode).to.equals(200)
        done()
      })
      .catch((err) => done(err))
  })
  testHelper.getUser(agent, {
    expectedStatus: 401
  })
  testHelper.postLogIn(agent, {
    body: adminAccount
  })
  it('Get all profiles', (done) => {
    agent.get('/api/users')
      .then((res) => {
        expect(res.statusCode).to.equals(200)
        expect(res.body).to.have.lengthOf(1)
        done()
      })
      .catch((err) => done(err))
  })
  testHelper.getLogout(agent)
})
