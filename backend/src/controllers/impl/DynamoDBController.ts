import AWS from "aws-sdk";
import {Config, ConfigKey} from "../../Config";
import { ICandidate, IRoom } from "adapter/dist/interfaces";
import {ResourceKind, assertIs} from "../Common";

export interface IDynamoDBController {
	getCandidate(id: string): Promise<ICandidate>;
	getCandidates(): Promise<ICandidate[]>;
	writeCandidate(candidate: ICandidate): Promise<void>;

	getRoom(id: string): Promise<IRoom>;
	getRooms(): Promise<IRoom[]>;
	writeRoom(room: IRoom): Promise<void>;
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
	private static readonly SESSION_TABLE: string = "Sessions"; // TODO use https://www.npmjs.com/package/connect-dynamodb ?
	
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
		}
	];
	
	private db: AWS.DynamoDB.DocumentClient = null;
	
	constructor() {
		// TODO
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

	public async getRoom(id: string): Promise<IRoom> {
		return await this.get(DynamoDBController.ROOM_TABLE, {id});
	}

	public async getRooms(): Promise<IRoom[]> {
		return await this.scan(DynamoDBController.ROOM_TABLE);
	}

	public async writeRoom(room: IRoom): Promise<void> {
		assertIs(ResourceKind.Room, room);
		await this.write(DynamoDBController.ROOM_TABLE, room);
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