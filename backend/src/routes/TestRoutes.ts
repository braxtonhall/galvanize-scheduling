import {Config, ConfigKey} from "../Config";
import {app} from "../index";
import AuthController from "../controllers/AuthController";
import Log from "../Log";

const config = Config.getInstance();

if (!config.get(ConfigKey.production)) {
	app.post("/saveauth", async (req, res) => {
		const secret: string = req.header("token");
		const token = req.body.token;
		try {
			if (secret === config.get(ConfigKey.testSecretKey)) {
				Log.warn("WARNING: A new authorization is being saved. TEST ONLY code.");
				await AuthController.getInstance().saveAuth(token);
				res.sendStatus(200)
			} else {
				res.sendStatus(401);
			}
		} catch (e) {
			res.status(400).send(e);
		}
	});
	
	app.post("/setconfig", (req, res) => {
		try {
			const secret: string = req.header("token");
			const key: ConfigKey = req.body.key;
			const val: any = req.body.value;
			if (secret === config.get(ConfigKey.testSecretKey)) {
				Config.getInstance().set(key, val);
				res.sendStatus(200)
			} else {
				res.sendStatus(401);
			}
		} catch (err) {
			res.status(400).send(err);
		}
	});
}