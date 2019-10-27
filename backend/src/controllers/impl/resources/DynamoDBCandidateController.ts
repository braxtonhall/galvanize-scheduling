import {ICandidateController} from "../../ResourceControllerTypes";
import { ICandidate } from "adapter/dist/interfaces";

export default class DynamoDBCandidateController implements ICandidateController {
	public async list(token: string): Promise<ICandidate[]> {
		return [];
	}

	public async create(token: string, resource): Promise<boolean> {
		return false;
	}

	public async delete(token: string, resource): Promise<boolean> {
		return false;
	}
	
}