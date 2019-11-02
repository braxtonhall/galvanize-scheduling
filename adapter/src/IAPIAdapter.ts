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
	getTokenFromURL(url: string): string;
	createCandidate(token: string, candidate: ICandidate): Promise<IAPIResponse<ICandidate>>;
	sendAvailabilityEmail(token: string, candidate: ICandidate): Promise<IAPIResponse>;
	getSchedules(token: string, options: IGetSchedulesOptions): Promise<IAPIResponse<ISchedule[]>>;
	confirmSchedule(token: string, schedule: ISchedule): Promise<IAPIResponse>;
	getCandidates(token: string): Promise<IAPIResponse<ICandidate[]>>;
	deleteCandidate(token: string, candidate: ICandidate): Promise<IAPIResponse>;
	updateCandidate(token: string, candidate: ICandidate): Promise<IAPIResponse>;
	getInterviewers(token: string): Promise<IAPIResponse<IInterviewer[]>>;

	// meta
	loginRedirectURL(): string
	checkToken(token: string): Promise<IAPIResponse<boolean>>;
	saveToken(token: string): Promise<IAPIResponse<boolean>>;
	health(): Promise<IAPIResponse<boolean>>;
	logout(token: string): Promise<IAPIResponse>;
	urls: {[key: string]: string};
	fullURLs: {[key: string]: string};
}