const urls: {[key: string]: string} = new function() {
	// "/"
	this.HEALTH = "/health";

} as {[key: string]: string};

let fullURLs: {[key: string]: string} = {};
let base: string = process.env.REACT_APP_SERVER_ADDRESS;
console.log(`<T> ${Date.now().toLocaleString()}:`, base);

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