import IAPIResponse from "../IAPIResponse";
import {ICandidate} from "../interfaces";
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
}