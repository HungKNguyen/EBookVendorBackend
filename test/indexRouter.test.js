const expect = require('chai').expect
const request = require('supertest')
const app = require('../app')
const testHelper = require('../testHelper')

describe('indexRouter testing: No authorization', () => {
  testHelper.suiteSetup()
  const agent = request.agent(app)
  testHelper.getPublic(agent)
  testHelper.getUser(agent, { expectedStatus: 401 })
  testHelper.getAdmin(agent, { expectedStatus: 401 })
})

describe('indexRouter testing: User authorization', () => {
  testHelper.suiteSetup()
  const agent = request.agent(app)
  testHelper.postSignUp(agent, {
    expects: (res) => {
      expect(res.headers).to.include.keys('set-cookie')
    }
  })
  testHelper.getPublic(agent)
  testHelper.getUser(agent)
  testHelper.getAdmin(agent, { expectedStatus: 403 })
  testHelper.getLogout(agent, {
    expects: (res) => {
      expect(res.headers).to.include.keys('set-cookie')
    }
  })
  testHelper.getUser(agent, { expectedStatus: 401 })
  testHelper.postLogIn(agent, {
    expects: (res) => {
      expect(res.headers).to.include.keys('set-cookie')
    }
  })
  testHelper.getUser(agent)
  testHelper.getLogout(agent, {
    expects: (res) => {
      expect(res.headers).to.include.keys('set-cookie')
    }
  })
})

describe('indexRouter testing: Admin authorization', () => {
  testHelper.suiteSetup()
  const agent = request.agent(app)
  testHelper.postSignUp(agent, {
    makeAdmin: true,
    expects: (res) => {
      expect(res.headers).to.include.keys('set-cookie')
    }
  })
  testHelper.getPublic(agent)
  testHelper.getUser(agent)
  testHelper.getAdmin(agent)
  testHelper.getLogout(agent, {
    expects: (res) => {
      expect(res.headers).to.include.keys('set-cookie')
    }
  })
  testHelper.getAdmin(agent, { expectedStatus: 401 })
  testHelper.postLogIn(agent, {
    expects: (res) => {
      expect(res.headers).to.include.keys('set-cookie')
    }
  })
  testHelper.getAdmin(agent)
  testHelper.getLogout(agent, {
    expects: (res) => {
      expect(res.headers).to.include.keys('set-cookie')
    }
  })
})

describe('indexRouter testing: Failed Sign Up and Log in', () => {
  testHelper.suiteSetup()
  const agent = request.agent(app)
  testHelper.postSignUp(agent, {
    expects: (res) => {
      expect(res.headers).to.include.keys('set-cookie')
    }
  })
  testHelper.getLogout(agent, {
    expects: (res) => {
      expect(res.headers).to.include.keys('set-cookie')
    }
  })
  // Intentional Wrong Login
  testHelper.postLogIn(agent, {
    expectedStatus: 401,
    expects: (res) => {
      expect(res.headers).to.not.include.keys('set-cookie')
    },
    body: {
      email: 'johndoe@gmail.com',
      password: 'WrongPassword'
    }
  })
  // Intentional Duplicate Sign Up
  testHelper.postSignUp(agent, {
    expectedStatus: 500,
    expects: (res) => {
      expect(res.headers).to.not.include.keys('set-cookie')
    },
    body: {
      email: 'johndoe@gmail.com',
      password: 'AnotherPassword'
    }
  })
})
