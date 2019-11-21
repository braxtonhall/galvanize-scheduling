import { interfaces } from "adapter";

export interface IScheduleAvailabilities {
	rooms: {room: interfaces.IRoom, availability: interfaces.IAvailability}[]
	interviewers: {interviewer: interfaces.IInterviewer, availability: interfaces.IAvailability}[]
}

export function concatenateMoments(availability: interfaces.IAvailability): interfaces.IAvailability {
	if (availability.some(m => typeof m.start !== "string" || typeof m.end !== "string")) {
		throw new Error("Cannot concatenate non-string Moments");
	}
	const output = [];
	const getMatch = (a, b) => Math.abs(took(a.end as string, b.start as string)) < 1000 * 60;
	while (availability.length > 0) {
		const moment = availability.pop();
		const getBefore = () => availability.findIndex(m => getMatch(m, moment));
		const getAfter = () => availability.findIndex(m => getMatch(moment, m));
		const apply = (f, t) => {
			let i = f();
			while (i >= 0) {
				moment[t] = availability[i][t];
				availability.splice(i, 1);
				i = f();
			}
		};
		apply(getBefore, "start");
		apply(getAfter, "end");
		output.push(moment);
	}
	return output;
}

function took(start: string, end: string): number {
	return Date.parse(end) - Date.parse(start);
}
