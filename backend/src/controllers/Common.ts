export enum ResourceKind {
	Candidate,
	Interviewer,
	Room,
}

/**
 * Asserts that the given object is of the type claimed.
 * 	If so, silently returns
 * 	Else, throws an Error
 * @param kind
 * @param object
 */
export function assertIs(kind: ResourceKind, object: any): void {
	// TODO
}