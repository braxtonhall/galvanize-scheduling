import { interfaces } from "adapter";
import {EMAIL_REGEX} from "./Common";

export interface IResourceController {
	list(token: string): Promise<interfaces.IResource[]>;
	create(token: string, resource: interfaces.IResource): Promise<interfaces.IResource>;
	delete(token: string, id: string): Promise<boolean>;
	exists(id: string): Promise<boolean>;
	get(token: string, id: string): Promise<interfaces.IResource>;
}

export abstract class CandidateController implements IResourceController {
	abstract create(token: string, resource: interfaces.IResource): Promise<interfaces.IResource>;
	abstract delete(token: string, id: string): Promise<boolean>;
	abstract exists(id: string): Promise<boolean>;
	abstract list(token: string): Promise<interfaces.IResource[]>;
	abstract get(token: string, id: string): Promise<interfaces.IResource>;

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
		const {id, email, phoneNumber, firstName, lastName, position, notes, availability, schedule} = object;
		return {id, email, phoneNumber, firstName, lastName, position, notes, availability, schedule};
	}
}

export abstract class InterviewerController implements IResourceController {
	abstract create(token: string, resource: interfaces.IResource): Promise<interfaces.IResource>;
	abstract delete(token: string, id: string): Promise<boolean>;
	abstract exists(id: string): Promise<boolean>;
	abstract list(token: string, groupName?: string): Promise<interfaces.IResource[]>;
	abstract get(token: string, id: string): Promise<interfaces.IResource>;

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
		const {id, firstName, lastName, email} = object;
		return {id, firstName, lastName, email};

	}
}

export abstract class RoomController implements IResourceController {
	abstract create(token: string, resource: interfaces.IResource): Promise<interfaces.IResource>;
	abstract delete(token: string, id: string): Promise<boolean>;
	abstract exists(id: string): Promise<boolean>;
	abstract list(token: string): Promise<interfaces.IResource[]>;
	abstract get(token: string, id: string): Promise<interfaces.IResource>;

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
		const {id, name, eligible, email, capacity} = object;
		return {id, name, eligible, email, capacity};
	}
}
