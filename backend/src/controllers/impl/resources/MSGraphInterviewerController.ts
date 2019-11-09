import {InterviewerController} from "../../ResourceControllers";
import { interfaces } from "adapter";
import MSGraphController from "../../MSGraphController";
type IInterviewer = interfaces.IInterviewer;

export default class MSGraphInterviewerController extends InterviewerController {

	public async list(token: string): Promise<IInterviewer[]> {
		const groups = await MSGraphController.getGroups(token);

		let id;
		for (let group of groups.value) {
			if (group.displayName === 'Interviewers') { // TODO make this an environment variable
				id = group.id;
				break;
			}
		}

		if (!id) {
			return [];
		}
		// TODO wrap in try catch
		return await MSGraphController.getInterviewers(token, id);
	}

	public async create(token: string, resource: IInterviewer): Promise<IInterviewer> {
		throw  new Error("Unsupported Action - Creating new Interviewer");
	}

	public async delete(token: string, id: string): Promise<boolean> {
		throw  new Error("Unsupported Action - Deleting Interviewer");
	}

	public async exists(id: string): Promise<boolean> {
		throw  new Error("Unsupported Action - Interviewer Exists?");
	}

	public get(token: string, id: string): Promise<interfaces.IResource> {
		throw  new Error("Unsupported Action - Get Interviewer");
	}
}