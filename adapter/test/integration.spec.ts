import {createTestToken, configGroupName} from "./TestUtils";
import CandidateTests from "./candidate.spec";
import AdminTests from "./admin.spec";
import ScheduleTests from "./schedule.spec";

describe("Adapter Integration Tests", () => {
    const args = {
        INVALID_TOKEN: "invalidToken",

        token: null,
        groupName: null,

        emailTests: false,
        verifyTestAccounts: true
    };

    before(async () => {
        args.token = await createTestToken();
        args.groupName = configGroupName;
    });

    // describe("Candidate Lifecycle", CandidateTests(args));
    describe("Administration", AdminTests(args));
    describe("Schedule Generation", ScheduleTests(args)); // TODO

});
