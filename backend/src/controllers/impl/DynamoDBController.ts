import AWS from "aws-sdk";
import {Config, ConfigKey} from "../../Config";
import {ResourceKind, assertIs} from "../Common";
import { interfaces } from "adapter";
import {MemoryStore, Store} from "express-session";
import DynamoDBStore from "dynamodb-store"
type ICandidate = interfaces.ICandidate
type IRoom = interfaces.IRoom

export interface IDynamoDBController {
	getStore(): Store | MemoryStore;
	
	getCandidate(id: string): Promise<ICandidate>;
	getCandidates(): Promise<ICandidate[]>;
	writeCandidate(candidate: ICandidate): Promise<void>;
	deleteCandidate(id: string): Promise<void>;

	getRoom(name: string): Promise<IRoom>;
	getRooms(): Promise<IRoom[]>;
	writeRoom(room: IRoom): Promise<void>;
	deleteRoom(name: string): Promise<void>;

	writeOAuth(id: string, token: string): Promise<void>;
	deleteOAuth(id: string): Promise<void>;
	getOAuth(id: string): Promise<any>;
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
	private static readonly SESSION_TABLE: string = "Sessions";
	private static readonly OAUTH_TABLE: string = "OAuths";

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
			TableName : DynamoDBController.OAUTH_TABLE,
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
		}
	];

	private db: AWS.DynamoDB.DocumentClient = null;

	constructor() {
		// TODO
	}
	
	public getStore(): Store | MemoryStore {
		return new DynamoDBStore({
			table: {
				name: DynamoDBController.SESSION_TABLE,
			},
			dynamoConfig: {
				accessKeyId: Config.getInstance().get(ConfigKey.awsAccessKeyId),
				secretAccessKey: Config.getInstance().get(ConfigKey.awsSecretAccessKey),
				region: Config.getInstance().get(ConfigKey.awsRegion),
				endpoint: Config.getInstance().get(ConfigKey.dbUrl)
			},
			keepExpired: false,
			touchInterval: 30000,
			ttl: 600000
		});
	}

	public async getCandidate(id: string): Promise<ICandidate> {
		return await this.get(DynamoDBController.CANDIDATE_TABLE, {id});
	}

	public async getCandidates(): Promise<ICandidate[]> {
		return await this.scan(DynamoDBController.CANDIDATE_TABLE);
	}

	public async writeCandidate(candidate: ICandidate): Promise<void> {
		assertIs(ResourceKind.Candidate, candidate);
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
		assertIs(ResourceKind.Room, room);
		await this.write(DynamoDBController.ROOM_TABLE, room);
	}

	public async deleteRoom(name: string): Promise<void> {
		await this.delete(DynamoDBController.ROOM_TABLE, {name});
	}

	public async writeOAuth(id: string, token: string): Promise<void> {
		if (!id || !token) {
			// TODO authentication
			throw new Error("Required fields in user are missing. Cannot save to database");
		}
		await this.write(DynamoDBController.OAUTH_TABLE, {id, token});
	}

	public async deleteOAuth(id: string): Promise<void> {
		await this.delete(DynamoDBController.OAUTH_TABLE, {id});
	}

	public async getOAuth(id: string): Promise<any> {
		await this.get(DynamoDBController.OAUTH_TABLE, {id});
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
					resolve(data);
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
			this.db = new AWS.DynamoDB.DocumentClient();
		}
		return this.db;
	}

	private async initDatabase(): Promise<void> {
		const cf: Config = Config.getInstance();
		AWS.config.update({
			region: cf.get(ConfigKey.awsRegion),
			accessKeyId: cf.get(ConfigKey.awsSecretAccessKey),
			secretAccessKey: cf.get(ConfigKey.awsSecretAccessKey),
			// @ts-ignore // TODO why is this?
			endpoint: new AWS.Endpoint(cf.get(ConfigKey.dbUrl))
		});
		const dynamoDB = new AWS.DynamoDB();
		for (const scheme of DynamoDBController.SCHEMATA) {
			try {
				await this.createTable(dynamoDB, scheme);
			} catch (err) {
				if (err.code === "ResourceInUseException") {
					// Pass. Already created.
					// TODO log?
				} else {
					throw new Error("Unable to allocate resource in DB");
				}
			}
		}
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