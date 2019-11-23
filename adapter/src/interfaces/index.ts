import {Moment} from "moment";

export interface IResource {
	id?: string,
}

export interface IRoom extends IResource {
	name: string,
	eligible?: boolean,
	email?: string,
	capacity?: number,
}

export interface ICandidate extends IResource {
	email: string,
	scheduled: boolean,
	phoneNumber?: string,
	firstName?: string,
	lastName?: string,
	position?: string,
	notes?: string,
	availability?: IAvailability
}

export interface IInterviewer extends IResource {
	email: string,
	firstName: string,
	lastName: string,
}

export interface ISchedule {
	candidate: ICandidate
	meetings: IMeeting[]
}

export interface ITimeslot {
	start: Moment | string;
	end: Moment | string;
	note?: string;
}

export interface IMeeting extends ITimeslot {
	interviewers: IInterviewer[],
	room: IRoom
}

export type IAvailability = Array<ITimeslot>

export interface IGetSchedulesOptions {
	preferences: Array<{interviewer: IInterviewer, preference?: IInterviewer, minutes: number}>;
	candidate: ICandidate;
}

export enum Role {
	UNKNOWN,
	CANDIDATE,
	HIRING_MANAGER,
	HUMAN_RESOURCE,
}
