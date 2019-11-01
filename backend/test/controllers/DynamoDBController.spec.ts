import "mocha";
import {DynamoDBController} from "../../src/controllers/impl/DynamoDBController";
import Dockerode from "dockerode";
import {Config, ConfigKey} from "../../src/Config";
import {MOCK_CANDIDATES} from "../Mocks";
import {expect} from "chai";

describe("DynamoDBController", () => {
	let dbc: DynamoDBController;
	let docker: Dockerode;
	let dbContainer: Dockerode.Container;
	
	const sleep = (seconds) => new Promise(resolve => setTimeout(resolve, seconds * 1000));

	before(async function() {
		this.timeout(30000);
		console.log("TEST SUITE DynamoDBController - before init");
		docker = new Dockerode();
		dbContainer = await docker.createContainer({
			Image:      "amazon/dynamodb-local",
			HostConfig: {
				PortBindings: {
					"8000/tcp": [
						{
							HostIP: "0.0.0.0",
							HostPort: "8000"
						}
					]
				},
			}
		});
		console.log("TEST SUITE DynamoDBController - before db container created");
		await dbContainer.start();
		console.log("TEST SUITE DynamoDBController - before db container started. Sleeping for internal startup time.");
		Config.getInstance().set(ConfigKey.dbUrl, "http://localhost:8000");
		await sleep(10);
		console.log("TEST SUITE DynamoDBController - before starting tests");
		dbc = DynamoDBController.getInstance();
	});
	
	after(async function() {
		console.log("TEST SUITE DynamoDBController - after init");
		await dbContainer.stop();
		console.log("TEST SUITE DynamoDBController - after container stopped");
	});

	it("Should list no candidates", async () => {
		expect(await dbc.getCandidates()).to.deep.equal([]);
	});

	it("Should list one candidate", async () => {
		await dbc.writeCandidate(MOCK_CANDIDATES[0]);
		expect(await dbc.getCandidates()).to.deep.equal([MOCK_CANDIDATES[0]]);
	});
});