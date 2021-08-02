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

//GET request for typical public info
exports.getPublic = (agent, options) => it('Getting public resource', (done) => {
    const defaultOptions = {
        expectedStatus: 200,
        expects: ((res) => {})
    }

    const setting = {...defaultOptions, ...options}

    agent.get('/api/public')
        .then((res) => {
            expect(res.statusCode).to.equals(setting.expectedStatus);
            setting.expects(res);
            done();
        })
        .catch((err) => done(err))
});

//GET request for typical user info
exports.getUser = (agent, options) => it('Getting user resource', (done) => {
    const defaultOptions = {
        expectedStatus: 200,
        expects: ((res) => {})
    }

    const setting = {...defaultOptions, ...options}

    agent.get('/api/secret')
        .then((res) => {
            expect(res.statusCode).to.equals(setting.expectedStatus);
            setting.expects(res);
            done();
        })
        .catch((err) => done(err))
});

//GET request for typical admin info
exports.getAdmin = (agent, options) => it('Getting admin resource', (done) => {
    const defaultOptions = {
        expectedStatus: 200,
        expects: ((res) => {})
    }

    const setting = {...defaultOptions, ...options}

    agent.get('/api/supersecret')
        .then((res) => {
            expect(res.statusCode).to.equals(setting.expectedStatus);
            setting.expects(res);
            done();
        })
        .catch((err) => done(err))
});

//POST request for sign up
exports.postSignUp = (agent, options) => it('Sign up', (done) => {
    const defaultOptions = {
        expectedStatus: 200,
        expects: ((res) => {}),
        makeAdmin: false,
        body: {
            email: 'johndoe@gmail.com',
            password: 'Password123'
        }
    }

    const setting = {...defaultOptions, ...options}

    agent.post('/api/signup')
        .send(setting.body)
        .then((res) => {
            expect(res.statusCode).to.equals(setting.expectedStatus)
            setting.expects(res)
            if (setting.makeAdmin) {
                mongoose.connection.db.collection('users').updateOne(
                    { email: setting.body.email},
                    { $set: {admin: true}}
                )
                    .then((result) => {
                        expect(result).to.include({
                            matchedCount: 1,
                            modifiedCount: 1
                        })
                        done();
                    })
            } else {
                done();
            }
        })
        .catch((err) => done(err))
});

//POST for log in account
exports.postLogIn = (agent, options) => it('Log in User', (done) => {
    const defaultOptions = {
        expectedStatus: 200,
        expects: ((res) => {}),
        body: {
            email: 'johndoe@gmail.com',
            password: 'Password123'
        }
    }

    const setting = {...defaultOptions, ...options}

    agent.post('/api/login')
        .send(setting.body)
        .then((res) => {
            expect(res.statusCode).to.equals(setting.expectedStatus);
            setting.expects(res);
            done();
        })
        .catch((err) => done(err))
});

//GET for log out
exports.getLogout = (agent, options) => it('Log out', (done) => {
    const defaultOptions = {
        expectedStatus: 200,
        expects: ((res) => {})
    }

    const setting = {...defaultOptions, ...options}

    agent.get('/api/logout')
        .then((res) => {
            expect(res.statusCode).to.equals(setting.expectedStatus);
            setting.expects(res)
            done();
        })
        .catch((err) => done(err))
});

//POST a typical ebook
exports.postEbook = (agent, options) => it('Post an ebook to the server', (done) => {
    const defaultOptions = {
        expectedStatus: 200,
        expects: ((res) => {}),
        body: {
            name: 'Name',
            author: 'Author',
            price: 69,
            description: 'Description',
            ISBN: '1234567890'
        }
    }

    const setting = {...defaultOptions, ...options}

    agent.post('/api/ebooks')
        .send(setting.body)
        .then((res) => {
            expect(res.statusCode).to.equals(setting.expectedStatus);
            setting.expects(res);
            done();
        })
        .catch((err) => done(err))
})