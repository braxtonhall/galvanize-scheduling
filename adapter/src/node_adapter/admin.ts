import IAPIResponse from "../IAPIResponse";
import {fullURLs} from "./urls";
import axios from "axios";
import {ICandidate} from "../interfaces";

export default {
    getCandidates: async() : Promise<IAPIResponse<ICandidate[]>> => {
        try {
            const {status, data} = await axios.get(fullURLs.CANDIDATES);
            return {success: status === 200, data};
        } catch {
            return {success: false}
        }
    },
    createCandidate: async() : Promise<IAPIResponse<ICandidate>> => {
        try {
            return {success: false, data: null};
        } catch {
            return {success: false}
        }
    },
    deleteCandidate: async() : Promise<IAPIResponse> => {
        try {
            return {success: false}
        } catch (e) {
            return {success: false}
        }
    },
    updateCandidate: async() : Promise<IAPIResponse> => {
        try {
            return {success: false}
        } catch(e) {
            return {success: false}
        }
    },

}