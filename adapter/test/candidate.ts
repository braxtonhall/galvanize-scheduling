import "mocha";
import {expect} from "chai";
import moment = require("moment");

import {ICandidate} from "../dist/interfaces";
import adapter from "../src/node_adapter";

const candidateTests = (args: any) => () => {
    const that = args;
    const INVALID_TOKEN = "invalidToken";

    const mockCandidate: ICandidate = {
        email: "admin+tester@ph14solutions.onmicrosoft.com",
        phoneNumber: "17781234567",
        firstName: "Test",
        lastName: "Doe"
    };
    const candidateWithId = {...mockCandidate};


    context("createCandidate", () => {
        it("should fail with invalid authentication", async () => {
            const {success} = await adapter.createCandidate(INVALID_TOKEN, mockCandidate);
            expect(success).to.be.false;
        });

        it("should succeed on insert", async () => {
            const {success, data} = await adapter.createCandidate(that.token, mockCandidate);
            expect(success).to.be.true;
            expect(data.id).to.exist;
            candidateWithId.id = data.id;
        });

        it("should assign candidates unique ids", async () => {
            const [{success: s1, data: d1}, {success: s2, data: d2}] = await Promise.all([
                adapter.createCandidate(that.token, mockCandidate),
                adapter.createCandidate(that.token, mockCandidate)
            ]);
            expect(s1).to.be.true;
            expect(s2).to.be.true;
            expect(d1.id).to.not.equal(d2.id);
        });

        it("should fail when inserting an existing candidate", async () => {
            const {success} = await adapter.createCandidate(that.token, candidateWithId);
            expect(success).to.be.false;
        });
    });

    // isValidCandidateID is unused

    context("getCandidates, getCandidateById", () => {
        it("should fail on invalid authentication", async () => {
            const {success} = await adapter.getCandidates(INVALID_TOKEN);
            expect(success).to.be.false;
        });

        it("should return a list with created candidates", async () => {
            const {success, data} = await adapter.getCandidates(that.token);
            expect(success).to.be.true;
            expect(Array.isArray(data)).to.be.true;
            expect(data).to.deep.include(candidateWithId);
        });

        it("should retrieve only public information when searching by ID", async () => {
            const {success, data} = await adapter.getCandidateByID(candidateWithId.id);
            expect(success).to.be.true;
            expect(data.firstName).to.equal(candidateWithId.firstName);
            expect(data.email).to.not.be.ok;
            expect(data.lastName).to.be.undefined;
            expect(data.phoneNumber).to.be.undefined;
        });

        it("should fail if candidate does not exist", async () => {
            const {success} = await adapter.getCandidateByID("0");
            expect(success).to.be.false;
        });

        it("should fail if id is malformed", async () => {
            const [{success: s1}, {success: s2}] = await Promise.all([
                adapter.getCandidateByID(""),
                adapter.getCandidateByID("!@#$%^&")
            ]);
            expect(s1).to.be.false;
            expect(s2).to.be.false;
        });
    });
/*
    context("updateCandidate", () => {
        it("should update any personal information", async () => {
            mockCandidate = {
                ...mockCandidate,
                email: "admin+integration@ph14solutions.onmicrosoft.com",
                firstName: "Jane",
                phoneNumber: "16041234567",
                notes: "This is a test account"
            };
            const {success, data} = await adapter.updateCandidate(that.token, mockCandidate);
            expect(success).to.be.true;
            expect(data).to.deep.equals(mockCandidate);
        });

        it("succeed on no changes", async () => {
            const {success, data} = await adapter.updateCandidate(that.token, mockCandidate);
            expect(success).to.be.true;
            expect(data).to.deep.equals(mockCandidate);
        });

        it("should fail on missing candidate", async () => {
            const {success, error} = await adapter.updateCandidate(that.token, nonExistentCandidate);
            expect(success).to.be.false;
            expect(error).to.exist;
        });
    });

    context("sendAvailabilityEmail", () => {
        it("should fail on missing candidate", async () => {
            const {success, error} = await adapter.sendAvailabilityEmail(that.token, nonExistentCandidate);
            expect(success).to.be.false;
            expect(error).to.exist;
        });

        it("should succeed on existing candidate", async () => {
            const {success} = await adapter.sendAvailabilityEmail(that.token, mockCandidate);
            expect(success).to.be.true;
        });
    });

    context("submitAvailability", () => {
        const sotw = moment().startOf("week");
        const eotw = moment().endOf("week");
        const availabilities = [
            {start: sotw, end: sotw.add(5, "hours")},
            {start: sotw.add(3, "days").add(5, "hours"),
            end: sotw.add(3, "days").add(10, "hours")},
            {start: eotw, end: eotw.add(45, "minutes")}
        ];

        it("should succeed", async () => {
            const {success} = await adapter.submitAvailability(mockCandidate.id, availabilities);
            expect(success).to.be.true;
            const {data} = await adapter.getCandidateByID(mockCandidate.id);
            expect(data.availability).to.exist;
            expect(data.availability).to.deep.equals(availabilities);
        });

        it("should succeed on no availabilities", async () => {
            const {success} = await adapter.submitAvailability(mockCandidate.id, []);
            expect(success).to.be.true;
            const {data} = await adapter.getCandidateByID(mockCandidate.id);
            expect(data.availability).to.exist;
        });

        it("should succeed on update", async () => {
            const updatedAvailabilities = [
                ...availabilities,
                {start: eotw.add(15, "hours"), end: eotw.add(18, "hours")}
            ];
            const {success} = await adapter.submitAvailability(mockCandidate.id, updatedAvailabilities);
            expect(success).to.be.true;
            const {data} = await adapter.getCandidateByID(mockCandidate.id);
            expect(data.availability).to.exist;
            expect(data.availability).to.deep.equals(updatedAvailabilities);

        });

        it("should fail on impossible date range", async () => {
            const updatedAvailabilities = [
                ...availabilities,
                {start: eotw, end: sotw}
            ];
            const {success} = await adapter.submitAvailability(mockCandidate.id, updatedAvailabilities);
            expect(success).to.be.false;
            const {data} = await adapter.getCandidateByID(mockCandidate.id);
            expect(data.availability).to.exist;
            expect(data.availability).to.deep.equals(availabilities);
        });
    });

    context("deleteCandidate", () => {
        it("should remove the candidate", async () => {
            const {success} = await adapter.deleteCandidate(that.token, mockCandidate);
            expect(success).to.be.true;
            const {success: didFindCandidate} = await adapter.getCandidateByID(mockCandidate.id);
            expect(didFindCandidate).to.be.false;
        });

        it("should fail on missing candidate", async () => {
            const {success, error} = await adapter.deleteCandidate(that.token, mockCandidate);
            expect(success).to.be.false;
            expect(error).to.exist;
        });
    });
 */
};

export default candidateTests;
