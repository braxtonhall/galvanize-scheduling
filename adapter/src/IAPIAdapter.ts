import IAPIResponse from "./IAPIResponse"

export default interface IAPIAdapter {
	// interviewer

	// interviewee

	// admin

	// meta
	health: () => Promise<IAPIResponse>;
	urls: {[key: string]: string};
	fullURLs: {[key: string]: string};
}