import IAPIResponse from "./IAPIResponse"
import {
	IAvailability,
	ICandidate,
	IGetSchedulesOptions,
	IHiringManager,
	IHumanResource,
	IInterviewer, Role,
	IRoom,
	ISchedule
} from "./interfaces";

export default interface IAPIAdapter {
	// candidate
	submitAvailability(token: string, availability: IAvailability): Promise<IAPIResponse>

	// hiring manager
	loginHiringManager(username: string, password: string): Promise<IAPIResponse<string>>;
	createCandidate(token: string, candidate: ICandidate): Promise<IAPIResponse<ICandidate>>;
	sendAvailabilityEmail(token: string, candidate: ICandidate): Promise<IAPIResponse<ICandidate>>;
	getSchedules(token: string, options: IGetSchedulesOptions): Promise<IAPIResponse<ISchedule[]>>;
	confirmSchedule(token: string, schedule: ISchedule): Promise<IAPIResponse>;
	deleteCandidate(token: string, candidate: ICandidate): Promise<IAPIResponse>;
	updateCandidate(token: string, candidate: ICandidate): Promise<IAPIResponse>;

	// hr
	loginHumanResource(username: string, password: string): Promise<IAPIResponse<string>>;
	addRoom(token: string, room: IRoom): Promise<IAPIResponse>;
	removeRoom(token: string, id: string): Promise<IAPIResponse>;
	addHiringManager(token: string, hiringManager: IHiringManager): Promise<IAPIResponse>;
	removeHiringManager(token: string, id: string): Promise<IAPIResponse>;
	addHumanResource(token: string, hr: IHumanResource): Promise<IAPIResponse>;
	removeHumanResource(token: string, id: string): Promise<IAPIResponse>;

	// shared
	getRooms(token: string): Promise<IAPIResponse<IRoom[]>>
	getCandidates(token: string): Promise<IAPIResponse<ICandidate[]>>;
	getInterviewers(token: string): Promise<IAPIResponse<IInterviewer[]>>;
	createInterviewer(token: string, interviewer: IInterviewer): Promise<IAPIResponse<IInterviewer>>
	deleteInterviewer(token: string, interviewer: IInterviewer): Promise<IAPIResponse>

	// meta
	determineTokenType(token: string): Promise<IAPIResponse<Role>>
	authenticateToken(token: string): Promise<IAPIResponse<boolean>>;
	health(): Promise<IAPIResponse>;
	logout(token: string): Promise<IAPIResponse>;
	urls: {[key: string]: string};
	fullURLs: {[key: string]: string};
}