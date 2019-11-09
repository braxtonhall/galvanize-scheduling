import {app} from "../index";
import {nodeAdapter} from "adapter";
import IResourceFacade from "../controllers/IResourceFacade";
import ResourceFacade from "../controllers/impl/ResourceFacade";
import {ResourceKind} from "../controllers/Common";
import { IResource } from "adapter/dist/interfaces";
import AuthController, {IAuthController} from "../controllers/AuthController";

const resourceFacade: IResourceFacade = new ResourceFacade();

[
	{
		multiple: "INTERVIEWERS",
		single: "INTERVIEWER",
		kind: ResourceKind.Interviewer
	},
	{
		multiple: "CANDIDATES",
		single: "CANDIDATE",
		kind: ResourceKind.Candidate
	},
	{
		multiple: "ROOMS",
		single: "ROOM",
		kind: ResourceKind.Room
	},
].forEach((resourceType) => {
	app.get(nodeAdapter.urls[resourceType.multiple], async (req, res) => {
		const token: string = req.header("token");
		try {
			if (await AuthController.getInstance().checkAuth(token)) {
				const data: IResource[] = await resourceFacade.list(token, resourceType.kind);
				res.status(200).send(data);
			} else {
				res.status(401);
			}
		} catch(e) {
			res.status(e.statusCode).send(e.message);
		}
	});

	app.post(nodeAdapter.urls[resourceType.single], async (req, res) => {
		const token: string = req.header("token");
		const data = req.body.data;
		try {
			if (await AuthController.getInstance().checkAuth(token)) {
				const result = await resourceFacade.create(token, data, resourceType.kind);
				res.status(200).send(result);
			} else {
				res.status(401);
			}
		} catch (e) {
			res.status(400).send(e);
		}
	});

	app.delete(nodeAdapter.urls[resourceType.single], async (req, res) => {
		const token: string = req.header("token");
		const id: string = req.body.id;
		try {
			if (await AuthController.getInstance().checkAuth(token)) {
				const result = await resourceFacade.delete(token, id, resourceType.kind);
				res.status(200).send(result);
			} else {
				res.status(401);
			}
		} catch (e) {
			res.status(400).send(e);
		}
	});
});