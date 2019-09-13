const urls: {[key: string]: string} = new function() {
	// "/"
	this.HEALTH = "/health";
} as {[key: string]: string};

let fullURLS: {[key: string]: string} = {};
const developURL = "http://localhost:8080";
const masterURL = "http://localhost:8080";
const localURL = "http://localhost:8080";
// const localURL = "https://backend-develop-hjzdwiprdq-uc.a.run.app";
let base: string = localURL;

function generateFullURLS() {
	fullURLS = {};
	for (const key in urls) {
		if (urls.hasOwnProperty(key)) {
			fullURLS[key] = `${base}${urls[key]}`;
		}
	}
}

generateFullURLS();

export {urls, fullURLS}