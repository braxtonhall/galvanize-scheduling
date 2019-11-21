import {app} from "../index";
import {nodeAdapter} from "adapter";
import IResourceFacade from "../controllers/IResourceFacade";
import ResourceFacade from "../controllers/impl/ResourceFacade";
import {ResourceKind} from "../controllers/Common";
import {IResource} from "adapter/dist/interfaces";
import AuthController from "../controllers/AuthController";

const resourceFacade: IResourceFacade = new ResourceFacade();

// CANDIDATES
app.get(nodeAdapter.urls.CANDIDATES, async (req, res) => {
	const token: string = req.header("token");
	try {
		if (await AuthController.getInstance().checkAuth(token)) {
			const data: IResource[] = await resourceFacade.list(token, ResourceKind.Candidate);
			res.status(200).send(data);
		} else {
			res.sendStatus(401);
		}
	} catch(e) {
		res.status(e.statusCode).send(e.message);
	}
});

app.post(nodeAdapter.urls.CANDIDATE, async (req, res) => {
	const token: string = req.header("token");
	const data = req.body.data;
	try {
		if (await AuthController.getInstance().checkAuth(token)) {
			const result = await resourceFacade.create(token, data, ResourceKind.Candidate);
			res.status(200).send(result);
		} else {
			res.sendStatus(401);
		}
	} catch (e) {
		res.status(400).send(e);
	}
});

app.delete(nodeAdapter.urls.CANDIDATE, async (req, res) => {
	const token: string = req.header("token");
	const id: string = req.body.id;
	try {
		if (await AuthController.getInstance().checkAuth(token)) {
			const result = await resourceFacade.delete(token, id, ResourceKind.Candidate);
			res.status(200).send(result);
		} else {
			res.sendStatus(401);
		}
	} catch (e) {
		res.status(400).send(e);
	}
});

// ROOMS
app.get(nodeAdapter.urls.ROOMS, async (req, res) => {
	const token: string = req.header("token");
	try {
		if (await AuthController.getInstance().checkAuth(token)) {
			const data: IResource[] = await resourceFacade.list(token, ResourceKind.Room);
			res.status(200).send(data);
		} else {
			res.sendStatus(401);
		}
	} catch(e) {
		res.status(e.statusCode).send(e.message);
	}
});

app.post(nodeAdapter.urls.ROOM, async (req, res) => {
	const token: string = req.header("token");
	const data = req.body.data;
	try {
		if (await AuthController.getInstance().checkAuth(token)) {
			const result = await resourceFacade.create(token, data, ResourceKind.Room);
			res.status(200).send(result);
		} else {
			res.sendStatus(401);
		}
	} catch (e) {
		res.status(400).send(e);
	}
});

app.delete(nodeAdapter.urls.ROOM, async (req, res) => {
	const token: string = req.header("token");
	const id: string = req.body.id;
	try {
		if (await AuthController.getInstance().checkAuth(token)) {
			const result = await resourceFacade.delete(token, id, ResourceKind.Room);
			res.status(200).send(result);
		} else {
			res.sendStatus(401);
		}
	} catch (e) {
		res.status(400).send(e);
	}
});

// INTERVIEWERS
app.get(nodeAdapter.urls.INTERVIEWERS, async (req, res) => {
	const token: string = req.header("token");
	try {
		if (await AuthController.getInstance().checkAuth(token)) {
			const data: IResource[] = await resourceFacade.list(token, ResourceKind.Interviewer, req.query);
			res.status(200).send(data);
		} else {
			res.sendStatus(401);
		}
	} catch(e) {
		res.status(e.statusCode).send(e.message);
	}
});

app.post(nodeAdapter.urls.INTERVIEWER, async (req, res) => {
	const token: string = req.header("token");
	const data = req.body.data;
	try {
		if (await AuthController.getInstance().checkAuth(token)) {
			const result = await resourceFacade.create(token, data, ResourceKind.Interviewer);
			res.status(200).send(result);
		} else {
			res.sendStatus(401);
		}
	} catch (e) {
		res.status(400).send(e);
	}
});

app.delete(nodeAdapter.urls.INTERVIEWER, async (req, res) => {
	const token: string = req.header("token");
	const id: string = req.body.id;
	try {
		if (await AuthController.getInstance().checkAuth(token)) {
			const result = await resourceFacade.delete(token, id, ResourceKind.Interviewer);
			res.status(200).send(result);
		} else {
			res.sendStatus(401);
		}
	} catch (e) {
		res.status(400).send(e);
	}
});

app.get(nodeAdapter.urls.GET_SCHEDULES, async (req, res) => {
	const token: string = req.header("token");
	try {
		if (await AuthController.getInstance().checkAuth(token)) {
			const data: any[] = await resourceFacade.list(token, ResourceKind.Schedule, req.query);
			res.status(200).send(data);
		} else {
			res.sendStatus(401);
		}
	} catch(e) {
		res.status(e.statusCode).send(e.message);
	}
});