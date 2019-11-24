import {CandidateController} from "../../ResourceControllers";
import {interfaces} from "adapter";
import {DynamoDBController, IDynamoDBController} from "../DynamoDBController";
import {concatenateMoments} from "../../SchedulerUtils";
import Log from "../../../Log";

export default class DynamoDBCandidateController extends CandidateController {
	private dbc: IDynamoDBController;

	constructor() {
		super();
		this.dbc = DynamoDBController.getInstance();
	}

	public async list(token: string): Promise<interfaces.ICandidate[]> {
		return await this.dbc.getCandidates();
	}

	public async create(token: string, candidate: interfaces.ICandidate): Promise<interfaces.ICandidate> {
		candidate = this.assertCandidate(candidate);
		if (typeof candidate.id !== "string") {
			Log.trace("Candidate", candidate.email, "did not have an id. Creating");
			candidate.id = this.hashID(await this.dbc.createCandidateID());
			candidate.id += this.getRandomLongString();
		}
		if (candidate.availability) {
			candidate.availability = concatenateMoments(candidate.availability);
		}
		await this.dbc.writeCandidate(candidate);
		return candidate;
	}

	public async delete(token: string, id: string): Promise<boolean> {
		await this.dbc.deleteCandidate(id);
		return true; // TODO more guards?
	}
	
	public async exists(id: string): Promise<boolean> {
		return typeof (await this.dbc.getCandidate(id)) === "object";
	}

	public get(token: string, id: string): Promise<interfaces.IResource> {
		return this.dbc.getCandidate(id);
	}
	
	private hashID(id: string): string {
		// https://gist.github.com/iperelivskiy/4110988
		var a = 1, c = 0, h, o;
		if (id) {
			a = 0;
			for (h = id.length - 1; h >= 0; h--) {
				o = id.charCodeAt(h);
				a = (a<<6&268435455) + o + (o<<14);
				c = a & 266338304;
				a = c!==0?a^c>>21:a;
			}
		}
		return String(a);
	}
	
	private getRandomLongString(): string {
		const stringLength = 32;
		const chars = "QWERTYUIOPASDFGHJKLZXCVBNM1234567890";
		let key = "";
		while (key.length < stringLength) {
			key += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return key;
	}

}