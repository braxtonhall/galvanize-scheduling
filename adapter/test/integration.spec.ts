import {createTestToken} from "./TestUtils";
import candidateTests from "./candidate";

describe("Adapter Integration Tests", () => {
    const args = {
        token: null,
        emailTests: false
    };

    before(async () => {
        args.token = await createTestToken();
    });

    context("Candidate Lifecycle", candidateTests(args));

});
