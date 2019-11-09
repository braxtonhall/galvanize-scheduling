import AWS from "aws-sdk";
import {Config, ConfigKey} from "../../Config";
import { interfaces } from "adapter";
type ICandidate = interfaces.ICandidate
type IRoom = interfaces.IRoom

export interface IDynamoDBController {
	getCandidate(id: string): Promise<ICandidate>;
	getCandidates(): Promise<ICandidate[]>;
	writeCandidate(candidate: ICandidate): Promise<void>;
	createCandidateID(): Promise<string>;
	deleteCandidate(id: string): Promise<void>;

	getRoom(name: string): Promise<IRoom>;
	getRooms(): Promise<IRoom[]>;
	writeRoom(room: IRoom): Promise<void>;
	deleteRoom(name: string): Promise<void>;

	writeOAuth(token: string): Promise<void>;
	deleteOAuth(token: string): Promise<void>;
	getOAuth(token: string): Promise<{token: string}>;
}


export class DynamoDBController implements IDynamoDBController {

	private static instance: DynamoDBController = null;

	public static getInstance(): DynamoDBController {
		if (!DynamoDBController.instance) {
			DynamoDBController.instance = new DynamoDBController();
		}
		return DynamoDBController.instance;
	}

	private static readonly CANDIDATE_TABLE: string = "Candidates";
	private static readonly ROOM_TABLE: string = "Rooms";
	private static readonly OAUTH_TABLE: string = "OAuths";
	private static readonly TICKER_TABLE: string = "Tickers";

	private static readonly SCHEMATA: any[] = [
		{
			TableName : DynamoDBController.CANDIDATE_TABLE,
			KeySchema: [
				{ AttributeName: "id", KeyType: "HASH" }
			],
			AttributeDefinitions: [
				{ AttributeName: "id", AttributeType: "S" }
			],
			ProvisionedThroughput: {
				ReadCapacityUnits: 10,
				WriteCapacityUnits: 10 // TODO
			}
		},
		{
			TableName : DynamoDBController.ROOM_TABLE,
			KeySchema: [
				{ AttributeName: "name", KeyType: "HASH" }
			],
			AttributeDefinitions: [
				{ AttributeName: "name", AttributeType: "S" }
			],
			ProvisionedThroughput: {
				ReadCapacityUnits: 10,
				WriteCapacityUnits: 10 // TODO what are these numbers?
			}
		},
		{
			TableName: DynamoDBController.OAUTH_TABLE,
			KeySchema: [
				{ AttributeName: "token", KeyType: "HASH" }
			],
			AttributeDefinitions: [
				{ AttributeName: "token", AttributeType: "S" }
			],
			ProvisionedThroughput: {
				ReadCapacityUnits: 10,
				WriteCapacityUnits: 10 // TODO
			}
		},
		{
			TableName: DynamoDBController.TICKER_TABLE,
			KeySchema: [
				{ AttributeName: "ticker", KeyType: "HASH" }
			],
			AttributeDefinitions: [
				{ AttributeName: "ticker", AttributeType: "S" }
			],
			ProvisionedThroughput: {
				ReadCapacityUnits: 10,
				WriteCapacityUnits: 10 // TODO
			}
		}
	];

	private db: AWS.DynamoDB.DocumentClient = null;

	constructor() {
		console.log("Database instance created");
	}

	public async getCandidate(id: string): Promise<ICandidate> {
		return await this.get(DynamoDBController.CANDIDATE_TABLE, {id});
	}

	public async getCandidates(): Promise<ICandidate[]> {
		return await this.scan(DynamoDBController.CANDIDATE_TABLE);
	}

	public async writeCandidate(candidate: ICandidate): Promise<void> {
		await this.write(DynamoDBController.CANDIDATE_TABLE, candidate);
	}

	public async deleteCandidate(id: string): Promise<void> {
		await this.delete(DynamoDBController.CANDIDATE_TABLE, {id});
	}

	public async getRoom(name: string): Promise<IRoom> {
		return await this.get(DynamoDBController.ROOM_TABLE, {name});
	}

	public async getRooms(): Promise<IRoom[]> {
		return await this.scan(DynamoDBController.ROOM_TABLE);
	}

	public async writeRoom(room: IRoom): Promise<void> {
		const {name} = room;
		await this.write(DynamoDBController.ROOM_TABLE, {name});
	}

	public async deleteRoom(name: string): Promise<void> {
		await this.delete(DynamoDBController.ROOM_TABLE, {name});
	}

	public async writeOAuth(token: string): Promise<void> {
		if (!token) {
			throw new Error("Required fields in user are missing. Cannot save to database");
		}
		// Expiration date (ttl) is current time + 1 hour in SECONDS
		const ttl = Math.round(Date.now() / 1000) + 60 * 60;
		await this.write(DynamoDBController.OAUTH_TABLE, {token, ttl});
	}

