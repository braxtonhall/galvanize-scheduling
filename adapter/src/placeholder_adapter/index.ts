import IAPIAdapter from "../IAPIAdapter";
import IAPIResponse from "../IAPIResponse";
import {
	Role
} from "../interfaces";
import fakeCandidates from "./fakeCandidates";
import fakeInterviewers, {fakeSchedules} from "./fakeInterviewers";

const adapter: IAPIAdapter = {
	submitAvailability: autoFail,
	getCandidateByID: async () => ({success: true, data: fakeCandidates[0]}),
	
	createCandidate: autoFail,
	sendAvailabilityEmail: autoFail,
	getSchedules: async () => ({success: true, data: fakeSchedules}),
	confirmSchedule: autoFail,
	getInterviewers: async () => ({success: true, data: fakeInterviewers}),
	getCandidates: async () => ({success: true, data: fakeCandidates}),
	deleteCandidate: autoFail,
	updateCandidate:autoFail,
	getRooms: autoFail,
	toggleEligibility: autoFail,

	// meta
	loginRedirectURL: () => "",
	checkToken: autoFail,
	health: autoFail,
	logout: autoFail,
	urls: {},
	fullURLs: {},
};

// will fit any function on the API adapter that is async
async function autoFail(...args: any[]): Promise<IAPIResponse<any>> {
	return {success: false, error: "This is the placeholder adapter, any function will fail."}
}

async function autoPass(...args: any[]): Promise<IAPIResponse<any>> {
	return {success: true}
}

export default adapter;