const {setUpParticipant, addFeedback} = require("../controllers/participantDetailsController");
const request = require('supertest');
const { insertParticipant, getNextId, insertFeedback } = require("../services/dbServices");

jest.mock("../services/dbServices", () => ({
    insertParticipant : jest.fn(),
    getNextId : jest.fn().mockResolvedValue(2),
    insertFeedback : jest.fn()
}));

const dbServices = require("../services/dbServices");

describe('setUpParticipant function', () => {

    let mockReq, mockRes, mockNext, dbServices;
    
})