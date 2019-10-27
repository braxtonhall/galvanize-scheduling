import {IRoomController} from "../../ResourceControllerTypes";
import { IRoom } from "adapter/dist/interfaces";

export default class DynamoDBRoomController implements IRoomController {
	public async getRooms(token: string): Promise<IRoom[]> {
		return [];
	}

	public async createRoom(token: string, resource: IRoom): Promise<boolean> {
		return false;
	}
	
}