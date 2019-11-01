import {IRoomController} from "../../ResourceControllerTypes";
import { IRoom } from "adapter/dist/interfaces";
import {DynamoDBController} from "../DynamoDBController";

export default class DynamoDBRoomController implements IRoomController {
	private dbc: DynamoDBController;

	constructor() {
		this.dbc = DynamoDBController.getInstance();
	}
	
	public async list(token: string): Promise<IRoom[]> {
		return [];
	}

	public async create(token: string, resource: IRoom): Promise<boolean> {
		return false;
	}

	public async delete(token: string, id: string): Promise<boolean> {
		return false;
	}
	
}