import IAPIResponse from "../IAPIResponse";
import {IAvailability, ICandidate} from "../interfaces";
import axios from "axios";
import {fullURLs} from "./urls";
import moment, {Moment} from "moment";

export default {
	getCandidateByID: async(candidateID: string): Promise<IAPIResponse<ICandidate>> => {
		try {
			const {status, data} = await axios.get(fullURLs.CANDIDATE, {headers: {"Content-Type": "application/json"}, params: {id: candidateID}});
			if (data.schedule) {
				data.schedule = data.schedule.map(t => ({...t, start: moment(t.start), end: moment(t.end)}))
			}
			return {success: status === 200, data};
		} catch {
			return {success: false};
		}
	},
	submitAvailability: async(candidateID: string, availability: IAvailability): Promise<IAPIResponse> => {
		if (availability === undefined) {
			return {success: false, error: "Availability was not defined"};
		}
		try {
			availability = availability.map(a => ({
				start: (a.start as Moment).toISOString(),
				end: (a.end as Moment).toISOString()
			}));
			const {status, data} = await axios.post(fullURLs.UPDATE_AVAILABILITY, {data: {id: candidateID, availability}}, {headers: {"Content-Type": "application/json"}});
			return {success: status === 200, data};
		} catch {
			return {success: false}
		}
	},
	sendAvailabilityEmail: async (token: string, candidate: ICandidate): Promise<IAPIResponse> => {
		try {
			const {status} = await axios.post(fullURLs.SEND_AVAILABILITY, {data: candidate}, {headers: {token, "Content-Type": "application/json"}});
			return {success: status === 200};
		} catch {
			return {success: false};
		}
	}
}