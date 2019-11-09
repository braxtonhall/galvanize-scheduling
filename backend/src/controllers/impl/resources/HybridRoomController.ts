import {RoomController} from "../../ResourceControllers";
import {interfaces} from "adapter";
import {DynamoDBController} from "../DynamoDBController";
import MSGraphController from "../../MSGraphController";

export default class HybridRoomController extends RoomController {
	private dbc: DynamoDBController;

	constructor() {
		super();
		this.dbc = DynamoDBController.getInstance();
	}

	public async list(token: string): Promise<interfaces.IRoom[]> {
		const keys = (await this.dbc.getRooms()).map(room => room.name);
		return (await MSGraphController.getRooms(token))
			.map(room => ({
				id: room.id,
				name: room.name,
				eligible: keys.includes(room.name)
			}));
	}

	public async create(token: string, resource: interfaces.IRoom): Promise<interfaces.IRoom> {
		resource = this.assertRoom(resource);
		// TODO make sure it's actually in the Graph
		await this.dbc.writeRoom(resource);
		return resource;
	}

	public async delete(token: string, name: string): Promise<boolean> {
		await this.dbc.deleteRoom(name);
		return true;
	}

	public async exists(id: string): Promise<boolean> {
		throw  new Error("Unsupported Action - Room Exists?");
	}

	public get(token: string, id: string): Promise<interfaces.IResource> {
		throw  new Error("Unsupported Action - Get Room");
	}
}