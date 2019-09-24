import IAPIResponse from "../IAPIResponse";
import {fullURLs} from "./urls";
import axios from "axios";

async function health(): Promise<IAPIResponse> {
	try {
		const {status} = await axios.get(fullURLs.HEALTH);
		return {success: status === 200};
	} catch {
		return {success: false}
	}
}

export default health;