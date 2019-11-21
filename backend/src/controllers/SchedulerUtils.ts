import { interfaces } from "adapter";

export interface IScheduleAvailabilities {
	rooms: {room: interfaces.IRoom, availability: interfaces.IAvailability}[]
	interviewers: {interviewer: interfaces.IInterviewer, availability: interfaces.IAvailability}[]
}