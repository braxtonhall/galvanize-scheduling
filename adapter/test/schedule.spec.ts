import "mocha";
import {expect} from "chai";

import {momentThisWeek} from "./TestUtils"
import adapter from "../src/node_adapter";
import {IAvailability, ICandidate, IGetSchedulesOptions, IInterviewer} from "../src/interfaces";
import moment = require("moment");

// at least 3 interviewers should exist in the connected active directory to pass this test suite
const ScheduleTests = args => !args.verifyTestAccounts ? () => {} : () => {
    const that = args;
    let candidateBase: ICandidate = {
        email: "test-integration@ph14solutions.onmicrosoft.com",
        firstName: "Test",
        lastName: "Scheduling",
        notes: "This is a test account"
    };
    let emptyAvailCandidate: ICandidate, fullAvailCandidate: ICandidate, partialAvailCandidate: ICandidate;
    let simpleInterviews, pairedInterviews, tripleInterviews, longInterviews, mismatchedInterviews;

    const makeTestCandidate = async (a: IAvailability) => {
        const {data: candidate} = await adapter.createCandidate(that.token, candidateBase);
        await adapter.submitAvailability(candidate.id, a);
        const {data: completeCandidate} = await adapter.getCandidateByID(candidate.id);
        return completeCandidate;
    };

    const defineCandidates = async () => {
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

    const makePreferenceItem = (i: IInterviewer, minutes: number, partner?: IInterviewer) =>
        ({interviewer: i, preference: partner, minutes});

    const generatePreferences = async () => {
        const {data: interviewers} = await adapter.getInterviewers(that.token, that.groupName);
        const [i0, i1, i2] = interviewers.slice(0, 2); // modify to select specific interviewers
        simpleInterviews = [makePreferenceItem(i0, 30), makePreferenceItem(i1, 45)];
        pairedInterviews = [
            makePreferenceItem(i0, 45, i1),
            makePreferenceItem(i1, 45, i0),
            makePreferenceItem(i2, 20)
        ];
        tripleInterviews = [
            makePreferenceItem(i0, 30, i1),
            makePreferenceItem(i1, 30, i2),
            makePreferenceItem(i2, 30, i0)
        ];
        longInterviews = [makePreferenceItem(i0, 1000000)];
        mismatchedInterviews = [makePreferenceItem(i0, 15, i1), makePreferenceItem(i1, 30)];
    };

    before(async () => await Promise.all([defineCandidates(), generatePreferences()]));

    context("getSchedules", () => {
        it("should fail on invalid authentication", async () => {
            const options: IGetSchedulesOptions = {preferences: [], candidate: emptyAvailCandidate};
            const {success} = await adapter.getSchedules(that.INVALID_TOKEN, options);
            expect(success).to.be.false;
        });

        it("should fail if required fields are missing", async () => {
            const p1 = await adapter.getSchedules(that.token, undefined);
            const p2 = await adapter.getSchedules(that.token, {preferences: [], candidate: undefined});
            const p3 = await adapter.getSchedules(that.token, {preferences: undefined, candidate: fullAvailCandidate});
            const p4 = await adapter.getSchedules(that.token, {preferences: undefined, candidate: undefined});
            expect(p1).to.be.false;
            expect(p2).to.be.false;
            expect(p3).to.be.false;
            expect(p4).to.be.false;
        });

        it("should fail multiple preference entries for the same interviewer", async () => {
           // TODO is this possible from the UI -> valid? or failure case?
            const dupedInterviews = [...simpleInterviews, ...tripleInterviews];
            const options: IGetSchedulesOptions = {preferences: dupedInterviews, candidate: emptyAvailCandidate};
            const {success} = await adapter.getSchedules(that.token, options);
            expect(success).to.be.false;
        });

        it("should succeed emptily when given no availabilities", async () => {
            const options: IGetSchedulesOptions = {preferences: simpleInterviews, candidate: emptyAvailCandidate};
            const {success, data} = await adapter.getSchedules(that.token, options);
            expect(success).to.be.true;
            expect(data).to.be.an('array').that.is.empty;
        });

        it("should succeed emptily when scheduling a candidate who hasn't submitted availabilities yet", async () => {
           const {data: freshCandidate} = await adapter.createCandidate(that.token, candidateBase);
           const options: IGetSchedulesOptions = {preferences: simpleInterviews, candidate: freshCandidate};
           const {success, data} = await adapter.getSchedules(that.token, options);
            expect(success).to.be.true;
            expect(data).to.be.an('array').that.is.not.empty;
        });

        it("should succeed emptily when given no interviewers", async () => {
            const options: IGetSchedulesOptions = {preferences: [], candidate: fullAvailCandidate};
            const {success, data} = await adapter.getSchedules(that.token, options);
            expect(success).to.be.true;
            expect(data).to.be.an('array').that.is.not.empty;
        });

        it("should return schedules that do not conflict with the interviewers'", async () => {
            const options: IGetSchedulesOptions = {preferences: simpleInterviews, candidate: fullAvailCandidate};
            const {success, data} = await adapter.getSchedules(that.token, options);
            expect(success).to.be.true;
            expect(data).to.be.an('array').that.is.length(2);
        });

        it("should return schedules that fit both the interviewers' and candidates'", async () => {
            const options: IGetSchedulesOptions = {preferences: simpleInterviews, candidate: partialAvailCandidate};
            const {success, data} = await adapter.getSchedules(that.token, options);
            expect(success).to.be.true;
            expect(data).to.be.an('array').that.is.length(2);
            // TODO inspect contents of data
        });

        it("should respect interviewer pairings", async () => {
            const options: IGetSchedulesOptions = {preferences: pairedInterviews, candidate: fullAvailCandidate};
            const {success, data} = await adapter.getSchedules(that.token, options);
            expect(success).to.be.true;
            expect(data).to.be.an('array').that.is.length(2);
            // TODO inspect contents of data
        });

        it("should be able to respect three-way pairings", async () => {
            const options: IGetSchedulesOptions = {preferences: tripleInterviews, candidate: fullAvailCandidate};
            const {success, data} = await adapter.getSchedules(that.token, options);
            expect(success).to.be.true;
            expect(data).to.be.an('array').that.is.length(1);
            // TODO inspect contents of data
        });

        it("should succeed with empty if there are no possible matches for the schedules", async () => {
            // TODO is the app going to return best attempt at matching or empty? or fail?
            const options: IGetSchedulesOptions = {preferences: longInterviews, candidate: partialAvailCandidate};
            const {success, data} = await adapter.getSchedules(that.token, options);
            expect(success).to.be.true;
            expect(data).to.be.an('array').that.is.empty;
        });

        it("should pair interviewers together even if pair request was one-sided", async () => {
            const options: IGetSchedulesOptions = {preferences: mismatchedInterviews, candidate: fullAvailCandidate};
            const {success, data} = await adapter.getSchedules(that.token, options);
            expect(success).to.be.true;
            expect(data).to.be.an('array').that.is.length(1);
            // TODO inspect contents of data, should be interviewers 0 and 1
        });

        it("should use the largest minutes in mismatched partner pairings", async () => {
            const options: IGetSchedulesOptions = {preferences: mismatchedInterviews, candidate: fullAvailCandidate};
            const {success, data} = await adapter.getSchedules(that.token, options);
            expect(success).to.be.true;
            expect(data).to.be.an('array').that.is.length(1);
            // TODO inspect contents of data, should be 30 min
        });
    });
};

export default ScheduleTests;