import {DynamoDBController} from "./impl/DynamoDBController";

export interface IAuthController {
	saveAuth(user: any): Promise<boolean>;
	checkAuth(token: string): Promise<boolean>;
	removeAuth(token: string): Promise<boolean>;
}

export default class AuthController implements IAuthController {
	private static instance: AuthController = null;
	public static getInstance(): IAuthController {
		if (this.instance === null) {
			this.instance = new AuthController();
		}
		return this.instance;
	}
	
	private readonly dbc: DynamoDBController;

	private constructor() {
		this.dbc = DynamoDBController.getInstance();
	}

	public async checkAuth(token: string): Promise<boolean> {
		return !!(await this.dbc.getOAuth(token));
	}

	public async removeAuth(token: string): Promise<boolean> {
		await this.dbc.deleteOAuth(token);
		return true;
	}

	public async saveAuth(token: string): Promise<boolean> {
		await this.dbc.writeOAuth(token);
		return true;
	}
	
}
