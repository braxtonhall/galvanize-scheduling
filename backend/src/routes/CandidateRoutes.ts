import {app} from "../index";
import {nodeAdapter} from "adapter";
import IResourceFacade from "../controllers/IResourceFacade";
import ResourceFacade from "../controllers/impl/ResourceFacade";
import {ResourceKind} from "../controllers/Common";

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
