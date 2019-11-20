import "mocha";
import {expect} from "chai";

import {momentThisWeek} from "./TestUtils"
import adapter from "../src/node_adapter";
import {IAvailability, ICandidate, IGetSchedulesOptions} from "../src/interfaces";
import moment = require("moment");

// at least 2 interviewers must exist in the connected active directory to run these tests
const ScheduleTests = args => () => {
    const that = args;
    let candidateBase: ICandidate = {
        email: "test-integration@ph14solutions.onmicrosoft.com",
        firstName: "Test",
        lastName: "Scheduling",
        notes: "This is a test account"
    };
    let emptyAvailCandidate: ICandidate;
    let fullAvailCandidate: ICandidate;
    let partialAvailCandidate: ICandidate;
    let simpleInterviews;
    let pairedInterviews;
    let tripleInterviews;
    let longInterviews;

    const makeTestCandidate = async (a: IAvailability) => {
        const {data: candidate} = await adapter.createCandidate(that.token, candidateBase);
        await adapter.submitAvailability(candidate.id, a);
        const {data: completeCandidate} = await adapter.getCandidateByID(candidate.id);
        return completeCandidate;
    };

    const setCandidates = async () => {
        const emptyAvailabilities: IAvailability = [];
        const fullAvailabilities: IAvailability = [
            {start: moment().startOf('month'), end: moment().endOf('month')}
        ];
        const partialAvailabilities: IAvailability = [
            {start: momentThisWeek(1,9,0), end: momentThisWeek(1,17,0)},
            {start: momentThisWeek(3,10,30), end: momentThisWeek(3, 14, 30)},
            {start: momentThisWeek(3,15, 30), end: momentThisWeek(3, 17, 0)},
            {start: momentThisWeek(5, 9, 0), end: momentThisWeek(5, 16, 0)}
        ];
        [emptyAvailCandidate, fullAvailCandidate, partialAvailCandidate] = await Promise.all([
            makeTestCandidate(emptyAvailabilities),
            makeTestCandidate(fullAvailabilities),
            makeTestCandidate(partialAvailabilities)
        ]);
    };

    const generatePreferences = async () => {
        const {data: interviewers} = await adapter.getInterviewers(that.token, that.groupName);

    };

    before(async () => {
        await setCandidates();
    });

    context("getSchedules", () => {
        it("should fail on invalid authentication", async () => {
            const options: IGetSchedulesOptions = {preferences: [], candidate: emptyAvailCandidate};
            const {success} = await adapter.getSchedules(that.INVALID_TOKEN, options);
            expect(success).to.be.false;
        });

        it("should succeed emptily when given no availabilities", async () => {

            const options: IGetSchedulesOptions = {preferences: [], candidate: emptyAvailCandidate};
            const {success} = await adapter.getSchedules(that.INVALID_TOKEN, options);
            expect(success).to.be.false;
        });

        it("should succeed emptily when given no interviewers", async () => {

        });

        it("should return schedules that do not conflict with the interviewers'", async () => {

        });

        it("should return schedules that fit both the interviewers' and candidates'", async () => {

        });

        it("should respect interviewer pairings", async () => {

        });

        it("should be able to respect three-way pairings", async () => {

        });

        it("should succeed with empty if there are no possible matches for the schedules", async () => {

        });

        it("should use the largest minutes in mismatched pairings", async () => {

        });
    });
};

export default ScheduleTests;