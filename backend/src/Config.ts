
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

	public getProp(prop: ConfigKey): any {
		return this.config[prop] || null;
	}
}