import {IInterviewerController} from "../../ResourceControllerTypes";
import { IInterviewer } from "adapter/dist/interfaces";

export default class MSGraphInterviewerController implements IInterviewerController {
	public async getInterviewers(token: string): Promise<IInterviewer[]> {
		return [];
	}

	public async createInterviewer(token: string, resource: IInterviewer): Promise<boolean> {
		throw  new Error("Unsupported Action - Creating new Interviewer");
	}
	
}