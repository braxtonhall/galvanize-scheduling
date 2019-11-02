import IAPIResponse from "./IAPIResponse"
import {
	IAvailability,
	ICandidate,
	IGetSchedulesOptions,
	IInterviewer,
	ISchedule
} from "./interfaces";

export default interface IAPIAdapter {
	// candidate
	submitAvailability(candidateID: string, availability: IAvailability): Promise<IAPIResponse>
	isValidCandidateID(candidateID: string): Promise<IAPIResponse<boolean>>;
	getCandidateByID(candidateID: string): Promise<IAPIResponse<ICandidate>>;

	// staff
	loginRedirect(): Promise<void>;
	createCandidate(candidate: ICandidate): Promise<IAPIResponse<ICandidate>>;
	sendAvailabilityEmail(candidate: ICandidate): Promise<IAPIResponse>;
	getSchedules(options: IGetSchedulesOptions): Promise<IAPIResponse<ISchedule[]>>;
	confirmSchedule(schedule: ISchedule): Promise<IAPIResponse>;
	getCandidates(): Promise<IAPIResponse<ICandidate[]>>;
	deleteCandidate(candidate: ICandidate): Promise<IAPIResponse>;
	updateCandidate(candidate: ICandidate): Promise<IAPIResponse>;
	getInterviewers(): Promise<IAPIResponse<IInterviewer[]>>;

	// meta
	isAuthenticated(): Promise<IAPIResponse<boolean>>;
	health(): Promise<IAPIResponse<boolean>>;
	logout(): Promise<IAPIResponse>;
	urls: {[key: string]: string};
	fullURLs: {[key: string]: string};
}