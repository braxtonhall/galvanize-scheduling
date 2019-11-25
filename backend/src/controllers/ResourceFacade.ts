import {interfaces} from "adapter";
import ControllerBuilder from "./impl/ControllerBuilder";
import {CandidateController, InterviewerController, RoomController} from "./ResourceControllers";
import {IScheduleAvailabilities, ResourceKind} from "./Common";
import MSGraphController from "./MSGraphController";
import {generateSchedules} from "./SchedulerUtils";
import {info} from "../Log";

type IResource = interfaces.IResource;
type ICandidate = interfaces.ICandidate;
type IInterviewer = interfaces.IInterviewer;
type IRoom = interfaces.IRoom;
type ISchedule = interfaces.ISchedule;

/**
 * Interface IResourceFacade
 */
export interface IResourceFacade {
	/**
	 * List all the resources related to the type of resource.
	 * @param {string} token - The token needed for requests.
	 * @param {ResourceKind} kind - The type of resource.
	 * @param options - Optional addional options for the request.
	 * @returns {Promise<Array<IResource>>} The list of resources related to the kind.
	 */
	list(token: string, kind: ResourceKind, options?: any): Promise<interfaces.IResource[]>;
	/**
	 * Create a resource.
	 * @param {string} token - The token needed for requests.
	 * @param {IResource} resource - The resource to create.
	 * @param {ResourceKind} kind - The type of resource.
	 * @returns {Promise<Array<IResource>>} The resource created.
	 */
	create(token: string, resource: interfaces.IResource, kind: ResourceKind): Promise<interfaces.IResource>;
	/**
	 * Deletes a resource.
	 * @param {string} token - The token needed for requests.
	 * @param {string} id - the id of the resource to delete.
	 * @param {ResourceKind} kind - The type of resource.
	 * @returns {Promise<Array<boolean>>} If deleted successfully or failed.
	 */
	delete(token: string, id: string, kind: ResourceKind): Promise<boolean>;
	/**
	 * Checks if resource exists
	 * @param {string} id - The token needed for requests.
	 * @param {ResourceKind} kind - The type of resource.
	 * @returns {Promise<Array<boolean>>} True if exists false if not.
	 */
	exists(id: string, kind: ResourceKind): Promise<boolean>;
	/**
	 * Gets a resource.
	 * @param {string} token - The token needed for requests.
	 * @param {string} id - The id of the resource.
	 * @param {ResourceKind} kind - The type of resource.
	 * @returns {Promise<Array<IResource>>} The resource created.
	 */
	get(token: string, id: string, kind: ResourceKind): Promise<interfaces.IResource>;
}

/**
 * Class representing the facade for resources in the system.
 * This feature the main 5 actions for a resource type: list, create, delete, exists, and get.
 * @implements IResourceFacade
 */
export class ResourceFacade implements IResourceFacade {
	private readonly cc: CandidateController;
	private readonly ic: InterviewerController;
	private readonly rc: RoomController;

	/**
	 * @constructor
	 */
	constructor() {
		this.cc = ControllerBuilder.getCandidateController();
		this.ic = ControllerBuilder.getInterviewerController();
		this.rc = ControllerBuilder.getRoomController();
	}

	/**
	 * @see IResourceFacade.list
	 */
	public list(token: string, kind: ResourceKind, options?: any): Promise<IResource[]> {
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

	/**
	 * @see IResourceFacade.create
	 */
	public create(token: string, resource: IResource, kind: ResourceKind): Promise<IResource> {
		switch (kind) {
			case ResourceKind.Candidate:
				return this.cc.create(token, resource as ICandidate);
			case ResourceKind.Interviewer:
				return this.ic.create(token, resource as IInterviewer);
			case ResourceKind.Room:
				return this.rc.create(token, resource as IRoom);
			case ResourceKind.Schedule:
				return this.confirmSchedule(token, resource as ISchedule);
			default:
				throw new Error("Unsupported Kind");
		}
	}

	/**
	 * @see IResourceFacade.delete
	 */
	public delete(token: string, id: string, kind: ResourceKind): Promise<boolean> {
		switch (kind) {
			case ResourceKind.Candidate:
				return this.cc.delete(token, id);
			case ResourceKind.Interviewer:
				return this.ic.delete(token, id);
			case ResourceKind.Room:
				return this.rc.delete(token, id);
			case ResourceKind.Schedule:
				return this.removeSchedule(token, id);
			default:
				throw new Error("Unsupported Kind");
		}
	}

	/**
	 * @see IResourceFacade.exists
	 */
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

	/**
	 * @see IResourceFacade.get
	 */
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
	
	@info
	private async returnSchedules(token: string, options: interfaces.IGetSchedulesOptions): Promise<ISchedule[]> {
		if (!options) {
			throw new Error("Attempting to schedule without any options!");
		}
		const candidate = options.candidate;
		const preferences = options.preferences.filter(p => p.minutes > 0);
		const rooms = ((await this.rc.list(token)) as interfaces.IRoom[]).filter(r => r.eligible);
		const avails: IScheduleAvailabilities = await MSGraphController.getScheduleWrapper(token, candidate, rooms, preferences);
		return generateSchedules(options.candidate, avails);
	}
	
	private async removeSchedule(token, id): Promise<boolean> {
		const candidate: ICandidate = await this.cc.get(token, id) as ICandidate;
		if (candidate.schedule) {
			delete candidate.schedule;
			return !!(await this.cc.create(token, candidate));
		} else {
			return false;
		}
	}
	
	private confirmSchedule(token: string, schedule: ISchedule): Promise<IResource> {
		const candidate: interfaces.ICandidate = schedule.candidate;
		candidate.schedule = schedule.meetings.map(m => ({
			start: m.start,
			end: m.end,
			note: m.room.name + `;${m.interviewers.map(i => i.firstName).join(";")}`,
			id: m.id,
		}));
		return this.cc.create(token, candidate);
	}
}