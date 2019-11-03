import {createTestToken, deauthTestToken} from "./TestUtils";
import candidateTests from "./candidate";

describe("Adapter Integration Tests", () => {
    const args: any = {};

    before(async () => {
        args.token = await createTestToken();
    });

    after(async () => {
       await deauthTestToken(token);
       token = null;
    });

    describe("Candidate Lifecycle", candidateTests(args));

});