	public async deleteOAuth(token: string): Promise<void> {
		await this.delete(DynamoDBController.OAUTH_TABLE, {token});
	}

	public async getOAuth(token: string): Promise<{token: string}> {
		const auth = await this.get(DynamoDBController.OAUTH_TABLE, {token});
		// If the auth wasn't in the database return undefined
		if (!auth) {
			return auth;
		}
		// If the auth was in the database but is expired, return undefined
		// The auth will automatically be deleted at a later time
		if (auth["ttl"] < Math.round(Date.now() / 1000)) {
			return undefined;
		}
		// Remove ttl so it's not seen by the user. For DDBC use only
		delete auth["ttl"];
		// Return the auth
		return auth;
	}
	
	public async createCandidateID(): Promise<string> {
		const params = {
			TableName: DynamoDBController.TICKER_TABLE,
			Key:{
				"ticker": DynamoDBController.CANDIDATE_TABLE
			},
			UpdateExpression: "set tick = tick + :val",
			ExpressionAttributeValues:{
				":val": 1
			},
			ReturnValues:"UPDATED_NEW"
		};
		
		return await new Promise(async (resolve, reject) => {
			(await this.open()).update(params, function (err, data) {
				if (err) {
					reject(err);
				} else {
					resolve(String(data.Attributes.tick));
				}
			});
		});
	}

	private async get(table: string, attrs: any): Promise<any> {
		const params = {
			TableName: table,
			Key: attrs,
		};

		return await new Promise((async (resolve, reject) => {
			(await this.open()).get(params, function(err, data) {
				if (err) {
					reject(err);
				} else {
					resolve(data.Item);
				}
			});
		}));
	}

	private async delete(table: string, attrs: any): Promise<any> {
		const params = {
			TableName: table,
			Key: attrs,
		};

		return await new Promise((async (resolve, reject) => {
			(await this.open()).delete(params, function(err, data) {
				if (err) {
					reject(err);
				} else {
					resolve(data);
				}
			});
		}));
	}

	private async scan(table: string): Promise<any[]> {
		return await new Promise((async (resolve, reject) => {
			(await this.open()).scan({TableName : table}, function (err, data) {
				if (err) {
					reject(err);
				} else {
					resolve(data.Items);
				}
			});
		}));
	}

	private async where(table: string, query: any): Promise<any[]> {
		const params = {
			TableName : table,
			...query,
		};

		return await new Promise((async (resolve, reject) => {
			(await this.open()).query(params, function (err, data) {
				if (err) {
					reject(err);
				} else {
					resolve(data.Items);
				}
			});
		}));
	}

	private async write(table: string, item: any): Promise<void> {
		for (const [key, value] of Object.entries(item)) {
			if (typeof value === "string") {
				item[key] = value.trim();
			}
			if (item[key] === "") {
				delete item[key];
			}
		}

		const params = {
			TableName: table,
			Item: item,
		};

		return await new Promise((async (resolve, reject) => {
			(await this.open()).put(params, function(err) {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		}));
	}

	private async open(): Promise<AWS.DynamoDB.DocumentClient> {
		if (!this.db) {
			await this.initDatabase();
		}
		return this.db;
	}

	private async initDatabase(): Promise<void> {
		const cf: Config = Config.getInstance();
		AWS.config.update({
			region: cf.get(ConfigKey.awsRegion),
			accessKeyId: cf.get(ConfigKey.awsSecretAccessKey),
			secretAccessKey: cf.get(ConfigKey.awsSecretAccessKey),
			endpoint: new AWS.Endpoint(cf.get(ConfigKey.dbUrl))
		} as {[key: string]: any});
		// unfortunate static cast to get rid of build error
		
		const dynamoDB = new AWS.DynamoDB();
		for (const scheme of DynamoDBController.SCHEMATA) {
			try {
				await this.createTable(dynamoDB, scheme);
			} catch (err) {
				if (err.code === "ResourceInUseException") {
					console.warn("While initing the database, table was already in use");
				} else {
					throw new Error("Unable to allocate resource in DB");
				}
			}
		}
		
		try {
			await dynamoDB.updateTimeToLive({
				TableName: DynamoDBController.OAUTH_TABLE,
				TimeToLiveSpecification: {Enabled: true, AttributeName: "ttl"}
			});
		} catch (err) {
			console.error(err);
			console.warn("Error setting the time to live of the database. Ignoring");
		}
		
		this.db = new AWS.DynamoDB.DocumentClient();
		await new Promise(async (resolve, reject) => {
			this.db.put({
				TableName: DynamoDBController.TICKER_TABLE,
				Item: {
					ticker: DynamoDBController.CANDIDATE_TABLE,
					tick: 0
				}
			}, function (err) {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	}

	private createTable(db: AWS.DynamoDB, params: any): Promise<void> {
		return new Promise(((resolve, reject) => {
			db.createTable(params, function(err, data) {
				if (err) {
					reject(err);
				} else {
					console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
					resolve();
				}
			});
		}));
	}
}