import {CandidateController} from "../../ResourceControllers";
import {interfaces} from "adapter";
import {DynamoDBController, IDynamoDBController} from "../DynamoDBController";

export default class DynamoDBCandidateController extends CandidateController {
	private dbc: IDynamoDBController;

	constructor() {
		super();
		this.dbc = DynamoDBController.getInstance();
	}

	public async list(token: string): Promise<interfaces.ICandidate[]> {
		return await this.dbc.getCandidates();
	}

	public async create(token: string, resource: interfaces.ICandidate): Promise<interfaces.ICandidate> {
		// TODO validation?
		// TODO: add an id so creating candidates work?
		resource = this.assertCandidate(resource);
		if (typeof resource.id === "string") {
			await this.dbc.writeCandidate(resource);
			return resource;
		} else {
			return await this.dbc.createCandidate(resource);
		}
	}

	public async delete(token: string, id: string): Promise<boolean> {
		await this.dbc.deleteCandidate(id);
		return true; // TODO more guards?
	}
	
	public async exists(id: string): Promise<boolean> {
		return typeof (await this.dbc.getCandidate(id)) === "object";
	}

}