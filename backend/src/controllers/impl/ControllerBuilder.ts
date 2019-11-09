import {CandidateController, InterviewerController, RoomController} from "../ResourceControllers";
import DynamoDBCandidateController from "./resources/DynamoDBCandidateController";
import MSGraphInterviewerController from "./resources/MSGraphInterviewerController";
import DynamoDBRoomController from "./resources/DynamoDBRoomController";

export default class ControllerBuilder {
	public static getCandidateController(): CandidateController {
		return new DynamoDBCandidateController();
	}
	
	public static getInterviewerController(): InterviewerController {
		return new MSGraphInterviewerController();
	}
	
	public static getRoomController(): RoomController {
		return new DynamoDBRoomController();
	}
}