import IAPIResponse from "./IAPIResponse"

export default interface IAPIAdapter {
	// interviewer

	// interviewee

	// admin


	// meta
	health: () => Promise<IAPIResponse>;
	urls: {[key: string]: string};
	fullUrls: {[key: string]: string};
}