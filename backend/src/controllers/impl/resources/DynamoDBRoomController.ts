import {IRoomController} from "../../ResourceControllerTypes";
import { IRoom } from "adapter/dist/interfaces";

export default class DynamoDBRoomController implements IRoomController {
	public async list(token: string): Promise<IRoom[]> {
		return [];
	}

	public async create(token: string, resource: IRoom): Promise<boolean> {
		return false;
	}

	public async delete(token: string, resource: IRoom): Promise<boolean> {
		return false;
	}
	
}