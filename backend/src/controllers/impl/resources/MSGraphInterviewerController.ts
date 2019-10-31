import {IInterviewerController} from "../../ResourceControllerTypes";
import { IInterviewer } from "adapter/dist/interfaces";
import MSGraphController from "../../MSGraphController";

export default class MSGraphInterviewerController implements IInterviewerController {
	public async list(token: string): Promise<IInterviewer[]> {
		const client = MSGraphController.getClient(token);
		const groups = await client
			.api('/groups')
			.select('id, displayName')
			.get();


		let id;
		for (let group of groups.value) {
			if (group.displayName === 'Interviewers') {
				id = group.id;
				break;
			}
		}

		if (!id) {
			return [];
		}

		const data = await client
			.api(`/groups/${id}/members`)
			.select('id,givenName,surname')
			.get();

		return data.value as IInterviewer[];
	}

	public async create(token: string, resource: IInterviewer): Promise<boolean> {
		throw  new Error("Unsupported Action - Creating new Interviewer");
	}

	public async delete(token: string, id: string): Promise<boolean> {
		throw  new Error("Unsupported Action - Deleting Interviewer");
	}
	
}