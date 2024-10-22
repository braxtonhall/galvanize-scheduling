import * as dotenv from 'dotenv';
dotenv.config({path: "../.env"});
import Log from "./Log"

export enum ConfigKey {
	// Basic
	backendPort = "port",
	frontendUrl = "frontendUrl",
	
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
	msEmailEndpoint = "emailEndpoint",
	msScheduleEndpoint = "getScheduleEndpoint",
	
	// Internal
	interviewerGroupName = "interviewerGroupName",
	
	// Test
	testSecretKey = "testSecretKey",
	production = "production"
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
				[ConfigKey.backendPort]: process.env.PORT,
				[ConfigKey.frontendUrl]: process.env.FRONTEND_URL,
				
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
				// These two config options are hardcoded because they should always be these values
				//    unless they are being overridden by the tests
				[ConfigKey.msEmailEndpoint]:		  "/me/sendMail",
				[ConfigKey.msScheduleEndpoint]:		  "/me/calendar/getSchedule",
				
				// Internal
				[ConfigKey.interviewerGroupName]: process.env.INTERVIEWER_GROUP_NAME,
				
				// Testing
				[ConfigKey.testSecretKey]: process.env.TEST_SECRET_KEY,
				[ConfigKey.production]: typeof process.env.PRODUCTION === "string" &&
				process.env.PRODUCTION.toLowerCase() === 'true',
			};
		} catch (err) {
			Log.error("Config setup error -", err);
		}
	}

	public get(key: ConfigKey): any {
		if (this.config[key] !== null && this.config[key] !== undefined) {
			return this.config[key];
		} else {
			Log.warn(`Config Key "${key}" was not set, yet accessed.`);
			return null;
		}
	}
	
	public set(key: ConfigKey, value: any): void {
		Log.warn(`WARNING: Config setting "${key}" to "${value}". ` +
			`This should NOT occur in production. TEST ONLY`);
		this.config[key] = value;
	}
}