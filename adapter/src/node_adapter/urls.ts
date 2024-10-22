const urls: {[key: string]: string} = new function() {
	// "/"
	this.HEALTH = "/health";

	this.INTERVIEWER =  "/resource/interviewer";
	this.INTERVIEWERS = "/resource/interviewers";

	this.CANDIDATE =  "/resource/candidate";
	this.CANDIDATES = "/resource/candidates";

	this.ROOM =  "/resource/room";
	this.ROOMS = "/resource/rooms";
	
	this.SCHEDULE = '/resource/schedule';
	this.SCHEDULES = '/resource/schedules';

	this.LOGIN = '/login';
	this.LOGOUT = '/logout';
	this.AUTHENTICATE = '/authenticate';
	
	this.EXISTS_CANDIDATE = '/exists/candidate';
	this.UPDATE_AVAILABILITY = '/submitavailability';
	this.SEND_AVAILABILITY = '/sendavailability';

} as {[key: string]: string};

let fullURLs: {[key: string]: string} = {};
let base: string = process.env.REACT_APP_SERVER_ADDRESS || "http://localhost:8080";

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