import {app} from "../index";
import {interfaces, nodeAdapter} from "adapter";
import IResourceFacade from "../controllers/IResourceFacade";
import ResourceFacade from "../controllers/impl/ResourceFacade";
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
		let data;
		if (token && await AuthController.getInstance().checkAuth(token)) {
			data = candidate;
		} else {
			data = {email: "", firstName: candidate.firstName};
		}
		res.status(200).send(data);
	} catch(e) {
		res.status(500).send(e.message);
	}
});
