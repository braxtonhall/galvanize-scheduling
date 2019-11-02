import adapter from "./adapter";
import {expect} from 'chai';
import {interfaces} from "../dist";

describe("Test Candidate Actions", () => {
    let id: string;
    let token: string;

    let fullCandidate: interfaces.ICandidate = {
        email: "john.doe@test.com",
        phoneNumber: "778-123-4567",
        firstName: "John",
        lastName: "Doe",
        position: "Lead Developer",
        notes: "Good"
    };

    before(async () => {
        const {success, data} = await adapter.login("1", "1");
        if (success) {
            token = data;
            const res = await adapter.createCandidate(token, fullCandidate);
            id = res.data.id;
            fullCandidate.id = id;
            return;
        }

        throw new Error("Could not login");
    });

    after(async () => {
        const {success} = await adapter.logout(token);
        if (!success) {
            throw new Error("Could not logout");
        }
    });

    it("is candidate valid", async () => {
        const {success, data} = await adapter.isValidCandidateID(id);
        expect(success, "Candidate should be valid").to.be.true;
        expect(data, "Candidate should be valid").to.be.true;
    });

    it("get candidate by ID", async () => {
        const {success, data, error} = await adapter.getCandidateByID(id);

        expect(success, "Should be able to get candidate by id. Error: " + error).to.be.true;
        expect(data).to.deep.equal(fullCandidate);
    });

    it("submit availability", async () => {
        const {success} = await adapter.submitAvailability(id, []);

        expect(success, "Should be able to add availability").to.be.true;
    });


});
