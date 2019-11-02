import {IRoomController} from "../../ResourceControllerTypes";
import { IRoom } from "adapter/dist/interfaces";
import {DynamoDBController} from "../DynamoDBController";

export default class DynamoDBRoomController implements IRoomController {
	private dbc: DynamoDBController;

	constructor() {
		this.dbc = DynamoDBController.getInstance();
	}
	
	public async list(token: string): Promise<IRoom[]> {
		return await this.dbc.getRooms();
	}

	public async create(token: string, resource: IRoom): Promise<boolean> {
		// TODO validation?
		await this.dbc.writeRoom(resource);
		return true;
	}

	public async delete(token: string, name: string): Promise<boolean> {
		await this.dbc.deleteRoom(name);
		return true;
	}
	
}