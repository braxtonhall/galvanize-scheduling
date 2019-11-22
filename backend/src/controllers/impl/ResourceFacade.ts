import IResourceFacade from "../IResourceFacade";
import {interfaces} from "adapter";
import ControllerBuilder from "./ControllerBuilder";
import {CandidateController, InterviewerController, RoomController} from "../ResourceControllers";
import {IScheduleAvailabilities, ResourceKind} from "../Common";
import MSGraphController from "../MSGraphController";
import {generateSchedules} from "../SchedulerUtils";

type IResource = interfaces.IResource;
type ICandidate = interfaces.ICandidate;
type IInterviewer = interfaces.IInterviewer;
type IRoom = interfaces.IRoom;
type ISchedule = interfaces.ISchedule;

export default class ResourceFacade implements IResourceFacade {
	private readonly cc: CandidateController;
	private readonly ic: InterviewerController;
	private readonly rc: RoomController;

	constructor() {
		this.cc = ControllerBuilder.getCandidateController();
		this.ic = ControllerBuilder.getInterviewerController();
		this.rc = ControllerBuilder.getRoomController();
	}

	public list(token: string, kind: ResourceKind, options?: any): Promise<any[]> {
		switch (kind) {
			case ResourceKind.Candidate:
				return this.cc.list(token);
			case ResourceKind.Interviewer:
				return this.ic.list(token, options.groupName);
			case ResourceKind.Room:
				return this.rc.list(token);
			case ResourceKind.Schedule:
				return this.returnSchedules(token, options);
			default:
				throw new Error("Unsupported Kind");
		}
	}

	public create(token: string, resource: IResource, kind: ResourceKind): Promise<IResource> {
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

	public exists(id: string, kind: ResourceKind): Promise<boolean> {
		switch (kind) {
			case ResourceKind.Candidate:
				return this.cc.exists(id);
			case ResourceKind.Interviewer:
				return this.ic.exists(id);
			case ResourceKind.Room:
				return this.rc.exists(id);
			default:
				throw new Error("Unsupported Kind");
		}
	}

	public get(token: string, id: string, kind: ResourceKind): Promise<IResource> {
		switch (kind) {
			case ResourceKind.Candidate:
				return this.cc.get(token, id);
			case ResourceKind.Interviewer:
				return this.ic.get(token, id);
			case ResourceKind.Room:
				return this.rc.get(token, id);
			default:
				throw new Error("Unsupported Kind");
		}
	}

	
	private async returnSchedules(token: string, options: interfaces.IGetSchedulesOptions): Promise<ISchedule[]> {
		if (!options) {
			throw new Error("Attempting to schedule without any options!");
		}
		const rooms = (await this.rc.list(token)) as Array<interfaces.IRoom>;
		const avails: IScheduleAvailabilities = await MSGraphController.getScheduleWrapper(token, options.candidate, rooms, options.preferences);
		return generateSchedules(avails);
	}
}