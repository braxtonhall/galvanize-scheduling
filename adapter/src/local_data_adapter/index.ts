import IAPIAdapter from "../IAPIAdapter";
import IAPIResponse from "../IAPIResponse";
import {ICandidate, IGetSchedulesOptions, IInterviewer, ISchedule} from "../interfaces";
import {Moment} from "moment";
import cloneDeep from "lodash/cloneDeep";
import fakeCandidates from "../placeholder_adapter/fakeCandidates";
import fakeInterviewers from "../placeholder_adapter/fakeInterviewers";
import fakeUsers from "./fakeUsers";

/**
 * I wrote this adapter for the demo to see data that actually moves
 */

const tokens: Map<string, boolean> = new Map();
const candidates: Map<string, ICandidate> = new Map(fakeCandidates.map(c => [c.id, c]));
const interviewers: Map<string, IInterviewer> = new Map(fakeInterviewers.map(i => [i.id,i]));
const users: Map<string, string> = new Map(fakeUsers);

export {tokens, candidates, interviewers}

const adapter: IAPIAdapter = {
	fullURLs: {},
	urls: {},
	async authenticateToken(token: string): Promise<IAPIResponse<boolean>> {
		return {success: true, data: tokens.has(token)};
	},
	async confirmSchedule(token: string, schedule: ISchedule): Promise<IAPIResponse> {
		return {success: true};
	},
	async createCandidate(token: string, candidate: ICandidate): Promise<IAPIResponse<ICandidate>> {
		const _candidate = cloneDeep(candidate);
		_candidate.id = Math.random().toString();
		candidates.set(_candidate.id, _candidate);
		return {
			success: true,
			data: _candidate,
		};
	},
	async deleteCandidate(token: string, candidate: ICandidate): Promise<IAPIResponse> {
		candidates.delete(candidate.id);
		return {success: true};
	},
	async getCandidateByID(candidateID: string): Promise<IAPIResponse<ICandidate>> {
		return {success: candidates.has(candidateID), data: candidates.get(candidateID)};
	},
	async getCandidates(token: string): Promise<IAPIResponse<ICandidate[]>> {
		console.log(candidates);
		return {success: true, data: Array.from(candidates.values())};
	},
	async getInterviewers(token: string): Promise<IAPIResponse<IInterviewer[]>> {
		return {success: true, data: Array.from(interviewers.values())};
	},
	async getSchedules(token: string, options: IGetSchedulesOptions): Promise<IAPIResponse<ISchedule[]>> {
		return {success: false};
	},
	async health(): Promise<IAPIResponse<boolean>> {
		return {success: true, data: true};
	},
	async isValidCandidateID(candidateID: string): Promise<IAPIResponse<boolean>> {
		return {success: true, data: candidates.has(candidateID)};
	},
	async login(username: string, password: string): Promise<IAPIResponse<string>> {
		if (users.get(username) === password) {
			const token = Math.random().toString();
			return {success: true, data: token};
		} else {
			return {success: false, error: "This version of the software is using mock data, and example user is test@galvanize.com with password test123"}
		}
	},
	async logout(token: string): Promise<IAPIResponse> {
		tokens.delete(token);
		return {success: true};
	},
	async sendAvailabilityEmail(token: string, candidate: ICandidate): Promise<IAPIResponse> {
		return {success: true};
	},
	async submitAvailability(candidateID: string, availability: Array<{ start: Moment; end: Moment }>): Promise<IAPIResponse> {
		if (!candidates.has(candidateID)) {
			return {success: false};
		}
		candidates.set(candidateID, cloneDeep({
			...candidates.get(candidateID),
			availability,
		}));
		return {success: true};
	},
	async updateCandidate(token: string, candidate: ICandidate): Promise<IAPIResponse> {
		if (!candidates.has(candidate.id)) {
			return {success: false};
		}
		candidates.set(candidate.id, cloneDeep(candidate));
		return {success: true};
	}
};

export default adapter;