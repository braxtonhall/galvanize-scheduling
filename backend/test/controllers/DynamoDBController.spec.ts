import "mocha";
import {DynamoDBController} from "../../src/controllers/impl/DynamoDBController";
import {MOCK_AUTHS, MOCK_CANDIDATES, MOCK_ROOMS, startDockerDatabase, stopDockerDatabase} from "../TestUtil";
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

	it("Should list one candidate with id", async() => {
		expect(await dbc.getCandidate("1")).to.deep.equal(MOCK_CANDIDATES[0]);
	});

	it("should return null when getting an unstored candidate", async() => {
		expect(await dbc.getCandidate("10")).to.deep.equal(undefined);
	});

	it ("hould list multiple candidates", async () => {
		await dbc.writeCandidate(MOCK_CANDIDATES[1]);
		await dbc.writeCandidate(MOCK_CANDIDATES[2]);
		// scan api returns items in random order so used deep members
		expect(await dbc.getCandidates()).to.have.deep.members(MOCK_CANDIDATES);
	});
	 it("Should delete a candidate", async () => {
		await dbc.deleteCandidate(MOCK_CANDIDATES[0].id);
		expect(await dbc.getCandidates()).to.have.deep.members(MOCK_CANDIDATES.slice(1,3));
	});

	it("Should list no rooms", async () => {
		expect(await dbc.getRooms()).to.deep.equal([]);
	});

	it("Should list one room", async () => {
		await dbc.writeRoom(MOCK_ROOMS[0]);
		expect(await dbc.getRooms()).to.deep.equal([{name: MOCK_ROOMS[0].name}]);
	});

	it ("Should list one room with id", async () => {
		expect(await dbc.getRoom("1")).to.deep.equal({name: MOCK_ROOMS[0].name});
	});

	it ("Should list multiple rooms", async () => {
		await dbc.writeRoom(MOCK_ROOMS[1]);
		await dbc.writeRoom(MOCK_ROOMS[2]);
		expect(await dbc.getRooms()).to.have.deep.members(MOCK_ROOMS.map(r => ({name: r.name})));
	});

	it("should return null when getting an unstored room", async() => {
		expect(await dbc.getRoom("10")).to.deep.equal(undefined);
	});

	it("Should delete a room", async () => {
		await dbc.deleteRoom(MOCK_ROOMS[0].name);
		expect(await dbc.getRooms()).to.have.deep.members(MOCK_ROOMS.slice(1,3).map(r => ({name: r.name})));
	});

	it ("Should not throw an error when trying to delete a unstored candidtate", async () => {
		try {
			await dbc.deleteCandidate("10");
		} catch (err) {
			expect.fail();
		}
	});

	it ("Should not throw an error when trying to delete a unstored room", async () => {
		try {
			await dbc.deleteRoom("10");
		} catch (err) {
			expect.fail();
		}
	});
	
	it("Should save a token", async () => {
		await dbc.writeOAuth(MOCK_AUTHS[0].token);
		expect(await dbc.getOAuth(MOCK_AUTHS[0].token)).to.deep.equal(MOCK_AUTHS[0]);
	});
	
	it("Should create multiple unique candidate IDs", async () => {
		// @ts-ignore
		let output = await dbc.getCandidateId();
		expect(output).to.deep.equal("1");
		// @ts-ignore
		output = await dbc.getCandidateId();
		expect(output).to.deep.equal("2");
	});
	
	// it("Should create a new candidate and give it an ID", async () => { // TODO
	// 	const output = await dbc.createCandidate({...MOCK_CANDIDATES, id: undefined});
	// 	expect(output).to.deep.equal({...MOCK_CANDIDATES, id: "3"});
	// });
});