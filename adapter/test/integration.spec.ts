import {createTestToken, configGroupName} from "./TestUtils";
import CandidateTests from "./candidate.spec";
import AdminTests from "./admin.spec";
import ScheduleTests from "./schedule.spec";
import {Config, ConfigKey} from "../../backend/src/Config";

describe("Adapter Integration Tests", () => {
    const args = {
        INVALID_TOKEN: "invalidToken",
        token: null,
        groupName: null,

        // *** Flip flags below to turn certain tests on and off ***
        TEST_EMAIL: "test-integration@ph14solutions.onmicrosoft.com",
        emailTests: false, // sends availability emails to TEST_EMAIL
        verifyTestAccounts: true // test for directory-specific msgraph data
    };

    before(async () => {
        args.token = await createTestToken();
        args.groupName = configGroupName;
    });

    describe("Candidate Lifecycle", CandidateTests(args));
    describe("Administration", AdminTests(args));
    describe("Schedule Generation", ScheduleTests(args));
});
