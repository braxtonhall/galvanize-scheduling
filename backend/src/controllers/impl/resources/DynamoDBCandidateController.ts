import {ICandidateController} from "../../ResourceControllerTypes";
import { ICandidate } from "adapter/dist/interfaces";

export default class DynamoDBCandidateController implements ICandidateController {
	public async getCandidates(token: string): Promise<ICandidate[]> {
		return [];
	}

	public async createCandidate(token: string, resource): Promise<boolean> {
		return true;
	}
	
}