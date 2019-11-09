import IAPIResponse from "../IAPIResponse";
import {IAvailability, ICandidate} from "../interfaces";
import axios from "axios";
import {fullURLs} from "./urls";

export default {
	getCandidateByID: async(candidateID: string): Promise<IAPIResponse<ICandidate>> => {
		try {
			const {status, data} = await axios.get(fullURLs.CANDIDATE, {headers: {"Content-Type": "application/json"}, params: {id: candidateID}});
			return {success: status === 200, data};
		} catch {
			return {success: false};
		}
	},
	submitAvailability: async(candidateID: string, availability: IAvailability): Promise<IAPIResponse> => {
		if (!!availability) {
			return {success: false, error: "Availability was not defined"};
		}
		try {
			const {status, data} = await axios.post(fullURLs.UPDATE_AVAILABILITY, {data: {id: candidateID, availability}}, {headers: {"Content-Type": "application/json"}});
			return {success: status === 200, data};
		} catch {
			return {success: false}
		}
	},
}