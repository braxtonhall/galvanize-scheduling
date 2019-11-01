import * as dotenv from 'dotenv';
dotenv.config({path: "../.env"});


export enum ConfigKey {
	awsRegion = "region",
	awsAccessKeyId = "awsAccessKeyId",
	awsSecretAccessKey = "awsSecretAccessKey",
	dbUrl = "dbUrl"
}

export class Config {
	private static instance: Config = null;
	
	public static getInstance(): Config {
		if (!Config.instance) {
			Config.instance = new Config();
		}
		return Config.instance;
	}

	private config: {[key: string]: any};

	private constructor() {
		try {
			this.config = {
				[ConfigKey.awsRegion]:     process.env.AWS_REGION,
				[ConfigKey.awsAccessKeyId]:      process.env.AWS_ACCESS_KEY_ID,
				[ConfigKey.awsSecretAccessKey]:  process.env.AWS_SECRET,
				[ConfigKey.dbUrl]: process.env.DB_URL,
			};
			// TODO check for testing scenario and change some of these props
		} catch (err) {
			// TODO
		}
	}

	public get(key: ConfigKey): any {
		return this.config[key] || null;
	}
	
	public set(key: ConfigKey, value: any): void {
		console.warn(`WARNING: Config setting ${key} to ${value}. ` +
			`This should NOT occur in production. TEST ONLY`);
		this.config[key] = value;
	}
}