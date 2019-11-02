import {interfaces} from '../dist';
import adapter from "./adapter";
import {expect} from "chai";

const scheduleTests: any = () => {
    let token: string;
    let candidate: interfaces.ICandidate;

    before(async () => {
        const {success, data} = await adapter.login("1", "1");
        if (success) {
            token = data;
            const testCandidate: interfaces.ICandidate = {
                email: "john.doe@test.com",
                phoneNumber: "778-123-4567",
                firstName: "John",
                lastName: "Doe",
                position: "Lead Developer",
                notes: "Good"
            };
            const res = await adapter.createCandidate(token, testCandidate);
            candidate = res.data;
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

    context("availability", () => {
        it("send availability to unregisters candidate", async() => {
            let test: interfaces.ICandidate = {
                email: "test@test.t"
            };
            const {success, error} = await adapter.sendAvailabilityEmail(token, test);
            expect(success, "Should not send availability. Error: " + error).to.be.false;
        });

        it("send availability email", async () => {
            const {success} = await adapter.sendAvailabilityEmail(token, candidate);
            expect(success, "Should be able to send availability.").to.be.true;
        });
    });

    context("interviewers", () => {
        it("get interviewers", async () => {
            const {success, data ,error} = await adapter.getInterviewers(token);
            expect(success, "Should be able to get interviewers. Error: " + error).to.be.true;
        });
    });

    context("scheduling", () => {
        it("get schedules available", async () => {
            const options: interfaces.IGetSchedulesOptions = {}; // fill later
            const {success, error} = await adapter.getSchedules(token, options);
            expect(success, "Should be able to get schedules. Error: " + error).to.be.true;
        });

        it("confirm schedule", async () => {
            const schedule: interfaces.ISchedule = {
                candidate: candidate,
                meetings: []
            }; // fill later
            const {success, error} = await adapter.confirmSchedule(token, schedule);
            expect(success, "Should be able to confirm a schedule. Error: " + error).to.be.true;
        });
    });
};

export default scheduleTests;