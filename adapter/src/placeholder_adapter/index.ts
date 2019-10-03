import IAPIAdapter from "../IAPIAdapter";
import IAPIResponse from "../IAPIResponse";
import {
	ICandidate,
	IGetSchedulesOptions,
	IHiringManager,
	IHumanResource,
	IInterviewer,
	IRoom,
	ISchedule
} from "../interfaces";
import fakeCandidates from "./fakeCandidates";

const adapter: IAPIAdapter = {
	submitAvailability: autoFail,

	loginHiringManager: async () => ({success: true, data: "test_token"}),
	createCandidate: autoFail,
	sendAvailabilityEmail: autoFail,
	getSchedules: autoFail,
	confirmSchedule: autoFail,
	getInterviewers: autoFail,
	getCandidates: async () => ({success: true, data: fakeCandidates}),

	// hr
	loginHumanResource: async () => ({success: true, data: "test_token"}),
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
	determineTokenType: autoFail,
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

export default adapter;