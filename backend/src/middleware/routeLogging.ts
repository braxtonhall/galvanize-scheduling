import {app} from "../index";

app.use((req, res, next) => {
	const startHrTime = process.hrtime();

	res.on("finish", () => {
		const elapsedHrTime = process.hrtime(startHrTime);
		const elapsedTimeInMs = elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6;
		console.log("%s %s %s : %fms", res.statusCode, req.path, req.method, elapsedTimeInMs.toFixed(0));
	});

	next();
});