import "mocha";
import {expect} from "chai";
import {v4 as generateUUID} from 'uuid';

import {momentThisWeek} from "./TestUtils";
import {IAvailability, ICandidate} from "../src/interfaces";
import adapter from "../src/node_adapter";
import {Moment} from "moment";

const CandidateTests = args => () => {
    const that = args;

    const candidateBase: ICandidate = {
        email: "test-integration@ph14solutions.onmicrosoft.com",
        scheduled: false,
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

        it("should fail on undefined insert", async () => {
            const p1 = adapter.createCandidate(that.token, null);
            const p2 = adapter.createCandidate(that.token, undefined);
            expect((await p1).success).to.be.false;
            expect((await p2).success).to.be.false;
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
            const {success: s1} = await adapter.getCandidateByID("");
            expect(s1).to.be.false;
            const {success: s2} = await adapter.getCandidateByID(undefined);
            expect(s2).to.be.false;
            const {success: s3} = await adapter.getCandidateByID(null);
            expect(s3).to.be.false;
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
                email: that.TEST_EMAIL,
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

        it("should fail if given candidate does not exist", async () => {
            const id = generateUUID();
            const {success} = await adapter.updateCandidate(that.token, {...candidateBase, id});
            expect(success).to.be.false;
        });

        it("should fail if candidate has no id", async () => {
            const {success} = await adapter.updateCandidate(that.token, candidateBase);
            expect(success).to.be.false;
        });
    });

    if (args.emailTests) {
        context("sendAvailabilityEmail", () => {
            it("should fail on invalid email", async () => {
                const candidate = {email: "test test test", scheduled: false};
                const {success} = await adapter.sendAvailabilityEmail(that.token, candidate);
                expect(success).to.be.false;
            });

            it("should fail on blank email", async () => {
                const candidate = {email: "", scheduled: false};
                const {success} = await adapter.sendAvailabilityEmail(that.token, candidate);
                expect(success).to.be.false;
            });

            it("should succeed on valid email", async () => {
                const {success} = await adapter.sendAvailabilityEmail(that.token, candidateWithId);
                expect(success).to.be.true;
                // Manually check admin email inbox to confirm sending works
            });

            it("should fail without a candidate ID", async () => {
                const candidate = {email: that.TEST_EMAIL, scheduled: false};
                const {success} = await adapter.sendAvailabilityEmail(that.token, candidate);
                expect(success).to.be.false;
            });

            it("should fail without a valid candidate ID", async () => {
                const {success} = await adapter.sendAvailabilityEmail(that.token, candidateNotInDB);
                expect(success).to.be.false;
            });
        });
    }

    context("submitAvailability", () => {
        const sortAscending = (aSet: IAvailability) =>
            aSet.sort((a, b) => (b.start as Moment).diff(a.start));
        const toISO = pair => ({ start: pair.start.toISOString(), end: pair.end.toISOString() });
        let availabilities = [
            {start: momentThisWeek(1, 10, 0), end: momentThisWeek(1, 15, 0)},
            {start: momentThisWeek(1, 16, 0), end: momentThisWeek(1, 20, 0)},
            {start: momentThisWeek(4, 8, 45), end: momentThisWeek(4, 12, 30)},
            {start: momentThisWeek(5, 0, 0), end: momentThisWeek(6, 0, 0)}
        ];
        const getSortedIso = () => sortAscending(availabilities).map(toISO);

        it("should succeed and sort by ascending time", async () => {
            const {success} = await adapter.submitAvailability(candidateWithId.id, availabilities);
            expect(success).to.be.true;
            const {data} = await adapter.getCandidateByID(candidateWithId.id);
            expect(data.availability).to.exist;
            expect(data.availability).to.deep.equals(getSortedIso());
        });

        it("should succeed on no availabilities", async () => {
            const emptyList = [];
            const {success} = await adapter.submitAvailability(candidateWithId.id, emptyList);
            expect(success).to.be.true;
            const {data} = await adapter.getCandidateByID(candidateWithId.id);
            expect(data.availability).to.exist;
            expect(data.availability).to.deep.equals(emptyList);
        });

        it("should fail on undefined availabilities", async () => {
            const {success: s1} = await adapter.submitAvailability(candidateWithId.id, undefined);
            expect(s1).to.be.false;
            const {success: s2} = await adapter.submitAvailability(candidateWithId.id, null);
            expect(s2).to.be.false;
        });

        it("should succeed on update", async () => {
            const updatedAvailabilities = [
                ...availabilities,
                {start: momentThisWeek(6, 12, 15), end: momentThisWeek(6, 14, 30)}
            ];
            const {success} = await adapter.submitAvailability(candidateWithId.id, updatedAvailabilities);
            expect(success).to.be.true;
            const {data} = await adapter.getCandidateByID(candidateWithId.id);
            availabilities = updatedAvailabilities;
            expect(data.availability).to.deep.equals(getSortedIso());
        });

        it("should fail on impossible date ranges", async () => {
            const updatedAvailabilities = [
                ...availabilities,
                {start: momentThisWeek(4, 19, 0), end: momentThisWeek(4, 0, 0)}
            ];
            const {success} = await adapter.submitAvailability(candidateWithId.id, updatedAvailabilities);
            expect(success).to.be.false;
            const {data} = await adapter.getCandidateByID(candidateWithId.id);
            expect(data.availability).to.exist;
            expect(data.availability).to.deep.equals(getSortedIso()); // unchanged
        });

        it("should combine overlapping date ranges", async () => {
            const overlapping = [
                {start: momentThisWeek(4, 5, 6), end: momentThisWeek(4,10,25)},
                {start: momentThisWeek(4, 0, 0), end: momentThisWeek(5, 0, 0)},
                {start: momentThisWeek(4, 20, 0), end: momentThisWeek(5, 0, 0)},
                {start: momentThisWeek(4, 0, 0), end: momentThisWeek(4, 2, 59)}
            ];
            const simplified = [
                {start: momentThisWeek(4, 0, 0), end: momentThisWeek(5, 0, 0)}
            ];
            const {success} = await adapter.submitAvailability(candidateWithId.id, overlapping);
            expect(success).to.be.true;
            const {data} = await adapter.getCandidateByID(candidateWithId.id);
            expect(data.availability).to.exist;
            expect(data.availability).to.deep.equals(sortAscending(simplified).map(toISO));
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

        it("should fail given candidate with no id or no input", async () => {
            const {success: s1} = await adapter.deleteCandidate(that.token, candidateBase);
            expect(s1).to.be.false;
            const {success: s2} = await adapter.deleteCandidate(that.token, undefined);
            expect(s2).to.be.false;
            const {success: s3} = await adapter.deleteCandidate(that.token, null);
            expect(s3).to.be.false;
        });

        it("should remove the candidate", async () => {
            const {success} = await adapter.deleteCandidate(that.token, candidateWithId);
            expect(success).to.be.true;
            const {success: didFindCandidate} = await adapter.getCandidateByID(candidateWithId.id);
            expect(didFindCandidate).to.be.false;
        });

        it("should delete idempotently", async () => {
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
