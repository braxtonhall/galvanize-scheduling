import IAPIAdapter from "../IAPIAdapter";
import IAPIResponse from "../IAPIResponse";
import {
	ICandidate,
	IGetSchedulesOptions,
	IHiringManager,
	IHumanResource,
	IInterviewer,
	IRoom,
	ISchedule, Role
} from "../interfaces";
import fakeCandidates from "./fakeCandidates";
import fakeInterviewers, {fakeSchedules} from "./fakeInterviewers";

const adapter: IAPIAdapter = {
	submitAvailability: autoFail,

	loginHiringManager: async () => ({success: true, data: "test_token_hm"}),
	createCandidate: autoFail,
	sendAvailabilityEmail: autoFail,
	getSchedules: async () => ({success: true, data: fakeSchedules}),
	confirmSchedule: autoFail,
	getInterviewers: async () => ({success: true, data: fakeInterviewers}),
	getCandidates: async () => ({success: true, data: fakeCandidates}),
	deleteCandidate: autoFail,
	updateCandidate:autoFail,

	// hr
	loginHumanResource: async () => ({success: true, data: "test_token_hr"}),
	addRoom: autoFail,
	removeRoom: autoFail,
	addHiringManager: autoFail,
	removeHiringManager: autoFail,
	addHumanResource: autoFail,
	removeHumanResource: autoFail,

	// shared
	getRooms: autoFail,
	createInterviewer: autoFail,
	deleteInterviewer: autoFail,

	// meta
	determineTokenType: async () => ({success: true, data: Role.HUMAN_RESOURCE}),
	authenticateToken: autoFail,
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