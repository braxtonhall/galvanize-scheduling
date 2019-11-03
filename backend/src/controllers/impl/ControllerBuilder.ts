import {ICandidateController, IInterviewerController, IRoomController} from "../ResourceControllerTypes";
import DynamoDBCandidateController from "./resources/DynamoDBCandidateController";
import MSGraphInterviewerController from "./resources/MSGraphInterviewerController";
import DynamoDBRoomController from "./resources/DynamoDBRoomController";

export default class ControllerBuilder {
	public static getCandidateController(): ICandidateController {
		return new DynamoDBCandidateController();
	}
	
	public static getInterviewerController(): IInterviewerController {
		return new MSGraphInterviewerController();
	}
	
	public static getRoomController(): IRoomController {
		return new DynamoDBRoomController();
	}
}