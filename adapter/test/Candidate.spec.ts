import "mocha";
import {expect} from "chai";

import {ICandidate} from "../dist/interfaces";
import adapter from "../src/node_adapter";

describe("Candidate Lifecycle Tests", () => {
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
            const {success, error} = await adapter.createCandidate(incompleteCandidate);
            expect(success).to.be.false;
            expect(error).to.not.be.undefined;
        });

        it("should succeed", async () => {
            const incompleteCandidate: ICandidate = {
                firstName: "Test",
                lastName: "Doe"
            };
            const {success, data} = await adapter.createCandidate(incompleteCandidate);
            expect(success).to.be.true;
            expect(data.id).to.not.be.null;
            mockCandidate = data;
        });
    });

    context("updateCandidate", () => {

    });

    context("sendAvailabilityEmail", () => {

    });

    context("submitAvailability", () => {
    });

    context("deleteCandidate", () => {

    });
});
