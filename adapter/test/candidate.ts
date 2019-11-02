import "mocha";
import {expect} from "chai";

import {ICandidate} from "../dist/interfaces";
import adapter from "../src/node_adapter";

const candidateTests = (token: string) => () => {
    let mockCandidate: ICandidate = {
        email: "admin+tester@ph14solutions.onmicrosoft.com",
        phoneNumber: "17781234567",
        firstName: "Test",
        lastName: "Doe"
    };

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
            const incompleteCandidate: ICandidate = {
                firstName: "Test",
                lastName: "Doe"
            };
            const {success, data} = await adapter.createCandidate(token, incompleteCandidate);
            expect(success).to.be.true;
            expect(data.id).to.exist;
            mockCandidate = data; // returns with id attribute
        });
    });

    context("getCandidates, getCandidateById", () => {
       it("should return a list with the new candidate", async () => {
           const {success, data} = await adapter.getCandidates(token);
           expect(success).to.be.true;
           expect(data).to.deep.include(mockCandidate);
       });
       it("should find the new candidate when searching by ID", async () => {
           const {success, data} = await adapter.getCandidateByID(mockCandidate.id);
           expect(success).to.be.true;
           expect(data).to.deep.equals(mockCandidate);
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

        it("should not modify the candidate id", async () => {
            const idModifiedCandidate = {
                ...mockCandidate,
                id: "0"
            };
            const {success, data} = await adapter.updateCandidate(token, idModifiedCandidate);
            expect(success).to.be.true;
            expect(data).to.deep.equals(mockCandidate);
        });
    });

    context("sendAvailabilityEmail", () => {

    });

    context("submitAvailability", () => {
    });

    context("deleteCandidate", () => {

    });
};

export default candidateTests;
