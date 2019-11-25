import {InterviewerController} from "../../ResourceControllers";
import { interfaces } from "adapter";
import MSGraphController from "../../MSGraphController";
import {Config, ConfigKey} from "../../../Config";
import Log from "../../../Log";
type IInterviewer = interfaces.IInterviewer;

export default class MSGraphInterviewerController extends InterviewerController {

	public async list(token: string,  groupName?: string): Promise<IInterviewer[]> {
		try {
			groupName = typeof groupName === "string" ? groupName :
				Config.getInstance().get(ConfigKey.interviewerGroupName);
			const groups = await MSGraphController.getGroups(token);

			let id;
			for (let group of groups.value) {
				if (group.displayName === groupName) {
					id = group.id;
					break;
				}
			}

			if (!id) {
				return [];
			}

			return await MSGraphController.getInterviewers(token, id);
		} catch (err) {
			Log.error("There was an error in retrieving the interviewers", groupName, "from Graph:", err);
			throw new Error("Can't get Interviewers (" + groupName + ") from MSGraph");
		}
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