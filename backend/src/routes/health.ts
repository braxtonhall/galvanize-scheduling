import {app} from "../index";
import {nodeAdapter} from "adapter";

app.get(nodeAdapter.urls.HEALTH, (req, res) => {
	res.sendStatus(200);
});