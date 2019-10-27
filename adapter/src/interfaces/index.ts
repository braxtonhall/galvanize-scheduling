import {Moment} from "moment";

export interface IResource {

}

export interface IHiringManager {
	id?: string,
}

export interface IHumanResource {
	id?: string,
}

export interface IRoom extends IResource {
	id?: string,
	name: string,
}

export interface ICandidate extends IResource {
	id?: string,
	email: string,
	phoneNumber: string,
	firstName: string,
	lastName: string,
	position: string,
	notes: string,
	availability?: IAvailability,
}

export interface IInterviewer extends IResource {
	id?: string,
	firstName: string,
	lastName: string,
}

export interface ISchedule {
	candidate: ICandidate
	meetings: IMeeting[]
}

export interface IMeeting {
	interviewers: IInterviewer[],
	startTime: Moment,
	endTime: Moment,
	room: IRoom
}

export type IAvailability = Array<{start: Moment, end: Moment}>

export interface IGetSchedulesOptions {

}

export enum Role {
	UNKNOWN,
	CANDIDATE,
	HIRING_MANAGER,
	HUMAN_RESOURCE,
}
