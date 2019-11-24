import { interfaces } from "adapter";
import {IScheduleAvailabilities, Preference} from "./Common";
import Log, {trace} from "../Log";

type PreferenceAvail = {interviewer: Preference, availability: interfaces.IAvailability};
type CandidateSchedule = {schedule: interfaces.ISchedule, numChangeOvers: number, numUnscheduled: number};
type RoomAvail = {room: interfaces.IRoom, availability: interfaces.IAvailability};

const took = (start, end) => Date.parse(end) - Date.parse(start);
const slotLength = m => took(m.start as string, m.end as string);
const sumAvailability: (a) => number = availability => availability.map(slotLength).reduce((m, n) => m + n, 0);
const biggestSlot = availability => availability.map(slotLength).reduce((m, n) => m > n ? m : n, 0);
const averageSlot = availability => sumAvailability(availability) / availability.length;
const gaussianIsh = (x, b) => Math.max(0, Math.exp(-Math.pow(x - b, 2) / 8));
const arrayCopy = a => [...a];
const objectCopy = o => ({...o});
const isWorkingHour = date => (date.getDay() >= 1 && date.getDay() <= 5 && date.getHours() >= 8 && date.getHours() <= 17);
const createSlot = (a,b) => ({start: a, end: b});

const DEFAULT_WORKING_HOURS = {
	"daysOfWeek": [
		"monday",
		"tuesday",
		"wednesday",
		"thursday",
		"friday"
	],
	"startTime": "09:00:00.0000000",
	"endTime": "17:00:00.0000000",
	"timeZone": {
		"name": "Pacific Standard Time"
	}
};

const WEEKDAYS = {
	monday: 1,
	tuesday: 2,
	wednesday: 3,
	thursday: 4,
	friday: 5
};

