import {IInterviewerController} from "../../ResourceControllerTypes";
import { interfaces } from "adapter";
import MSGraphController from "../../MSGraphController";
type IInterviewer = interfaces.IInterviewer;

export default class MSGraphInterviewerController implements IInterviewerController {
	public async list(token: string): Promise<IInterviewer[]> {
		const client = MSGraphController.getClient(token);
		const groups = await MSGraphController.getGroups(client);

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

		return await MSGraphController.getInterviewers(client, id);
	}

	public async create(token: string, resource: IInterviewer): Promise<boolean> {
		throw  new Error("Unsupported Action - Creating new Interviewer");
	}

	public async delete(token: string, id: string): Promise<boolean> {
		throw  new Error("Unsupported Action - Deleting Interviewer");
	}

}