const expect = require('chai').expect
const request = require('supertest')
const app = require('../app')
const testHelper = require('../testHelper')


describe('indexRouter testing: No authorization', () => {
    testHelper.suiteSetup();
    const agent = request.agent(app);
    testHelper.getPublic200(agent);
    testHelper.getUser401(agent);
    testHelper.getAdmin401(agent);
})

describe('indexRouter testing: User authorization', () => {
    testHelper.suiteSetup();
    const agent = request.agent(app);
    testHelper.postSignUpUser200(agent);
    testHelper.getPublic200(agent);
    testHelper.getUser200(agent);
    testHelper.getAdmin403(agent);
    testHelper.getLogout200(agent);
    testHelper.getUser401(agent);
    testHelper.postLogIn200(agent);
    testHelper.getUser200(agent);
    testHelper.getLogout200(agent);
})

describe('indexRouter testing: Admin authorization', () => {
    testHelper.suiteSetup();
    const agent = request.agent(app);
    testHelper.postSignUpAdmin200(agent);
    testHelper.getPublic200(agent);
    testHelper.getUser200(agent);
    testHelper.getAdmin200(agent);
    testHelper.getLogout200(agent);
    testHelper.getAdmin401(agent);
    testHelper.postLogIn200(agent);
    testHelper.getAdmin200(agent);
    testHelper.getLogout200(agent);
})

describe('Failed Sign Up and Log in', () => {
    testHelper.suiteSetup();
    const agent = request.agent(app);
    testHelper.postSignUpUser200(agent);
    testHelper.getLogout200(agent);
    it('Failed Log In', (done) => {
        agent.post('/api/login')
            .send({
                email: "johndoe@gmail.com",
                password: "WrongPassword"
            })
            .then((res) => {
                expect(res.statusCode).to.equals(401)
                expect(res.headers).to.not.include.keys("set-cookie")
                done();
            })
            .catch((err) => done(err))
    });
    it('Failed Sign up due to same email', (done) => {
        agent.post('/api/signup')
            .send({
                email: "johndoe@gmail.com",
                password: "AnotherPassword"
            })
            .then((res) => {
                expect(res.statusCode).to.equals(500)
                done();
            })
            .catch((err) => done(err))
    });
})