function tookHuman(start: number): string {
	const milliseconds = Date.now() - start;
	const seconds = milliseconds / 1000;
	if (Math.abs(seconds) >= 1.5) {
		return Math.round(seconds) + " seconds";
	} else if (seconds >= 1) {
		return "1 second";
	} else {
		const output = seconds.toFixed(2);
		return output === '1.00' ? "1 second" : output + " seconds";
	}
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

export function clipNonWorkingHours(availability: interfaces.IAvailability, workingHours = DEFAULT_WORKING_HOURS): interfaces.IAvailability {
	let workingDay = workingHours.daysOfWeek.map(w => WEEKDAYS[w]);
	let dates = new Set();

	for (let time of availability) {
		let now = new Date();
		// earlier date now or start?
		let startTime = (time.start > now.toISOString()) ? new Date(time.start.toString()) : now;
		let endTime = new Date(time.end.toString());
		// if start > end continue;
		if (startTime.toISOString() > endTime.toISOString()) {
			continue;
		}
		// add initial date to set
		if (workingDay.includes(startTime.getDay())) {
			dates.add(`${startTime.getFullYear()}-${("0" + (startTime.getMonth()+1)).slice(-2)}-${("0" + startTime.getDate()).slice(-2)}`)
		}
		// add end date to set -> if end time is in there -> set does not add
		if (workingDay.includes(endTime.getDay())) {
			dates.add(`${endTime.getFullYear()}-${("0" + (endTime.getMonth()+1)).slice(-2)}-${("0" + endTime.getDate()).slice(-2)}`)
		}
	}

	let availableSlots = [];
	// create array of times
	for (let date of dates) {
		let start = new Date(`${date}T${workingHours.startTime}`);
		let end = new Date(`${date}T${workingHours.endTime}`);
		availableSlots.push({
			start: start.toISOString(),
			end: end.toISOString()
		})
	}
	// find and return overlapping times
	return findOverlap(availability, availableSlots);
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
		.map(r => ({room: r.room, availability: r.availability.sort((a, b) =>  took(b.start, b.end) - took(a.start, a.end))}));
}

export function generateSchedules(candidate: interfaces.ICandidate, scheduleAvailabilities: IScheduleAvailabilities): interfaces.ISchedule[] {
	const start = Date.now();
	Log.trace("SchedulerUtils::generateSchedules(..) - Starting");
	const sortedRooms = rankRooms(scheduleAvailabilities);
	const groupedInterviewers = buildGroups(scheduleAvailabilities.interviewers);
	const schedules: CandidateSchedule[] = [];
	for (let i = 0; i < 9; i++) {
		const s: CandidateSchedule = makeOneSchedule(candidate, arrayCopy(sortedRooms), arrayCopy(groupedInterviewers), i);
		if (s.schedule.meetings.length > 0) {
			schedules.push(s);
		}
	}
	// Add a wildcard with randomly sorted everything
	const wildcard = makeOneSchedule(candidate, 
		shuffle([...sortedRooms.map(r => ({...r, availability: shuffle(r.availability)}))]),
		arrayCopy(groupedInterviewers), 0);
	if (wildcard.schedule.meetings.length > 0) {
		schedules.push(wildcard);
	}
	const output: CandidateSchedule[] = [];
	// Sort by number of change overs. Return most densely packed schedule
	if (schedules.length > 0) {
		schedules.sort((a, b) => {
			const change = a.numChangeOvers - b.numChangeOvers;
			return change === 0 ? a.numUnscheduled - b.numUnscheduled : change;
		});
		output.push(schedules[0]);
	}
	// Sort by number of unscheduled. Return most highly scheduled
	if (schedules.length > 1) {
		schedules.sort((a, b) => {
			const unsched = a.numUnscheduled - b.numUnscheduled;
			return unsched === 0 ? a.numChangeOvers - b.numChangeOvers : unsched;
		});
		if (schedules[0] === output[0]) {
			output.push(schedules[1]);
		} else {
			output.push(schedules[0]);
		}
	}
	// Optimize for both
	if (schedules.length > 2) {
		schedules.sort((a, b) => (a.numUnscheduled + a.numChangeOvers) - (b.numUnscheduled + b.numChangeOvers));
		if (!output.includes(schedules[0])) {
			output.push(schedules[0]);
		} else if (!output.includes(schedules[1])) {
			output.push(schedules[1]);
		} else {
			output.push(schedules[2]);
		}
	}
	Log.trace(`Returning all schedules. ${schedules.length} schedules were found. All runs + overhead took ${tookHuman(start)}.`);
	return output.map(s => s.schedule);
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

function removeOverlap(availability: interfaces.IAvailability, meetings: interfaces.IMeeting[]): interfaces.IAvailability {
	/** delete all meetings from the avail. For example
	 * input:  avail = [{start: 1000, end: 1400}], meetings = [{start: 1100, end: 1200}]
	 * output: avail = [{start: 1000, end: 1100}, {start: 1200, end: 1400}]
	 */
	let new_availability = [];
	for (let m of meetings) {
		for (let a of availability) {
			if (m.end < a.start || a.end < m.start) { // if is a or m has no relation
				new_availability.push(createSlot(a.start, a.end));
			} else if (a.start < m.start && m.end < a.end) { // if a is between m
				new_availability.push(createSlot(a.start, m.start));
				new_availability.push(createSlot(m.end, a.end));
			} else if (a.start >= m.start && m.end < a.end) { // if a is after m and ends later than m
				new_availability.push(createSlot(m.end, a.end));
			} else if (a.start < m.start && m.end >= a.end) { // if a is before m and ends before m
				new_availability.push(createSlot(a.start, m.start));
			}
		}
		availability = new_availability;
		new_availability = [];
	}
	return availability;
}

function makeOneSchedule(candidate: interfaces.ICandidate, rooms: RoomAvail[], groups: PreferenceAvail[][], roomStart): CandidateSchedule {
	groups = shuffle(groups);
	let roomIndex = 0, numUnscheduled = 0, numChangeOvers = 0, meetings: interfaces.IMeeting[] = [];
	
	// while there are rooms and groups
	while (roomIndex < rooms.length && groups.length > 0) {
		let meetingRun = 0;
		// select a room
		const room: RoomAvail = rooms[(roomStart + roomIndex) % rooms.length];
		let timeslotIndex = 0, scheduled = false, timeStart = 0;
		const availability: interfaces.IAvailability = removeOverlap(arrayCopy(room.availability), meetings);
		if (meetings.length > 0) {
			const candidateTimeStart = availability.findIndex(t => {
				const lastMeeting = meetings[meetings.length - 1];
				return (lastMeeting.end <= t.start && took(lastMeeting.end, t.start) < 1000 * 60 * 60 * 8) ||
					(lastMeeting.start >= t.end && took(t.end, lastMeeting.start) < 1000 * 60 * 60 * 8)
			});
			if (candidateTimeStart > 0) {
				timeStart = 0;
			}
		}
		// while there are timeslots
		while (timeslotIndex < availability.length && groups.length > 0) {
			const timeslot: { start: string; end: string; } = objectCopy(availability[(timeslotIndex + timeStart) % availability.length]);
			let groupIndex = 0;
			// while there are groups
			while (groupIndex < groups.length) {
				// shallow copy the group and shuffle
				const group: PreferenceAvail[] = shuffle(groups[groupIndex]);
				// if time wanted fits in timeslot
				const milliseconds = group[0].interviewer.minutes * 1000 * 60;
				if (milliseconds <= took(timeslot.start, timeslot.end) && room.room.capacity > 1) {
					let preferenceIndex = 0;
					// while there are members in the group
					while (preferenceIndex < group.length) {
						// if can't schedule around beginning of timeslot
						const overlap = findOverlappingTime([timeslot], ...group.slice(preferenceIndex).map(p => p.availability));
						if (overlap.length !== 0 &&
							(overlap[0].start === timeslot.start || meetingRun === 0) &&
							room.room.capacity > group.length - preferenceIndex &&
							milliseconds <= took(overlap[0].start, overlap[0].end)
						) {
							scheduled = true;
							// add to meetings
							const start: string = overlap[0].start as string;
							const end = new Date(Date.parse(start) + milliseconds).toISOString();
							meetings.push({
								interviewers: group.slice(preferenceIndex).map(p => p.interviewer.interviewer),
								room: room.room,
								start: start,
								end: end,
							});
							// update the timeslot
							timeslot.start = end;
							// inc meeting run
							meetingRun += took(start, end);
							// if meeting run is over 4 hours
							if (meetingRun > 14400000) {
								// set it to 0, add a break (30  minutes) to timeslot
								meetingRun = 0;
								timeslot.start = new Date(Date.parse(timeslot.start) + 1800000).toISOString();
							}
     						groups.splice(groupIndex--, 1);
							numUnscheduled += preferenceIndex;
							break;
						} else {
							// kick someone out of the group
							preferenceIndex++;
						}
					}
				}
				// remove group from groups
				groupIndex++;
				// if timeslot has become invalid, new timeslot
				if (timeslot.start >= timeslot.end) {
					break;
				}
			}
			// remove the timeslot
			timeslotIndex++;
		}
		roomIndex++;
		meetingRun = 0;
		if (scheduled && groups.length > 0) {
			numChangeOvers++;
		}
	}
	meetings.sort((a, b) => a.start < b.start ? -1 : 1);
	Log.trace(`Returning schedule that had ${numChangeOvers} change overs and ${numUnscheduled} unscheduled interviewers`);
	return {schedule: {candidate, meetings}, numChangeOvers, numUnscheduled};
}

function shuffle(array: any[]): any[] {
	// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
	let currentIndex = array.length;
	// While there remain elements to shuffle...
	while (currentIndex > 0) {
		// Pick a remaining element...
		const random = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;
		// And swap it with the current element.
		const temp = array[currentIndex];
		array[currentIndex] = array[random];
		array[random] = temp;
	}
	return array;
}
