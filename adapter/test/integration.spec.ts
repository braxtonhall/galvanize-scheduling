import {createTestToken, deauthTestToken} from "./TestUtils";
import candidateTests from "./candidate";

describe("Adapter Integration Tests", () => {
    let token = null;

    before(async () => {
        token = await createTestToken();
    });

    after(async () => {
       await deauthTestToken(token);
       token = null;
    });

    describe("Candidate Lifecycle", candidateTests(token));

});
