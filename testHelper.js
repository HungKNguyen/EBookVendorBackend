const mongoose = require('mongoose')
const config = require('./config')
const expect = require('chai').expect

//Basic set up, start test suite by connect and end by disconnect
exports.suiteSetup = () => {
    before((done) => {
        mongoose.connect(config.mongoTestUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        })
            .then(() => done())
            .catch((err) => done(err))
    })
    after((done) => {
        mongoose.connection.db.dropDatabase()
            .then(  mongoose.disconnect )
            .then(() => done())
            .catch((err) => done(err))
    })
}

//GET request for typical public info, expect 200 status code
exports.getPublic200 = (agent) => it('Getting public resource', (done) => {
    agent.get('/api/public')
        .then((res) => {
            expect(res.statusCode).to.equals(200);
            done();
        })
        .catch((err) => done(err))
});

//GET request for typical user info, expect 200 status code
exports.getUser200 = (agent) => it('Getting user resource', (done) => {
    agent.get('/api/secret')
        .then((res) => {
            expect(res.statusCode).to.equals(200);
            done();
        })
        .catch((err) => done(err))
});

//GET request for typical public info, expect 401 status code due to lack of authorization
exports.getUser401 = (agent) => it('Getting user resource', (done) => {
    agent.get('/api/secret')
        .then((res) => {
            expect(res.statusCode).to.equals(401);
            done();
        })
        .catch((err) => done(err))
});

//GET request for typical admin info, expect 200 status code
exports.getAdmin200 = (agent) => it('Getting admin resource', (done) => {
    agent.get('/api/supersecret')
        .then((res) => {
            expect(res.statusCode).to.equals(200);
            done();
        })
        .catch((err) => done(err))
});

//GET request for typical admin info, expect 401 status code due to lack of authorization
exports.getAdmin401 = (agent) => it('Getting admin resource', (done) => {
    agent.get('/api/supersecret')
        .then((res) => {
            expect(res.statusCode).to.equals(401);
            done()
        })
        .catch((err) => done(err))
});

//GET request for typical admin info, expect 403 status code due to lack of permission
exports.getAdmin403 = (agent) => it('Getting admin resource', (done) => {
    agent.get('/api/supersecret')
        .then((res) => {
            expect(res.statusCode).to.equals(403);
            done();
        })
        .catch((err) => done(err))
});

//POST request for sign up, expect 200 status code
exports.postSignUpUser200 = (agent) => it('Sign up', (done) => {
    agent.post('/api/signup')
        .send({
            email: "johndoe@gmail.com",
            password: "Password123"
        })
        .then((res) => {
            expect(res.statusCode).to.equals(200)
            expect(res.headers).to.include.keys("set-cookie")
            done();
        })
        .catch((err) => done(err))
});

//POST request for sign up and modification into an admin account, expect 200 status code
exports.postSignUpAdmin200 = (agent) => it('Sign Up and set as admin', (done) => {
    agent.post('/api/signup')
        .send({
            email: "johndoe@gmail.com",
            password: "Password123"
        })
        .then((res) => {
            expect(res.statusCode).to.equals(200)
            expect(res.headers).to.include.keys("set-cookie")
            return mongoose.connection.db.collection('users')
        })
        .then((collection) => {
            return collection.updateOne(
                { email: "johndoe@gmail.com"},
                { $set: {admin: true}}
            )
        })
        .then((result) => {
            expect(result).to.include({
                matchedCount: 1,
                modifiedCount: 1
            })
            done();
        })
        .catch((err) => done(err))
});

//POST for log in, expect 200 status code
exports.postLogIn200 = (agent) => it('Log in', (done) => {
    agent.post('/api/login')
        .send({
            email: "johndoe@gmail.com",
            password: "Password123"
        })
        .then((res) => {
            expect(res.statusCode).to.equals(200);
            expect(res.headers).to.include.keys("set-cookie")
            done();
        })
        .catch((err) => done(err))
});

//GET for log out, expect 200 status code
exports.getLogout200 = (agent) => it('Log out', (done) => {
    agent.get('/api/logout')
        .then((res) => {
            expect(res.statusCode).to.equals(200);
            done();
        })
        .catch((err) => done(err))
});