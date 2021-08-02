const expect = require('chai').expect
const request = require('supertest')
const app = require('../app')
const testHelper = require('../testHelper')

describe('reviewRouter test authorization', () => {
    testHelper.suiteSetup();
    const agent = request.agent(app);
    it("Post a review", (done) => {
        agent.post('/api/reviews')
            .then((res) => {
                expect(res.statusCode).to.equals(401)
                done()
            })
            .catch((err) => done(err))
    });
    it("Changing the existing review", (done) => {
        agent.put('/api/reviews')
            .then((res) => {
                expect(res.statusCode).to.equals(401)
                done()
            })
            .catch((err) => done(err))
    });
    it("Delete the reviews", (done) => {
        agent.delete('/api/reviews')
            .then((res) => {
                expect(res.statusCode).to.equals(401)
                done()
            })
            .catch((err) => done(err))
    });
})

describe('reviewsRouter test as User', () => {
    testHelper.suiteSetup();
    let reviewId;
    const review = {
        rating: 4,
        review: "This is a test review"
    }
    const updateReview = {
        rating: 5,
        review: "This is the updated review"
    }
    const agent = request.agent(app);
    testHelper.postSignUp(agent);
    it("Post a review", (done) => {
        agent.post('/api/reviews')
            .send(review)
            .then((res) => {
                expect(res.statusCode).to.equals(200)
                expect(res.body).to.include(review)
                reviewId = res.body._id
                done()
            })
            .catch((err) => done(err))
    })
    testHelper.getLogout(agent);
    it("Getting reviews, expecting one", (done) => {
        agent.get('/api/reviews')
            .then((res) => {
                expect(res.statusCode).to.equals(200)
                expect(res.body).to.be.an('array')
                expect(res.body.length).to.equal(1)
                expect(res.body[0]).to.include(review)
                done()
            })
            .catch((err) => done(err))
    });
    // Simulating a different user
    testHelper.postSignUp(agent, {body: {email: "janedoe@gmail.com", password: "Password123"}});
    it("Changing the existing review, expect 403 fail", (done) => {
        agent.put('/api/reviews')
            .send({
                reviewId: reviewId,
                ...updateReview
            })
            .then((res) => {
                expect(res.statusCode).to.equals(403)
                done()
            })
            .catch((err) => done(err))
    });
    testHelper.getLogout(agent);
    testHelper.postLogIn(agent);
    it("Changing the existing reviews, expect 200", (done) => {
        agent.put('/api/reviews')
            .send({
                reviewId: reviewId,
                ...updateReview
            })
            .then((res) => {
                expect(res.statusCode).to.equals(200)
                expect(res.body).to.include(updateReview)
                done()
            })
            .catch((err) => done(err))
    });
    it("Getting reviews, expecting change", (done) => {
        agent.get('/api/reviews')
            .then((res) => {
                expect(res.statusCode).to.equals(200)
                expect(res.body).to.be.an('array')
                expect(res.body.length).to.equal(1)
                expect(res.body[0]).to.include(updateReview)
                done()
            })
            .catch((err) => done(err))
    });
    it("Delete the reviews", (done) => {
        agent.delete('/api/reviews')
            .send({reviewId: reviewId})
            .then((res) => {
                expect(res.statusCode).to.equals(200)
                done()
            })
            .catch((err) => done(err))
    });
    it("Getting reviews, expecting none", (done) => {
        agent.get('/api/reviews')
            .then((res) => {
                expect(res.statusCode).to.equals(200)
                expect(res.body).to.be.an('array')
                expect(res.body.length).to.equal(0)
                done()
            })
            .catch((err) => done(err))
    });
    testHelper.getLogout(agent);
})