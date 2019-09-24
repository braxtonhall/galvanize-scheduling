import IAPIAdapter from "../IAPIAdapter";
import IAPIResponse from "../IAPIResponse";

const adapter: IAPIAdapter = {
	health: autoFail,
	urls: {},
	fullURLs: {},
};

// will fit any function on the API adapter that is async
async function autoFail(...args: any[]): Promise<IAPIResponse<any>> {
	return {success: false, error: "This is the placeholder adapter, any function will fail."}
}

export default adapter;