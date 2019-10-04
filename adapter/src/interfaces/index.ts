import {Moment} from "moment";

export interface IHiringManager {
	id?: string,
}

export interface IHumanResource {
	id?: string,
}

export interface IRoom {
	id?: string,
	name: string,
}

export interface ICandidate {
	id?: string,
	email: string,
	phoneNumber: string,
	firstName: string,
	lastName: string,
	position: string,
	notes: string,
}

export interface IInterviewer {
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

export interface IAvailability {

}

export interface IGetSchedulesOptions {

}

export enum Role {
	UNKNOWN,
	CANDIDATE,
	HIRING_MANAGER,
	HUMAN_RESOURCE,
}
