import * as dotenv from 'dotenv';
dotenv.config({path: "../.env"});


export enum ConfigKey {
	// Basic
	port = "port",
	
	// DynamoDB
	awsRegion = "region",
	awsAccessKeyId = "awsAccessKeyId",
	awsSecretAccessKey = "awsSecretAccessKey",
	dbUrl = "dbUrl",
	
	// MicrosoftAPIs
	msOAuthAppId = "oAuthAppId",
	msOAuthAppPassword = "oAthAppPassword",
	msOAuthRedirectURI = "oAuthRedirectURI",
	msOAuthScopes = "oAuthScopes",
	msOAuthAuthority = "oAuthAuthority",
	msOAuthMetaData = "oAuthMetaData",
	msOAuthAuthorizeEndpoint = "oAuthAuthorizeEndpoint",
	msOAuthTokenEndpoint = "oAuthTokenEndpoint",
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
				[ConfigKey.port]: process.env.PORT,
				
				// DynamoDB
				[ConfigKey.awsRegion]:     		 process.env.AWS_REGION,
				[ConfigKey.awsAccessKeyId]:      process.env.AWS_ACCESS_KEY_ID,
				[ConfigKey.awsSecretAccessKey]:  process.env.AWS_SECRET,
				[ConfigKey.dbUrl]: 				 process.env.DB_URL,

				// MicrosoftAPIs
				[ConfigKey.msOAuthAppId]: 			  process.env.OAUTH_APP_ID,
				[ConfigKey.msOAuthAppPassword]: 	  process.env.OAUTH_APP_PASSWORD,
				[ConfigKey.msOAuthRedirectURI]: 	  process.env.OAUTH_REDIRECT_URI,
				[ConfigKey.msOAuthScopes]: 			  process.env.OAUTH_SCOPES,
				[ConfigKey.msOAuthAuthority]: 		  process.env.OAUTH_AUTHORITY,
				[ConfigKey.msOAuthMetaData]: 		  process.env.OAUTH_ID_METADATA,
				[ConfigKey.msOAuthAuthorizeEndpoint]: process.env.OAUTH_AUTHORIZE_ENDPOINT,
				[ConfigKey.msOAuthTokenEndpoint]: 	  process.env.OAUTH_TOKEN_ENDPOINT,
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