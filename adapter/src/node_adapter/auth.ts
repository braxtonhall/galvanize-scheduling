import IAPIResponse from "../IAPIResponse";
import {fullURLs} from "./urls";

export default {
    logout: async() : Promise<IAPIResponse> => {
        try {
            return {success: false}
        } catch {
            return {success: false}
        }
    },
    authenticate: async() : Promise<IAPIResponse> => {
        try {
            const {status, data} = await axios.get(fullURLs.AUTHENTICATE);
            return {success: status === 200 && data}
        } catch {
            return {success: false};
        }
    },
    loginRedirectURL: (): string => {
        return fullURLs.LOGIN;
    }
}
