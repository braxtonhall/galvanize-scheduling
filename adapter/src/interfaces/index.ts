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
