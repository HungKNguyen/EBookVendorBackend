const expect = require('chai').expect
const request = require('supertest')
const app = require('../app')
const testHelper = require('../testHelper')

describe('commentsRouter authorization test', () => {
    testHelper.suiteSetup();
    const agent = request.agent(app);
    it('Post comment', (done) => {
        agent.post('/api/comments')
            .then((res) => {
                expect(res.statusCode).to.equals(401)
                done()
            })
            .catch((err) => done(err))
    })
    it('Put comment', (done) => {
        agent.put('/api/comments')
            .then((res) => {
                expect(res.statusCode).to.equals(401)
                done()
            })
            .catch((err) => done(err))
    })
    it('Delete comment', (done) => {
        agent.delete('/api/comments')
            .then((res) => {
                expect(res.statusCode).to.equals(401)
                done()
            })
            .catch((err) => done(err))
    })
    testHelper.postSignUp(agent);
    it('Admin delete comment', (done) => {
        agent.delete('/api/comments/admin')
            .then((res) => {
                expect(res.statusCode).to.equals(403)
                done()
            })
            .catch((err) => done(err))
    })
    testHelper.getLogout(agent);
})

describe('commentsRouter content test', () => {
    let ebookId;
    let commentIdOne;
    let commentIdTwo;
    const adminAccount = {
        email: "admin@gmail.com",
        password: "Admin123"
    }
    const userOneAccount = {
        email: "johndoe@gmail.com",
        password: "J0hnny",
        firstname: "John",
        lastname: "Doe"
    }
    const userTwoAccount = {
        email: "janedoe@gmail.com",
        password: "Jan3Doe",
        firstname: "Jane",
        lastname: "Doe"
    }
    const comment = {
        rating: 4,
        comment: "This is a comment"
    }
    const updateComment = {
        rating: 5,
        comment: "This is an updated comment"
    }
    testHelper.suiteSetup();
    const agent = request.agent(app);
    testHelper.postSignUp(agent, {
        makeAdmin: true,
        body: adminAccount
    });
    testHelper.postEbook(agent, {
        expects: (res) => {ebookId = res.body._id}
    });
    testHelper.getLogout(agent);
    testHelper.postSignUp(agent, {
        body: userOneAccount
    });
    it('User One post comment', (done) => {
        agent.post('/api/comments')
            .send({
                ebookId: ebookId,
                ...comment
            })
            .then((res) => {
                expect(res.statusCode).to.equals(200)
                expect(res.body).to.include(comment)
                commentIdOne = res.body._id
                done()
            })
            .catch((err) => done(err))
    });
    testHelper.getLogout(agent);
    it('Get comments on book expect comment 1 exist', (done) => {
        agent.get('/api/comments')
            .send({ebookId: ebookId})
            .then((res) => {
                expect(res.statusCode).to.equals(200)
                expect(res.body).to.be.an('array')
                expect(res.body.length).to.equal(1)
                const expectedComment = res.body.filter((comment) => comment._id === commentIdOne)[0]
                expect(expectedComment).to.include(comment)
                expect(expectedComment.user).to.include({
                    firstname: userOneAccount.firstname,
                    lastname: userOneAccount.lastname
                })
                done()
            })
            .catch((err) => done(err))
    });
    testHelper.postSignUp(agent, {
        body: userTwoAccount
    })
    it('User Two tries to put Comment One', (done) => {
        agent.put('/api/comments')
            .send({
                commentId: commentIdOne,
                ...updateComment
            })
            .then((res) => {
                expect(res.statusCode).to.equals(403)
                done()
            })
            .catch((err) => done(err))
    });
    it('User Two tries to delete Comment One', (done) => {
        agent.delete('/api/comments')
            .send({commentId: commentIdOne})
            .then((res) => {
                expect(res.statusCode).to.equals(403)
                done()
            })
            .catch((err) => done(err))
    });
    it('User Two post own comment', (done) => {
        agent.post('/api/comments')
            .send({
                ebookId: ebookId,
                ...comment
            })
            .then((res) => {
                expect(res.statusCode).to.equals(200)
                commentIdTwo = res.body._id
                done()
            })
            .catch((err) => done(err))
    });
    it('User Two put own comment', (done) => {
        agent.put('/api/comments')
            .send({
                commentId: commentIdTwo,
                ...updateComment
            })
            .then((res) => {
                expect(res.statusCode).to.equals(200)
                expect(res.body).to.include(updateComment)
                done()
            })
            .catch((err) => done(err))
    });
    it('Get comments on book expect comment 2 exist', (done) => {
        agent.get('/api/comments')
            .send({ebookId: ebookId})
            .then((res) => {
                expect(res.statusCode).to.equals(200)
                expect(res.body).to.be.an('array')
                expect(res.body.length).to.equal(2)
                const expectedCommentOne = res.body.filter((comment) => comment._id === commentIdOne)[0]
                expect(expectedCommentOne).to.include(comment)
                expect(expectedCommentOne.user).to.include({
                    firstname: userOneAccount.firstname,
                    lastname: userOneAccount.lastname
                })
                const expectedCommentTwo = res.body.filter((comment) => comment._id === commentIdTwo)[0]
                expect(expectedCommentTwo).to.include(updateComment)
                expect(expectedCommentTwo.user).to.include({
                    firstname: userTwoAccount.firstname,
                    lastname: userTwoAccount.lastname
                })
                done()
            })
            .catch((err) => done(err))
    });
    it('User 2 delete own comment', (done) => {
        agent.delete('/api/comments')
            .send({commentId: commentIdTwo})
            .then((res) => {
                expect(res.statusCode).to.equals(200)
                done()
            })
            .catch((err) => done(err))
    });
    it('Get comments on book expect comment 2 not exist', (done) => {
        agent.get('/api/comments')
            .send({ebookId: ebookId})
            .then((res) => {
                expect(res.statusCode).to.equals(200)
                expect(res.body).to.be.an('array')
                expect(res.body.length).to.equal(1)
                expect(res.body.filter((comment) => comment._id === commentIdTwo)[0]).to.be.undefined;
                done()
            })
            .catch((err) => done(err))
    });
    testHelper.getLogout(agent)
    testHelper.postLogIn(agent, {
        body: adminAccount
    })
    it('Admin delete comment 1', (done) => {
        agent.delete('/api/comments/admin')
            .send({commentId: commentIdOne})
            .then((res) => {
                expect(res.statusCode).to.equals(200)
                done()
            })
            .catch((err) => done(err))
    });
    testHelper.getLogout(agent)
    it('Get comments on book expect comment 1 not exist', (done) => {
        agent.get('/api/comments')
            .send({ebookId: ebookId})
            .then((res) => {
                expect(res.statusCode).to.equals(200)
                expect(res.body).to.be.an('array')
                expect(res.body.length).to.equal(0)
                expect(res.body.filter((comment) => comment._id === commentIdOne)[0]).to.be.undefined;
                done()
            })
            .catch((err) => done(err))
    });
})