import {Config, ConfigKey} from "../Config";
import {app} from "../index";
import AuthController from "../controllers/AuthController";

const config = Config.getInstance();

if (!config.get(ConfigKey.production)) {
	app.post("/saveauth", async (req, res) => {
		const secret: string = req.header("token");
		const token = req.body.token;
		try {
			if (secret === config.get(ConfigKey.testSecretKey)) {
				console.warn("WARNING: A new authorization is being saved. TEST ONLY code.");
				await AuthController.getInstance().saveAuth(token);
				res.sendStatus(200)
			} else {
				res.status(401);
			}
		} catch (e) {
			res.status(400).send(e);
		}
	});
}