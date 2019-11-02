import {IInterviewer, ISchedule} from "../interfaces";
import fakeCandidates from "./fakeCandidates";
import moment from "moment";

const fakeInterviewers: IInterviewer[]= [
	{
		id: "4",
		firstName: "Andrea",
		lastName: "Tamez",
	},
	{
		id: "5",
		firstName: "Masahiro",
		lastName: "Toyomura",
	},
	{
		id: "6",
		firstName: "Cindy",
		lastName: "Hsu",
	},
];

export const fakeSchedules: ISchedule[] = [
	{
		candidate: fakeCandidates[0],
		meetings: [
			{
				interviewers: [fakeInterviewers[0], fakeInterviewers[1]],
				startTime: moment().startOf("day").add(10, "hour"),
				endTime: moment().startOf("day").add(11, "hour"),
				room: {id: "7", name: "Meeting Room #1", eligible: true},
			},
			{
				interviewers: [fakeInterviewers[2]],
				startTime: moment().startOf("day").add(11, "hour"),
				endTime: moment().startOf("day").add(11.5, "hour"),
				room: {id: "8", name: "Meeting Room #2", eligible: true},
			},
		]
	},
	{
		candidate: fakeCandidates[0],
		meetings: [
			{
				interviewers: [fakeInterviewers[0], fakeInterviewers[1]],
				startTime: moment().startOf("day").add(13.5, "hour"),
				endTime: moment().startOf("day").add(14.5, "hour"),
				room: {id: "9", name: "Meeting Room #3", eligible: true},
			},
		]
	}
];

export default fakeInterviewers;
