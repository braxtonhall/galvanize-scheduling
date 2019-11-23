import {app} from "../index";
import {interfaces, nodeAdapter} from "adapter";
import {IResourceFacade, ResourceFacade} from "../controllers/ResourceFacade";
import {ResourceKind} from "../controllers/Common";
import AuthController from "../controllers/AuthController";

const resourceFacade: IResourceFacade = new ResourceFacade();

app.get(nodeAdapter.urls.EXISTS_CANDIDATE, async (req, res) => {
	const id = req.body.id;
	try {
		const output: boolean = await resourceFacade.exists(id, ResourceKind.Candidate);
		res.status(200).send(output);
	} catch(e) {
		res.status(e.statusCode).send(e.message);
	}
});

app.get(nodeAdapter.urls.CANDIDATE, async (req, res) => {
	const token: string = req.header("token");
	try {
		const candidate = await resourceFacade.get(token, req.query.id, ResourceKind.Candidate) as interfaces.ICandidate;
		let data: interfaces.ICandidate;
		if (token && await AuthController.getInstance().checkAuth(token)) {
			data = candidate;
		} else {
			data = {email: "", firstName: candidate.firstName, availability: candidate.availability, schedule: candidate.schedule};
		}
		res.status(200).send(data);
	} catch(e) {
		res.status(500).send(e);
	}
});

app.post(nodeAdapter.urls.UPDATE_AVAILABILITY, async (req, res) => {
	try {
		let {id, availability} = req.body.data;
		const sanitized = [];
		availability.sort((a1, a2) => a1.start > a2.start);
		for (const a of availability) {
			if (a.end < a.start) {
				throw new Error("Illegal Input: end time cannot be before start time.");
			}
			const idx = sanitized.length - 1;
			const last = sanitized[idx];
			if (last && (a.start <= last.end)) { // overlap
				const latestEnd = last.end > a.end ? last.end : a.end;
				sanitized[idx] = { start: last.start, end: latestEnd };
			} else {
				sanitized.push(a);
			}
		}
		const token: string = req.header("token");
		if (await resourceFacade.exists(id, ResourceKind.Candidate)) {
			const candidate = {
				...await resourceFacade.get(token, id, ResourceKind.Candidate),
				id,
				availability: sanitized
			};
			await resourceFacade.create(token, candidate, ResourceKind.Candidate);
			res.sendStatus(200);
		} else {
			res.sendStatus(401);
		}
	} catch (e) {
		res.status(400).send(e);
	}
});

