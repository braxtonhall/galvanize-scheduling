import {DynamoDBController} from "./impl/DynamoDBController";

export interface IAuthController {
	saveAuth(user: any): Promise<boolean>;
	checkAuth(req: any): Promise<boolean>;
	removeAuth(id: string): Promise<boolean>;
}

export class AuthController implements IAuthController {
	private dbc: DynamoDBController = null;

	constructor() {
		this.dbc = DynamoDBController.getInstance();
	}

	public async checkAuth(req: any): Promise<boolean> {
		return req.isAuthenticated();
	}

	public async removeAuth(id: string): Promise<boolean> {
		return false; // TODO implement stub
	}

	public async saveAuth(user: any): Promise<boolean> {
		await this.dbc.writeOAuth(user);
		return false; // TODO implement stub
	}
	
}

export default AuthController;