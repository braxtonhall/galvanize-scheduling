const urls: {[key: string]: string} = new function() {
	// "/"
	this.HEALTH = "/health";
	
	this.INTERVIEWER =  "/resource/interviewer";
	this.INTERVIEWERS = "/resource/interviewers";

	this.CANDIDATE =  "/resource/candidate";
	this.CANDIDATES = "/resource/candidates";

	this.ROOM =  "/resource/room";
	this.ROOMS = "/resource/rooms";

} as {[key: string]: string};

let fullURLs: {[key: string]: string} = {};
let base: string = process.env.REACT_APP_SERVER_ADDRESS;

function generateFullURLS() {
	fullURLs = {};
	for (const key in urls) {
		if (urls.hasOwnProperty(key)) {
			fullURLs[key] = `${base}${urls[key]}`;
		}
	}
}

generateFullURLS();

export {urls, fullURLs}