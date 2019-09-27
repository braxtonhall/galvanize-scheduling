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

const adapter: IAPIAdapter = {
	submitAvailability: autoFail,

	loginHiringManager: autoFail,
	createCandidate: autoFail,
	sendAvailabilityEmail: autoFail,
	getSchedules: autoFail,
	confirmSchedule: autoFail,
	getInterviewers: autoFail,

	// hr
	loginHumanResource: autoFail,
	addRoom: autoFail,
	removeRoom: autoFail,
	addHiringManager: autoFail,
	removeHiringManager: autoFail,
	addHumanResource: autoFail,
	removeHumanResource: autoFail,

	// shared
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