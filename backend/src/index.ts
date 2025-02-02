import express from "express";
import * as core from "express-serve-static-core";
import sourceMapSupport from "source-map-support";
import {Config, ConfigKey} from "./Config";
import Log from "./Log";

sourceMapSupport.install();
let app: core.Express;
const port = Config.getInstance().get(ConfigKey.backendPort) || 8080;

(async () => {
	app = express();

	// middleware
	require("./middleware");

	// routes
	require("./routes");

	app.listen(port, () => {
		Log.info(`Server started on port ${port}.`)
	});
})();

export {app};