import {app} from "../index";
import {interfaces, nodeAdapter} from "adapter";
import {IResourceFacade, ResourceFacade} from "../controllers/ResourceFacade";
import {ResourceKind} from "../controllers/Common";
import {IResource} from "adapter/dist/interfaces";
import AuthController from "../controllers/AuthController";
import {sendAvailabilityEmail, sendScheduleEmail, sendCancellationEmail} from "../controllers/EmailController";
import MSGraphController from "../controllers/MSGraphController";

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
		res.status(400).send(e.message);
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
		res.status(400).send(e.message);
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
		res.status(400).send(e.message);
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


// SCHEDULES
app.get(nodeAdapter.urls.SCHEDULES, async (req, res) => {
	const token: string = req.header("token");
	try {
		if (await AuthController.getInstance().checkAuth(token)) {
			let options = {
				preferences: req.query.preferences.map(p => JSON.parse(p)),
				candidate: JSON.parse(req.query.candidate)
			};
			const interviewers = [];
			for (const p of options.preferences) {
				if (interviewers.includes(p.interviewer.email))
					throw new Error("Interviewers should only have a maximum of one preference designation.");

				const partner = options.preferences
					.find(p2 => p2.preference && (p2.preference.id === p.interviewer.id));
				if (partner) {
					const maxLength = Math.max(p.minutes, partner.minutes);
					partner.minutes = maxLength;
					p.minutes = maxLength;
				}
				interviewers.push(p.interviewer.email);
			}
			const data: any[] = await resourceFacade.list(token, ResourceKind.Schedule, options);
			res.status(200).send(data);
		} else {
			res.sendStatus(401);
		}
	} catch(e) {
		res.status(400).send(e.message);
	}
});

app.post(nodeAdapter.urls.SCHEDULE, async (req, res) => {
	const token: string = req.header("token");
	let schedule: interfaces.ISchedule = req.body.data;
	try {
		if (await AuthController.getInstance().checkAuth(token)) {
			schedule = await MSGraphController.bookSchedule(token, schedule);
			await resourceFacade.create(token, schedule, ResourceKind.Schedule);
			await sendScheduleEmail(token, schedule);
			res.sendStatus(200);
		} else {
			res.sendStatus(401);
		}
	} catch (e) {
		res.status(400).send(e);
	}
});

app.delete(nodeAdapter.urls.SCHEDULE, async (req, res) => {
	const token: string = req.header("token");
	const id: string = req.body.id;
	try {
		if (await AuthController.getInstance().checkAuth(token)) {
			const candidate: interfaces.ICandidate = await resourceFacade.get(token, id, ResourceKind.Candidate) as interfaces.ICandidate;
			await MSGraphController.deleteSchedule(token, candidate.schedule.filter(t => !!t.id).map(t => t.id));
			const result = await resourceFacade.delete(token, id, ResourceKind.Schedule);
			await sendCancellationEmail(token, candidate);
			res.status(200).send(result);
		} else {
			res.sendStatus(401);
		}
	} catch (e) {
		res.status(400).send(e);
	}
});

app.post(nodeAdapter.urls.SEND_AVAILABILITY, async (req, res) => {
	const token: string = req.header("token");
	const candidate: interfaces.ICandidate = req.body.data;
	try {
		if (token && await AuthController.getInstance().checkAuth(token)) {
			const exists = await resourceFacade.exists(candidate.id, ResourceKind.Candidate);
			if (!exists)
				throw new Error("Cannot send email, this candidate does not exist.");
			await sendAvailabilityEmail(token, candidate);
			res.sendStatus(200);
		} else {
			res.sendStatus(401);
		}
	} catch (e) {
		res.status(400).send(e);
	}
});