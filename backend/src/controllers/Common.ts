import { interfaces } from "adapter";

export enum ResourceKind {
	Candidate,
	Interviewer,
	Room,
	Schedule,
}

export interface IScheduleAvailabilities {
	rooms: {room: interfaces.IRoom, availability: interfaces.IAvailability}[]
	interviewers: {interviewer: interfaces.IInterviewer, availability: interfaces.IAvailability}[]
}

export const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;