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

	public async list(token: string): Promise<Array<interfaces.IRoom>> {
		const keys = (await this.dbc.getRooms()).map(room => room.name);
		return (await MSGraphController.getRooms(token))
			.map(room => ({
				...room,
				eligible: keys.includes(room.name)
			}));
	}

	public async create(token: string, resource: interfaces.IRoom): Promise<interfaces.IRoom> {
		resource = this.assertRoom(resource);
		if ((await MSGraphController.getRooms(token)).map(room => room.name).includes(resource.name)) {
			await this.dbc.writeRoom(resource);
			return resource;
		} else {
			throw new Error("Graph did not contain this Resource.")
		}
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