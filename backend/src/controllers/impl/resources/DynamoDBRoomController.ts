import {IRoomController} from "../../ResourceControllerTypes";
import { interfaces } from "adapter";
import {DynamoDBController} from "../DynamoDBController";

export default class DynamoDBRoomController implements IRoomController {
	private dbc: DynamoDBController;

	constructor() {
		this.dbc = DynamoDBController.getInstance();
	}

	public async list(token: string): Promise<interfaces.IRoom[]> {
		return await this.dbc.getRooms();
	}

	public async create(token: string, resource: interfaces.IRoom): Promise<interfaces.IRoom> {
		// TODO validation?
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
}