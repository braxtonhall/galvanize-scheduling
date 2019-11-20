import "mocha";
import {expect} from "chai";
import {v4 as generateUUID} from 'uuid';
import moment = require("moment");

import {ICandidate} from "../dist/interfaces";
import adapter from "../src/node_adapter";

const CandidateTests = args => () => {
    const that = args;

    const candidateBase: ICandidate = {
        email: "test-integration@ph14solutions.onmicrosoft.com",
        phoneNumber: "17781234567",
        firstName: "Test",
        lastName: "Doe"
    };
    const candidateNotInDB = {...candidateBase, id: generateUUID()};
    let candidateWithId: ICandidate = {...candidateBase};

    context("createCandidate", () => {
        it("should fail with invalid authentication", async () => {
            const {success} = await adapter.createCandidate(that.INVALID_TOKEN, candidateBase);
            expect(success).to.be.false;
        });

        it("should succeed on insert", async () => {
            const {success, data} = await adapter.createCandidate(that.token, candidateBase);
            expect(success).to.be.true;
            expect(data.id).to.exist;
            candidateWithId.id = data.id;
        });

        it("should assign candidates unique ids", async () => {
            const [{success: s1, data: d1}, {success: s2, data: d2}] = await Promise.all([
                adapter.createCandidate(that.token, candidateBase),
                adapter.createCandidate(that.token, candidateBase)
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
            const {success} = await adapter.getCandidates(that.INVALID_TOKEN);
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
            const {success} = await adapter.getCandidateByID(candidateNotInDB.id);
            expect(success).to.be.false;
        });

        it("should fail if id is empty", async () => {
            const {success} = await adapter.getCandidateByID("");
            expect(success).to.be.false;
        });
    });

    context("updateCandidate", () => {
        it("should fail on invalid authentication", async () => {
            const {success} = await adapter.updateCandidate(that.INVALID_TOKEN, candidateWithId);
            expect(success).to.be.false;
        });

        it("should update any personal information", async () => {
            candidateWithId = {
                ...candidateWithId,
                email: "test-integration@ph14solutions.onmicrosoft.com",
                firstName: "Jane",
                phoneNumber: "16041234567",
                notes: "This is a test account"
            };
            const {success, data} = await adapter.updateCandidate(that.token, candidateWithId);
            expect(success).to.be.true;
            expect(data).to.deep.equals(candidateWithId);
        });

        it("succeed on no changes", async () => {
            const {success, data} = await adapter.updateCandidate(that.token, candidateWithId);
            expect(success).to.be.true;
            expect(data).to.deep.equals(candidateWithId);
        });

        it("should create candidates if they don't exist", async () => {
            // TODO: shouldn't updateCandidate have a check against this? probably a mistake if called this way
            const id = generateUUID();
            const {success: existsBefore} = await adapter.getCandidateByID(id);
            const {success: didUpdate} = await adapter.updateCandidate(that.token, {...candidateBase, id});
            const {success: existsAfter} = await adapter.getCandidateByID(id);
            expect(existsBefore).to.be.false;
            expect(didUpdate).to.be.true;
            expect(existsAfter).to.be.true;
        });

        it("should fail if candidate has no id", async () => {
            const {success} = await adapter.updateCandidate(that.token, candidateBase);
            expect(success).to.be.false;
        });
    });

    if (args.emailTests) {
        context("sendAvailabilityEmail", () => {
            it("should fail on invalid email", async () => {
                const {success} = await adapter.sendAvailabilityEmail(that.token, {email: "test test test"});
                expect(success).to.be.false;
            });

            it("should fail on blank email", async () => {
                const {success} = await adapter.sendAvailabilityEmail(that.token, {email: ""});
                expect(success).to.be.false;
            });

            it("should succeed on valid email", async () => {
                const {success} = await adapter.sendAvailabilityEmail(that.token, candidateWithId);
                expect(success).to.be.true;
                // Manually check admin email inbox to confirm sending works
            });

            it("should succeed with a minimal candidate model", async () => {
                // TODO: need an ID to generate link, so this call should fail... add validation?
                const {success} = await adapter.sendAvailabilityEmail(
                    that.token, {email: "test-integration@ph14solutions.onmicrosoft.com"}
                );
                expect(success).to.be.true;
            });
        });
    }

    context("submitAvailability", () => {
        let availabilities = [
            {start: moment().day(1).hour(10), end: moment().day(1).hour(15)},
            {start: moment().day(1).hour(16), end: moment().day(1).hour(20)},
            {start: moment().day(4).hour(8).minutes(45), end: moment().day(4).hour(12).minutes(30)},
            {start: moment().day(5).startOf('day'), end: moment().day(6).startOf('day')}
        ];
        const toISO = pair => ({ start: pair.start.toISOString(), end: pair.end.toISOString() });

        it("should succeed", async () => {
            const {success} = await adapter.submitAvailability(candidateWithId.id, availabilities);
            expect(success).to.be.true;
            const {data} = await adapter.getCandidateByID(candidateWithId.id);
            expect(data.availability).to.exist;
            expect(data.availability).to.deep.equals(availabilities.map(toISO));
        });

        it("should succeed on no availabilities", async () => {
            const emptyList = [];
            const {success} = await adapter.submitAvailability(candidateWithId.id, emptyList);
            expect(success).to.be.true;
            const {data} = await adapter.getCandidateByID(candidateWithId.id);
            expect(data.availability).to.exist;
            expect(data.availability).to.deep.equals(emptyList);
        });

        it("should succeed on update", async () => {
            const updatedAvailabilities = [
                ...availabilities,
                {start: moment().day(6).hour(12).minutes(15),
                    end: moment().day(6).hour(14).minutes(30)}
            ];
            const {success} = await adapter.submitAvailability(candidateWithId.id, updatedAvailabilities);
            expect(success).to.be.true;
            const {data} = await adapter.getCandidateByID(candidateWithId.id);
            expect(data.availability).to.deep.equals(updatedAvailabilities.map(toISO));
            availabilities = updatedAvailabilities;
        });

        it("should fail on impossible date ranges", async () => {
            // TODO: this succeeds, add validation?
            const updatedAvailabilities = [
                ...availabilities,
                {start: moment().day(4).hour(19), end: moment().day(4).startOf('day')}
            ];
            const {success} = await adapter.submitAvailability(candidateWithId.id, updatedAvailabilities);
            expect(success).to.be.false;
            const {data} = await adapter.getCandidateByID(candidateWithId.id);
            expect(data.availability).to.exist;
            expect(data.availability).to.deep.equals(availabilities.map(toISO));
        });

        it("should combine overlapping date ranges", async () => {
            // TODO
        });

        it("should fail if candidate has no id", async () => {
            const {success} = await adapter.submitAvailability(candidateBase.id, availabilities);
            expect(success).to.be.false;
        });

        it("should fail if candidate does not exist", async () => {
            const {success} = await adapter.submitAvailability(candidateNotInDB.id, availabilities);
            expect(success).to.be.false;
        });
    });

    context("deleteCandidate", () => {
        it("should fail on invalid authentication", async () => {
            const {success} = await adapter.deleteCandidate(that.INVALID_TOKEN, candidateWithId);
            expect(success).to.be.false;
            const {success: didFindCandidate} = await adapter.getCandidateByID(candidateWithId.id);
            expect(didFindCandidate).to.be.true;
        });

        it("should fail given candidate with no id", async () => {
            const {success} = await adapter.deleteCandidate(that.token, candidateBase);
            expect(success).to.be.false;
        });

        it("should remove the candidate", async () => {
            const {success} = await adapter.deleteCandidate(that.token, candidateWithId);
            expect(success).to.be.true;
            const {success: didFindCandidate} = await adapter.getCandidateByID(candidateWithId.id);
            expect(didFindCandidate).to.be.false;
        });

        it("should succeed given already deleted candidate", async () => {
            const {success} = await adapter.deleteCandidate(that.token, candidateWithId);
            expect(success).to.be.true;
            const {success: didFindCandidate} = await adapter.getCandidateByID(candidateWithId.id);
            expect(didFindCandidate).to.be.false;
        });

        it("should succeed given non-existent candidate", async () => {
            const {success} = await adapter.deleteCandidate(that.token, candidateNotInDB);
            expect(success).to.be.true;
            const {success: didFindCandidate} = await adapter.getCandidateByID(candidateNotInDB.id);
            expect(didFindCandidate).to.be.false;
        });
    });

};

export default CandidateTests;
