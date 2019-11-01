import {ICandidateController} from "../../ResourceControllerTypes";
import { ICandidate } from "adapter/dist/interfaces";
import {DynamoDBController, IDynamoDBController} from "../DynamoDBController";

export default class DynamoDBCandidateController implements ICandidateController {
	private dbc: IDynamoDBController;

	constructor() {
		this.dbc = DynamoDBController.getInstance();
	}
	
	public async list(token: string): Promise<ICandidate[]> {
		return [];
	}

	public async create(token: string, resource: ICandidate): Promise<boolean> {
		return false;
	}

	public async delete(token: string, id: string): Promise<boolean> {
		return false;
	}
	
}