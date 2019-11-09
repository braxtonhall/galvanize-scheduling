import { interfaces } from "adapter";
import {EMAIL_REGEX} from "./Common";

export interface IResourceController {
	list(token: string): Promise<interfaces.IResource[]>;
	create(token: string, resource: interfaces.IResource): Promise<interfaces.IResource>;
	delete(token: string, id: string): Promise<boolean>;
	exists(id: string): Promise<boolean>;
}

export abstract class CandidateController implements IResourceController {
	abstract create(token: string, resource: interfaces.IResource): Promise<interfaces.IResource>;
	abstract delete(token: string, id: string): Promise<boolean>;
	abstract exists(id: string): Promise<boolean>;
	abstract list(token: string): Promise<interfaces.IResource[]>;

	/**
	 * Asserts that the given object is of the type ICandidate.
	 * 	If so, silently returns
	 * 	Else, throws an Error
	 * 	Also clips excess fields
	 * @param object
	 */
	protected assertCandidate(object: any): interfaces.ICandidate {
		if (!(typeof object["email"] === "string" && EMAIL_REGEX.test(object["email"]))) {
			throw new Error("Candidate must contain an email");
		}
		// TODO heavy dependency on the type. Perhaps not the cleanest way to do this.
		const {id, email, phoneNumber, firstName, lastName, position, notes, availability} = object;
		return {id, email, phoneNumber, firstName, lastName, position, notes, availability};
	}
}

export abstract class InterviewerController implements IResourceController {
	abstract create(token: string, resource: interfaces.IResource): Promise<interfaces.IResource>;
	abstract delete(token: string, id: string): Promise<boolean>;
	abstract exists(id: string): Promise<boolean>;
	abstract list(token: string): Promise<interfaces.IResource[]>;

	/**
	 * Asserts that the given object is of the type ICandidate.
	 * 	If so, silently returns
	 * 	Else, throws an Error
	 * 	Also clips excess fields
	 * @param object
	 */
	protected assertInterviewer(object: any): interfaces.IInterviewer {
		if (!(typeof object["id"] === "string" && object["id"] !== "")) {
			throw new Error("Interviewer must contain an id");
		}
		const {id, firstName, lastName} = object;
		return {id, firstName, lastName};

	}
}

export abstract class RoomController implements IResourceController {
	abstract create(token: string, resource: interfaces.IResource): Promise<interfaces.IResource>;
	abstract delete(token: string, id: string): Promise<boolean>;
	abstract exists(id: string): Promise<boolean>;
	abstract list(token: string): Promise<interfaces.IResource[]>;

	/**
	 * Asserts that the given object is of the type IRoom.
	 * 	If so, silently returns
	 * 	Else, throws an Error
	 * 	Also clips excess fields
	 * @param object
	 */
	protected assertRoom(object: any): interfaces.IRoom {
		if (!(typeof object["name"] === "string" && object["name"] !== "")) {
			throw new Error("Room must contain a name");
		}
		const {id, name, eligible} = object;
		return {id, name, eligible};
	}
}
