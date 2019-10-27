import {app} from "../index";
import {nodeAdapter} from "adapter";
import IResourceFacade from "../controllers/IResourceFacade";
import ResourceFacade from "../controllers/impl/ResourceFacade";
import {ResourceKind} from "../controllers/ResourceControllerTypes";
import { IInterviewer } from "adapter/dist/interfaces";

const resourceFacade: IResourceFacade = new ResourceFacade();

app.get(nodeAdapter.urls.INTERVIEWERS, async (req, res) => {
	const token: string = req.header["token"];
	try {
		const interviewers = await resourceFacade.get(token, ResourceKind.Interviewer);
		res.status(200).send(interviewers);
	} catch (e) {
		res.status(400).send(e);
	}
});

app.post(nodeAdapter.urls.INTERVIEWER, async (req, res) => {
	const token: string = req.header["token"];
	const interviewer: IInterviewer = req.body;
	try {
		const result = await resourceFacade.create(token, interviewer, ResourceKind.Interviewer);
		res.status(200).send(result);
	} catch (e) {
		res.status(400).send(e);
	}
});

app.delete(nodeAdapter.urls.INTERVIEWER, (req, res) => {
	// TODO
	res.sendStatus(401);
});