import {ICandidateController} from "../../ResourceControllerTypes";
import { interfaces } from "adapter";
import {DynamoDBController, IDynamoDBController} from "../DynamoDBController";

export default class DynamoDBCandidateController implements ICandidateController {
	private dbc: IDynamoDBController;

	constructor() {
		this.dbc = DynamoDBController.getInstance();
	}

	public async list(token: string): Promise<interfaces.ICandidate[]> {
		return await this.dbc.getCandidates();
	}

	public async create(token: string, resource: interfaces.ICandidate): Promise<boolean> {
		// TODO validation?
		// TODO: add an id so creating candidates work?
		await this.dbc.writeCandidate(resource);
		return true;
	}

	public async delete(token: string, id: string): Promise<boolean> {
		await this.dbc.deleteCandidate(id);
		return true; // TODO more guards?
	}

}