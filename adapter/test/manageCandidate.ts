import {interfaces} from "../dist";
import adapter from "./adapter";
import {expect} from "chai";

const manageCandidatesTest: any = () => {
    let token: string;

    const fullCandidate: interfaces.ICandidate = {
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

    context("create candidate with empty object", () => {
        it("Should succeed", async () => {
            const candidate: interfaces.ICandidate = {};
            const {success, error} = await adapter.createCandidate(token, candidate);
            expect(success, "Should be able to create candidate with empty field. Error: " + error).to.be.true;
        })
    });

    context("create candidate with fields", () => {
        it("some fields", async () => {
            const candidate: interfaces.ICandidate = {
                firstName: "John"
            };

            const {success, data, error} = await adapter.createCandidate(token, candidate);
            expect(success, "Should be able to create candidate with some fields. Error: " + error).to.be.true;
            expect(data).to.have.all.keys("id", "firstName");
        });

        it("all fields", async () => {
            const {success, data, error} = await adapter.createCandidate(token, fullCandidate);
            expect(success, "Should be able to create candidate with all fields. Error: " + error).to.be.true;
            expect(data).to.have.all.keys("id", "email", "phoneNumber", "firstName", "lastName", "position", "notes");
        });
    });

    context("validation errors", () => {
        it("email", async() => {
            const candidate: interfaces.ICandidate = {email: "test"};
            const {success, error} = await adapter.createCandidate(token, candidate);

            expect(success, "Email should not be valid").to.be.false;
        });

        it("phone number", async () => {
            const candidate = {phoneNumber: '123'};
            const {success, data} = await adapter.createCandidate(token, candidate);

            expect(success, "Phone Number should not be valid").to.be.false;
        });
    });

    context("get candidates", () => {

        it("all candidates", async () => {
            const {success, data, error} = await adapter.getCandidates(token);

            expect(success, "Should be able to get all candidates. Error: " + error).to.be.true;
            expect(data).to.be.an('array');
        });
    });

    context("update candidate", () => {
        let testCandidate: interfaces.ICandidate = {
            email: "john.test@test.com",
            phoneNumber: "778-456-4567",
            firstName: "John",
            lastName: "D",
            position: "Software Developer",
            notes: "Good"
        };

        it("update a candidate not in data", async () => {
            const {success, data, error} = await adapter.updateCandidate(token, testCandidate);
            expect(success, "Should not update a candidate not registered. Error: " + error).to.be.false;
        });

        it("update a candidate in data", async () => {
            const res = await adapter.createCandidate(token, fullCandidate);
            testCandidate.id = res.data.id;

            const {success, data, error} = await adapter.updateCandidate(token, testCandidate);
            expect(success, "Should be able to update a candidate. Error: " + error).to.be.true;
        });
    });

    context("delete candidate", () => {
        it("delete a candidate", async () => {
            await adapter.createCandidate(token, fullCandidate);

            const {data} = await adapter.getCandidates(token);
            const first = data[0];

            const {success, error} = await adapter.deleteCandidate(token, first);
            expect(success, "Should be able to delete a candidate. Error: " + error).to.be.true;

            const res = await adapter.getCandidates(token);
            expect(data.length - 1).to.equal(res.data.length);
        });
    });
};

export default manageCandidatesTest;