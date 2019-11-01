import "mocha";
import {DynamoDBController} from "../../src/controllers/impl/DynamoDBController";
import {MOCK_CANDIDATES, MOCK_ROOMS, startDockerDatabase, stopDockerDatabase} from "../TestUtil";
import {expect} from "chai";

describe("DynamoDBController", () => {
	let dbc: DynamoDBController;

	before(async function() {
		this.timeout(30000);
		console.log("TEST SUITE DynamoDBController - before init");
		await startDockerDatabase(this);
		console.log("TEST SUITE DynamoDBController - before starting tests");
		dbc = DynamoDBController.getInstance();
	});
	
	after(async function() {
		console.log("TEST SUITE DynamoDBController - after init");
		await stopDockerDatabase();
		console.log("TEST SUITE DynamoDBController - after container stopped");
	});

	it("Should list no candidates", async () => {
		expect(await dbc.getCandidates()).to.deep.equal([]);
	});

	it("Should list one candidate", async () => {
		await dbc.writeCandidate(MOCK_CANDIDATES[0]);
		expect(await dbc.getCandidates()).to.deep.equal([MOCK_CANDIDATES[0]]);
	});
	
	it("Should delete a candidate", async () => {
		await dbc.deleteCandidate(MOCK_CANDIDATES[0].id);
		expect(await dbc.getCandidates()).to.deep.equal([]);
	});

	it("Should list no rooms", async () => {
		expect(await dbc.getRooms()).to.deep.equal([]);
	});

	it("Should list one room", async () => {
		await dbc.writeRoom(MOCK_ROOMS[0]);
		expect(await dbc.getRooms()).to.deep.equal([MOCK_ROOMS[0]]);
	});

	it("Should delete a room", async () => {
		await dbc.deleteRoom(MOCK_ROOMS[0].name);
		expect(await dbc.getRooms()).to.deep.equal([]);
	});
});