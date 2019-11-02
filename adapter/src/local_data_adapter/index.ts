import IAPIAdapter from "../IAPIAdapter";
import IAPIResponse from "../IAPIResponse";
import {ICandidate, IGetSchedulesOptions, IInterviewer, ISchedule} from "../interfaces";
import {Moment} from "moment";
import cloneDeep from "lodash/cloneDeep";
import fakeCandidates from "../placeholder_adapter/fakeCandidates";
import fakeInterviewers, {fakeSchedules} from "../placeholder_adapter/fakeInterviewers";
import fakeUsers from "./fakeUsers";
import random from "lodash/random";

/**
 * I wrote this adapter for the demo to see data that actually moves
 */

const candidates: Map<string, ICandidate> = new Map(fakeCandidates.map(c => [c.id, c]));
const interviewers: Map<string, IInterviewer> = new Map(fakeInterviewers.map(i => [i.id,i]));

export {candidates, interviewers}

const adapter: IAPIAdapter = {
	fullURLs: {},
	urls: {},
	async isAuthenticated(): Promise<IAPIResponse<boolean>> {
		await wait();
		if (!isAuthenticated()) {
			return {success: false, error: tokenErrorMessage}
		}
		return {success: true, data: isAuthenticated()};
	},
	async confirmSchedule(schedule: ISchedule): Promise<IAPIResponse> {
		await wait();
		if (!isAuthenticated()) {
			return {success: false, error: tokenErrorMessage}
		}
		return {success: true};
	},
	async createCandidate(candidate: ICandidate): Promise<IAPIResponse<ICandidate>> {
		await wait();
		if (!isAuthenticated()) {
			return {success: false, error: tokenErrorMessage}
		}
		const _candidate = cloneDeep(candidate);
		_candidate.id = Math.random().toString();
		candidates.set(_candidate.id, _candidate);
		return {
			success: true,
			data: _candidate,
		};
	},
	async deleteCandidate(candidate: ICandidate): Promise<IAPIResponse> {
		await wait();
		if (!isAuthenticated()) {
			return {success: false, error: tokenErrorMessage}
		}
		candidates.delete(candidate.id);
		return {success: true};
	},
	async getCandidateByID(candidateID: string): Promise<IAPIResponse<ICandidate>> {
		await wait();
		return {success: candidates.has(candidateID), data: candidates.get(candidateID)};
	},
	async getCandidates(): Promise<IAPIResponse<ICandidate[]>> {
		await wait();
		if (!isAuthenticated()) {
			return {success: false, error: tokenErrorMessage}
		}
		return {success: true, data: Array.from(candidates.values())};
	},
	async getInterviewers(): Promise<IAPIResponse<IInterviewer[]>> {
		await wait();
		if (!isAuthenticated()) {
			return {success: false, error: tokenErrorMessage}
		}
		return {success: true, data: Array.from(interviewers.values())};
	},
	async getSchedules(options: IGetSchedulesOptions): Promise<IAPIResponse<ISchedule[]>> {
		await wait();
		if (!isAuthenticated()) {
			return {success: false, error: tokenErrorMessage}
		}
		return {success: true, data: fakeSchedules};
	},
	async health(): Promise<IAPIResponse<boolean>> {
		await wait();
		return {success: true, data: true};
	},
	async isValidCandidateID(candidateID: string): Promise<IAPIResponse<boolean>> {
		await wait();
		return {success: true, data: candidates.has(candidateID)};
	},
	async logout(): Promise<IAPIResponse> {
		await wait();
		authenticated = false;
		return {success: true};
	},
	async sendAvailabilityEmail(candidate: ICandidate): Promise<IAPIResponse> {
		await wait();
		if (!isAuthenticated()) {
			return {success: false, error: tokenErrorMessage}
		}
		if (!candidates.has(candidate.id)) {
			return {success: false, error: "Candidate not registered."};
		}
		return {success: true};
	},
	async submitAvailability(candidateID: string, availability: Array<{ start: Moment; end: Moment }>): Promise<IAPIResponse> {
		await wait();
		if (!candidates.has(candidateID)) {
			return {success: false};
		}
		candidates.set(candidateID, cloneDeep({
			...candidates.get(candidateID),
			availability,
		}));
		return {success: true};
	},
	async updateCandidate(candidate: ICandidate): Promise<IAPIResponse> {
		await wait();
		if (!isAuthenticated()) {
			return {success: false, error: tokenErrorMessage}
		}
		if (!candidates.has(candidate.id)) {
			return {success: false};
		}
		candidates.set(candidate.id, cloneDeep(candidate));
		return {success: true};
	},
	async loginRedirect(): Promise<void> {
		authenticated = true;
	}
};

const tokenErrorMessage = "This user is no longer authenticated, please login again";

// i do this to make development quicker, but show loading in the demo
function wait(): Promise<void> {
	if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
		return new Promise(r => r());
	} else {
		return new Promise(r => setTimeout(r, random(100, 1000)));
	}
}

let authenticated: boolean = false;

function isAuthenticated(): boolean {
	return authenticated;
}

export default adapter;