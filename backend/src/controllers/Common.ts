import { interfaces } from "adapter";

export enum ResourceKind {
	Candidate,
	Interviewer,
	Room,
	Schedule,
}

export type Preference = {interviewer: interfaces.IInterviewer, preference?: interfaces.IInterviewer, minutes: number};

export interface IScheduleAvailabilities {
	rooms: {room: interfaces.IRoom, availability: interfaces.IAvailability}[]
	interviewers: {interviewer: Preference, availability: interfaces.IAvailability}[]
}

export const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;