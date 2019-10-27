import { IInterviewer, IRoom, ICandidate } from "adapter/dist/interfaces";

export enum ResourceKind {
	Candidate,
	Interviewer,
	Room,
}

export interface ICandidateController {
	getCandidates(token: string): Promise<ICandidate[]>;
	createCandidate(token: string, resource: ICandidate): Promise<boolean>;
}

export interface IInterviewerController {
	getInterviewers(token: string): Promise<IInterviewer[]>;
	createInterviewer(token: string, resource: IInterviewer): Promise<boolean>;
}

export interface IRoomController {
	getRooms(token: string): Promise<IRoom[]>;
	createRoom(token: string, resource: IRoom): Promise<boolean>;
}
