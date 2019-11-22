import { interfaces } from "adapter";
import {IScheduleAvailabilities, Preference} from "./Common";

type PreferenceAvail = {interviewer: Preference, availability: interfaces.IAvailability};
type CandidateSchedule = {schedule: interfaces.ISchedule, numChangeOvers: number, numUnscheduled: number};
type RoomAvail = {room: interfaces.IRoom, availability: interfaces.IAvailability};

const took = (start, end) => Date.parse(end) - Date.parse(start);
const slotLength = m => took(m.start as string, m.end as string);
const sumAvailability: (a) => number = availability => availability.map(slotLength).reduce((m, n) => m + n, 0);
const biggestSlot = availability => availability.map(slotLength).reduce((m, n) => m > n ? m : n, 0);
const averageSlot = availability => sumAvailability(availability) / availability.length;
const gaussianIsh = (x, b) => Math.max(0, Math.exp(-Math.pow(x - b, 2) / 8));

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

export function clipNonWorkingHours(availability: interfaces.IAvailability): interfaces.IAvailability {
	// TODO trim off any availability times outside of working hours
	return availability;
}

function findOverlappingTime(...avail: interfaces.IAvailability[]): interfaces.IAvailability {
	return avail.length > 0 ? avail.slice(1).reduce(findOverlap, avail[0]) : [];
}

function findOverlap(availA: interfaces.IAvailability, availB: interfaces.IAvailability): interfaces.IAvailability {
	let overlap = [];
	for (let timeA of availA) {
		for (let timeB of availB) {
			if (timeA.end <= timeB.start // A ends earlier than start of B
				|| timeB.end <= timeA.start // B ends earlier than start of A
				|| timeA.start >= timeB.end // A starts after B ends
				|| timeB.start >= timeA.end) { // B starts after A ends
				continue;
			}
			overlap.push({
				start: (timeA.start <= timeB.start) ? timeB.start : timeA.start, // if A <= B then B is the start else its A
				end: (timeA.end <= timeB.end) ? timeA.end : timeB.end // if A ends earlier than B, A is the end else B
			})
		}
	}
	return overlap;
}

function findAverageOverlapSum(avail: interfaces.IAvailability, testAvails: interfaces.IAvailability[]): number {
	return testAvails
		.map(a => sumAvailability(findOverlappingTime(avail, a)))
		.reduce((m, n) => m + n, 0) / testAvails.length;
}

function scoreRoom(room: interfaces.IAvailability, interviewers: interfaces.IAvailability[], numRooms: number, capacity: number): number {
	// THIS IS THE HEART OF THIS WHOLE ALGORITHM! THE NUMBERS ARE BETA AND SUBJECT TO CHANGE!
	
	// Capacity (the higher, the more can fit in a room at once, but too high and it's a waste of space.
	// 		Peak starts at 4, increase with more interviewers)
	const capacityScore = gaussianIsh(capacity, (interviewers.length / 10) + 4);
	// Average overlapping time (important because the higher overlap, the more interviewers can fit in that room)
	const averageOverlapScore = findAverageOverlapSum(room, interviewers) / interviewers.length;
	// The biggest slot (important because we want to fit as many interviewers as possible back to back)
	const biggestSlotScore = biggestSlot(room);
	// Average slot (important because we have more chances of fitting many back to back if high)
	const averageSlotScore = averageSlot(room);
	
	return 100 * capacityScore + averageOverlapScore / 5000 + biggestSlotScore / 20000 + averageSlotScore / 10000;
}

function rankRooms(scheduleAvailabilities: IScheduleAvailabilities): RoomAvail[] {
	const interviewerAvails = scheduleAvailabilities.interviewers.map(i => i.availability);
	const rooms = scheduleAvailabilities.rooms;
	return rooms
		.map(r => ({...r, score: scoreRoom(r.availability, interviewerAvails, rooms.length, r.room.capacity)}))
		.sort((r, l) =>  l.score - r.score)
		.map(r => ({room: r.room, availability: r.availability}));
}

export function generateSchedules(candidate: interfaces.ICandidate, scheduleAvailabilities: IScheduleAvailabilities): interfaces.ISchedule[] {
	const sortedRooms = rankRooms(scheduleAvailabilities);
	const groupedInterviewers = buildGroups(scheduleAvailabilities.interviewers);
	const schedules: CandidateSchedule[] = [];
	for (let i = 0; i < 10; i++) {
		const s: CandidateSchedule = makeOneSchedule(candidate, sortedRooms, groupedInterviewers);
		if (s.schedule.meetings.length > 1) {
			schedules.push(s);
		}
	}
	schedules.sort((a , b) => {
		const unscheduledComp = a.numUnscheduled - b.numUnscheduled;
		if (unscheduledComp === 0) {
			return a.numUnscheduled - b.numUnscheduled;
		} else {
			return unscheduledComp;
		}
	});
	return schedules.map(s => s.schedule).slice(0, 3);
}

function buildGroups(preferences: PreferenceAvail[]): PreferenceAvail[][] {
	const groups: {members: Set<string>, data: PreferenceAvail[]}[] = [];
	preferences.forEach((preference) => {
		const p = preference.interviewer;
		for (const group of groups) {
			if (group.members.has(p.interviewer.id)) {
				if (p.preference) {
					group.members.add(p.preference.id);
				}
				group.data.push(preference);
				return;
			} else if (p.preference && group.members.has(p.preference.id)) {
				group.members.add(p.interviewer.id);
				group.data.push(preference);
				return;
			}
		}
		const set = new Set<string>();
		set.add(p.interviewer.id);
		if (p.preference) {
			set.add(p.preference.id);
		}
		groups.push({members: set, data: [preference]});
	});
	return groups.map(g => g.data);
}

function makeOneSchedule(candidate: interfaces.ICandidate, rooms: RoomAvail[], groups: PreferenceAvail[][]): interfaces.ISchedule {
	
	// TODO implement stub
	return {candidate, meetings: []};
}
