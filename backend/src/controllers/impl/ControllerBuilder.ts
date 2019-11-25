import {CandidateController, InterviewerController, IResourceController, RoomController} from "../ResourceControllers";

export default class ControllerBuilder {
	/**
	 * How to add new sources
	 * - First extend the class "<TYPE>Controller" type and place the file in "./resources/<SOURCE><Type>Controller.ts"
	 * 		- <TYPE> ::= Candidate | Interviewer | Room
	 * 		- <SOURCE> ::= <string>
	 * - Change the static field to refer to an environment variable or Config element
	 *  	- Example: `private static readonly CANDIDATE_SOURCE: string = process.env.CANDIDATE_SOURCE;`
	 * - Set the environment variable to <TYPE>
	 *     - Example: `CANDIDATE_SOURCE=MongoDB`
	 */
	private static readonly CANDIDATE_SOURCE: string = "DynamoDB";
	private static readonly INTERVIEWER_SOURCE: string = "MSGraph";
	private static readonly ROOM_SOURCE: string = "Hybrid";

	public static getCandidateController(): CandidateController {
		return this.getController(this.CANDIDATE_SOURCE, "Candidate") as CandidateController;
	}

	public static getInterviewerController(): InterviewerController {
		return this.getController(this.INTERVIEWER_SOURCE, "Interviewer") as InterviewerController;
	}

	public static getRoomController(): RoomController {
		return this.getController(this.ROOM_SOURCE, "Room") as RoomController;
	}
	
	private static getController(source, type): IResourceController {
		// Let's say source is set to "MongoDB", type is "Room", then import MongoDBRoomController.ts
		const classObject = require(`./resources/${source}${type}Controller`);
		// Retrieve the name of the constructor from the MongoDBRoomController class
		const constructor = Object.keys(classObject)[0];
		// Call the constructor and return a new instance
		return new classObject[constructor]();
	}
}