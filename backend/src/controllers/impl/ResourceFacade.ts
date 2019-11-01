import IResourceFacade from "../IResourceFacade";
import {IResource, ICandidate, IInterviewer, IRoom} from "adapter/dist/interfaces";
import ControllerBuilder from "./ControllerBuilder";
import {ICandidateController, IInterviewerController, IRoomController} from "../ResourceControllerTypes";
import {ResourceKind} from "../Common";

export default class ResourceFacade implements IResourceFacade {
	private readonly cc: ICandidateController;
	private readonly ic: IInterviewerController;
	private readonly rc: IRoomController;
	
	constructor() {
		this.cc = ControllerBuilder.getCandidateController();
		this.ic = ControllerBuilder.getInterviewerController();
		this.rc = ControllerBuilder.getRoomController();
	}
	
	public list(token: string, kind: ResourceKind): Promise<IResource[]> {
		switch (kind) {
			case ResourceKind.Candidate:
				return this.cc.list(token);
			case ResourceKind.Interviewer:
				return this.ic.list(token);
			case ResourceKind.Room:
				return this.rc.list(token);
			default:
				throw new Error("Unsupported Kind");
		}
	}

	public create(token: string, resource: IResource, kind: ResourceKind): Promise<boolean> {
		switch (kind) {
			case ResourceKind.Candidate:
				return this.cc.create(token, resource as ICandidate);
			case ResourceKind.Interviewer:
				return this.ic.create(token, resource as IInterviewer);
			case ResourceKind.Room:
				return this.rc.create(token, resource as IRoom);
			default:
				throw new Error("Unsupported Kind");
		}
	}

	public delete(token: string, id: string, kind: ResourceKind): Promise<boolean> {
		switch (kind) {
			case ResourceKind.Candidate:
				return this.cc.delete(token, id);
			case ResourceKind.Interviewer:
				return this.ic.delete(token, id);
			case ResourceKind.Room:
				return this.rc.delete(token, id);
			default:
				throw new Error("Unsupported Kind");
		}
	}
}