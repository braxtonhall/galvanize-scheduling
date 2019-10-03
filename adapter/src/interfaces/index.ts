export interface IHiringManager {
	id?: string,
}

export interface IHumanResource {
	id?: string,
}

export interface IRoom {
	id?: string,
}

export interface ICandidate {
	id?: string,
	email: string,
	phoneNumber: string,
	firstName: string,
	lastName: string,
	position: string,
	notes: string,
}

export interface IInterviewer {
	id?: string,
}

export interface ISchedule {
	candidate: ICandidate
	// TODO
}

export interface IAvailability {

}

export interface IGetSchedulesOptions {

}

export enum Role {
	UNKNOWN,
	CANDIDATE,
	HIRING_MANAGER,
	HUMAN_RESOURCE,
}
