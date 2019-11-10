import {app} from "../index";
import {interfaces, nodeAdapter} from "adapter";
import IResourceFacade from "../controllers/IResourceFacade";
import ResourceFacade from "../controllers/impl/ResourceFacade";
import {ResourceKind} from "../controllers/Common";
import AuthController from "../controllers/AuthController";
import MSGraphController from "../controllers/MSGraphController";
import createEmail, {createAvailabilityContent} from "../controllers/EmailConfig";

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
		let data;
		if (token && await AuthController.getInstance().checkAuth(token)) {
			data = candidate;
		} else {
			data = {email: "", firstName: candidate.firstName, availability: candidate.availability};
		}
		res.status(200).send(data);
	} catch(e) {
		res.status(500).send(e);
	}
});

app.post(nodeAdapter.urls.UPDATE_AVAILABILITY, async (req, res) => {
	try {
		const token: string = req.header("token");
		let {id, availability} = req.body.data;
		if (await resourceFacade.exists(id, ResourceKind.Candidate)) {
			const candidate = {...await resourceFacade.get(token, id, ResourceKind.Candidate), id, availability};
			await resourceFacade.create(token, candidate, ResourceKind.Candidate);
			res.sendStatus(200);
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
	const email = {
		subject: 'Availability Form',
		content: createAvailabilityContent(candidate),
		recipients: [candidate.email]
	};
	try {
		if (token && await AuthController.getInstance().checkAuth(token)) {
			const result = await MSGraphController.sendAvailabilityEmail(token, createEmail(email));
			console.log(result);
			res.status(200).send(result);
		} else {
			res.sendStatus(401);
		}
	} catch (e) {
		res.status(400).send(e);
	}
});
