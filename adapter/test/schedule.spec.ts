import "mocha";
import {expect} from "chai";

import {momentNextWeek} from "./TestUtils"
import adapter from "../src/node_adapter";
import {IAvailability, ICandidate, IGetSchedulesOptions, IInterviewer} from "../src/interfaces";
import moment = require("moment");
import {Moment} from "moment";

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
    let i0, i1, i2;

    const makeTestCandidate = async (a: IAvailability) => {
        const {data: candidate} = await adapter.createCandidate(that.token, candidateBase);
        await adapter.submitAvailability(candidate.id, a);
        const {data: completeCandidate} = await adapter.getCandidateByID(candidate.id);
        return completeCandidate;
    };

    const defineCandidates = async () => {
        const emptyAvailabilities: IAvailability = [];
        const fullAvailabilities: IAvailability = [
            {start: momentNextWeek(0, 0, 0), end: momentNextWeek(6, 23, 59)}
        ];
        const partialAvailabilities: IAvailability = [
            {start: momentNextWeek(1,9,0), end: momentNextWeek(1,17,0)},
            {start: momentNextWeek(3,10,30), end: momentNextWeek(3, 14, 30)},
            {start: momentNextWeek(3,15, 30), end: momentNextWeek(3, 17, 0)},
            {start: momentNextWeek(5, 9, 0), end: momentNextWeek(5, 16, 0)}
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
        [i0, i1, i2] = interviewers.slice(6, 10); // modify to choose different test interviewers
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

    const toggleRooms = async () => {
        const {data} = await adapter.getRooms(that.token);
        const roomsLength = Math.min(data.length, 3);
        for (let i = 0; i < roomsLength; i++) {
            await adapter.toggleEligibility(that.token, {...data[i], eligible: false});
        }
    };

    before(async () => await Promise.all([defineCandidates(), generatePreferences(), toggleRooms()]));

    context("getSchedules", () => {
        it("should fail on invalid authentication", async () => {
            const options: IGetSchedulesOptions = {preferences: [], candidate: emptyAvailCandidate};
            const {success} = await adapter.getSchedules(that.INVALID_TOKEN, options);
            expect(success).to.be.false;
        });

        it("should fail if required fields are missing", async () => {
            const [p1, p2, p3, p4] = await Promise.all([
                adapter.getSchedules(that.token, undefined),
                adapter.getSchedules(that.token, {preferences: [], candidate: undefined}),
                adapter.getSchedules(that.token, {preferences: undefined, candidate: fullAvailCandidate}),
                adapter.getSchedules(that.token, {preferences: undefined, candidate: undefined})
            ]);
            expect(p1.success).to.be.false;
            expect(p2.success).to.be.false;
            expect(p3.success).to.be.false;
            expect(p4.success).to.be.false;
        });

        it("should fail multiple preference entries for the same interviewer", async () => {
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

        it("should fail when scheduling a candidate who hasn't submitted availabilities yet", async () => {
           const {data: freshCandidate} = await adapter.createCandidate(that.token, candidateBase);
           const options: IGetSchedulesOptions = {preferences: simpleInterviews, candidate: freshCandidate};
           const {success} = await adapter.getSchedules(that.token, options);
            expect(success).to.be.false;
        });

        it("should fail when given no interviewers to get schedules of", async () => {
            const options: IGetSchedulesOptions = {preferences: [], candidate: fullAvailCandidate};
            const {success} = await adapter.getSchedules(that.token, options);
            expect(success).to.be.false;
        });

        it("should return schedules that do not conflict with the interviewers", async () => {
            const options: IGetSchedulesOptions = {preferences: simpleInterviews, candidate: fullAvailCandidate};
            const {success, data} = await adapter.getSchedules(that.token, options);
            expect(success).to.be.true;
            expect(data).to.be.an('array').that.is.not.empty;
            const meetings = data[0].meetings;
            expect(meetings.length).to.equal(simpleInterviews.length);
        });

        it("should return schedules that fit both the interviewers' and candidates'", async () => {
            const withinTimeframe = (a, meeting) =>
                moment(a.start).isSameOrBefore(meeting.start) && moment(a.end).isSameOrAfter(moment(meeting.end));
            const options: IGetSchedulesOptions = {preferences: simpleInterviews, candidate: partialAvailCandidate};
            const {success, data} = await adapter.getSchedules(that.token, options);
            expect(success).to.be.true;
            expect(data).to.be.an('array').that.is.not.empty;

            const meetings = data[0].meetings;
            expect(meetings.length).to.equal(simpleInterviews.length);
            const av = partialAvailCandidate.availability;
            for (const m of meetings) {
                expect(
                    av.find(a => withinTimeframe(a, m)),
                    "Interview is not scheduled within candidate availability"
                ).to.exist;
            }
        });

        it("should respect interviewer pairings", async () => {
            const options: IGetSchedulesOptions = {preferences: pairedInterviews, candidate: fullAvailCandidate};
            const {success, data} = await adapter.getSchedules(that.token, options);
            expect(success).to.be.true;
            expect(data).to.be.an('array').that.is.not.empty;
            const meetings = data[0].meetings;
            expect(meetings.length).to.equal(2);
            const pairedMeetings = meetings.filter(m => m.interviewers.length === 2);
            expect(pairedMeetings.length).to.equal(1);
            expect(pairedMeetings[0].interviewers).to.have.deep.members([i0, i1]);
        });

        it("should pair interviewers together even if pair request was one-sided", async () => {
            const options: IGetSchedulesOptions = {preferences: mismatchedInterviews, candidate: fullAvailCandidate};
            const {success, data} = await adapter.getSchedules(that.token, options);
            expect(success).to.be.true;
            expect(data).to.be.an('array').that.is.not.empty;
            const meetings = data[0].meetings;
            expect(meetings.length).to.equal(1);
            expect(meetings[0].interviewers).to.have.deep.members([i0, i1]);
        });

        it("should be able to respect three-way pairings", async () => {
            const options: IGetSchedulesOptions = {preferences: tripleInterviews, candidate: fullAvailCandidate};
            const {success, data} = await adapter.getSchedules(that.token, options);
            expect(success).to.be.true;
            expect(data).to.be.an('array');
            const meetings = data[0].meetings;
            expect(meetings.length).to.equal(1);
            const interviewers = meetings[0].interviewers;
            expect(interviewers.length).to.equal(3);
            expect(interviewers).to.have.deep.members([i0, i1, i2]);
        });

        it("should succeed with empty if there are no possible matches for the schedules", async () => {
            const options: IGetSchedulesOptions = {preferences: longInterviews, candidate: partialAvailCandidate};
            const {success, data} = await adapter.getSchedules(that.token, options);
            expect(success).to.be.true;
            expect(data).to.be.an('array').that.is.empty;
        });

        it("should use the largest minutes in mismatched partner pairings", async () => {
            const options: IGetSchedulesOptions = {preferences: mismatchedInterviews, candidate: fullAvailCandidate};
            const {success, data} = await adapter.getSchedules(that.token, options);
            expect(success).to.be.true;
            expect(data).to.be.an('array').that.is.not.empty;
            const meetings = data[0].meetings;
            expect(meetings.length).to.equal(1);
            const length = (meetings[0].end as Moment).diff(meetings[0].start as Moment, 'minutes');
            expect(length).to.equal(Math.max(...mismatchedInterviews.map(i => i.minutes)));
        });
    });
};

export default ScheduleTests;