import "mocha";
import {expect} from "chai";
import moment = require("moment");

import {ICandidate} from "../dist/interfaces";
import adapter from "../src/node_adapter";

const candidateTests = (args: any) => () => {
    let token = args.token;
    let mockCandidate: ICandidate = {
        email: "admin+tester@ph14solutions.onmicrosoft.com",
        phoneNumber: "17781234567",
        firstName: "Test",
        lastName: "Doe"
    };
    let nonExistentCandidate = {id: "-1", ...mockCandidate};

    context("createCandidate", () => {
        it("should fail if candidate is missing an email", async () => {
            const incompleteCandidate: ICandidate = {
                firstName: "Test",
                lastName: "Doe"
            };
            const {success, error} = await adapter.createCandidate(token, incompleteCandidate);
            expect(success).to.be.false;
            expect(error).to.exist;
        });

        it("should succeed on insert", async () => {
            const {success, data} = await adapter.createCandidate(token, mockCandidate);
            expect(success).to.be.true;
            expect(data.id).to.exist;
            mockCandidate = data; // returns with id attribute
        });
    });

    context("isValidCandidateID", () => {
        it("should return true if candidate exists", async () => {
            const {success, data} = await adapter.isValidCandidateID(mockCandidate.id);
            expect(success).to.be.true;
            expect(data).to.be.true;
        });

        it("should return false if candidate does not exist", async () => {
            const {success, data} = await adapter.isValidCandidateID(nonExistentCandidate.id);
            expect(success).to.be.true;
            expect(data).to.be.false;
        });

        it("should return false on invalid ID format", async () => {
            const {success, data} = await adapter.isValidCandidateID("%$&%$@!!");
            expect(success).to.be.true;
            expect(data).to.be.false;
        });

        it("should return false on empty string", async () => {
            const {success, data} = await adapter.isValidCandidateID("");
            expect(success).to.be.true;
            expect(data).to.be.false;
        })
    });

    context("getCandidates, getCandidateById", () => {
        it("should return a list with the new candidate", async () => {
            const {success, data} = await adapter.getCandidates(token);
            expect(success).to.be.true;
            expect(Array.isArray(data)).to.be.true;
            expect(data).to.deep.include(mockCandidate);
        });

        it("should find the new candidate when searching by ID", async () => {
            const {success, data} = await adapter.getCandidateByID(mockCandidate.id);
            expect(success).to.be.true;
            expect(data).to.deep.equals(mockCandidate);
        });

        it("should fail if candidate does not exist", async () => {
            const {success, error} = await adapter.getCandidateByID(nonExistentCandidate.id);
            expect(success).to.be.false;
            expect(error).to.exist;
        });
    });

    context("updateCandidate", () => {
        it("should update any personal information", async () => {
            mockCandidate = {
                ...mockCandidate,
                email: "admin+integration@ph14solutions.onmicrosoft.com",
                firstName: "Jane",
                phoneNumber: "16041234567",
                notes: "This is a test account"
            };
            const {success, data} = await adapter.updateCandidate(token, mockCandidate);
            expect(success).to.be.true;
            expect(data).to.deep.equals(mockCandidate);
        });

        it("succeed on no changes", async () => {
            const {success, data} = await adapter.updateCandidate(token, mockCandidate);
            expect(success).to.be.true;
            expect(data).to.deep.equals(mockCandidate);
        });

        it("should fail on missing candidate", async () => {
            const {success, error} = await adapter.updateCandidate(token, nonExistentCandidate);
            expect(success).to.be.false;
            expect(error).to.exist;
        });
    });

    context("sendAvailabilityEmail", () => {
        it("should fail on missing candidate", async () => {
            const {success, error} = await adapter.sendAvailabilityEmail(token, nonExistentCandidate);
            expect(success).to.be.false;
            expect(error).to.exist;
        });

        it("should succeed on existing candidate", async () => {
            const {success} = await adapter.sendAvailabilityEmail(token, mockCandidate);
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
            const {success} = await adapter.deleteCandidate(token, mockCandidate);
            expect(success).to.be.true;
            const {success: didFindCandidate} = await adapter.getCandidateByID(mockCandidate.id);
            expect(didFindCandidate).to.be.false;
        });

        it("should fail on missing candidate", async () => {
            const {success, error} = await adapter.deleteCandidate(token, mockCandidate);
            expect(success).to.be.false;
            expect(error).to.exist;
        });
    });
};

export default candidateTests;
