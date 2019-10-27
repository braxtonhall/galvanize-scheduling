import IResourceFacade from "../IResourceFacade";
import {IResource, ICandidate, IInterviewer, IRoom} from "adapter/dist/interfaces";
import ControllerBuilder from "./ControllerBuilder";
import {ICandidateController, IInterviewerController, IRoomController, ResourceKind} from "../ResourceControllerTypes";

export default class ResourceFacade implements IResourceFacade {
	private readonly cc: ICandidateController;
	private readonly ic: IInterviewerController;
	private readonly rc: IRoomController;
	
	constructor() {
		this.cc = ControllerBuilder.getCandidateController();
		this.ic = ControllerBuilder.getInterviewerController();
		this.rc = ControllerBuilder.getRoomController();
	}
	
	public get(token: string, kind: ResourceKind): Promise<IResource[]> {
		switch (kind) {
			case ResourceKind.Candidate:
				return this.cc.getCandidates(token);
			case ResourceKind.Interviewer:
				return this.ic.getInterviewers(token);
			case ResourceKind.Room:
				return this.rc.getRooms(token);
			default:
				throw new Error("Unsupported Kind");
		}
	}

	public create(token: string, resource: IResource, kind: ResourceKind): Promise<boolean> {
		switch (kind) {
			case ResourceKind.Candidate:
				return this.cc.createCandidate(token, resource as ICandidate);
			case ResourceKind.Interviewer:
				return this.ic.createInterviewer(token, resource as IInterviewer);
			case ResourceKind.Room:
				return this.rc.createRoom(token, resource as IRoom);
			default:
				throw new Error("Unsupported Kind");
		}
	}
}