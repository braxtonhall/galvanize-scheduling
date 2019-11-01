import IAPIResponse from "../IAPIResponse";
import {fullURLs} from "./urls";
import axios from "axios";

export default {
    login: async() : Promise<IAPIResponse> => {
        try {
            const {status} = await axios.get(fullURLs.LOGIN);
            return {success: status === 200};
        } catch {
            return {success: false}
        }
    },
    logout: async() : Promise<IAPIResponse> => {
        try {
            return {success: false}
        } catch {
            return {success: false}
        }
    }
}