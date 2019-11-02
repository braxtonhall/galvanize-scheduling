import {DynamoDBController} from "./impl/DynamoDBController";

export interface IAuthController {
	saveAuth(token: string): boolean;
	checkAuth(token: string): boolean;
	removeAuth(token: string): boolean;
}

export class AuthController implements IAuthController {
	private dbc: DynamoDBController = null;

	constructor() {
		this.dbc = DynamoDBController.getInstance();
	}

	public checkAuth(token: string): boolean {
		return true; // TODO implement stub
	}

	public removeAuth(token: string): boolean {
		return false; // TODO implement stub
	}

	public saveAuth(token: string): boolean {
		return false; // TODO implement stub
	}
	
}