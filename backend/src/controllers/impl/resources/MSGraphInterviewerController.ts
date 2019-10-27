import {IInterviewerController} from "../../ResourceControllerTypes";
import { IInterviewer } from "adapter/dist/interfaces";

export default class MSGraphInterviewerController implements IInterviewerController {
	public async list(token: string): Promise<IInterviewer[]> {
		return [];
	}

	public async create(token: string, resource: IInterviewer): Promise<boolean> {
		throw  new Error("Unsupported Action - Creating new Interviewer");
	}

	public async delete(token: string, resource: IInterviewer): Promise<boolean> {
		throw  new Error("Unsupported Action - Creating new Interviewer");
	}
	
}