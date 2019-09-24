import adapter from "./adapter";
import {expect} from 'chai';

describe("Test used to see if the server is up and running", () => {
	it("health", async () => {
		const {success} = await adapter.health();
		expect(success).to.be.true;
	});
});
