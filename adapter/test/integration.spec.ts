import {createTestToken, deauthTestToken} from "./TestUtils";
import candidateTests from "./candidate";

describe("Adapter Integration Tests", () => {
    let token = null;

    beforeEach(async () => {
        token = await createTestToken();
    });

    afterEach(async () => {
       await deauthTestToken(token);
       token = null;
    });

    describe("Candidate Lifecycle", candidateTests(token));
});
