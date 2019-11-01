import {IResource, ICandidate, IInterviewer, IRoom} from "adapter/dist/interfaces";

export const MOCK_CANDIDATES: ReadonlyArray<ICandidate> = [
	{
		id: "1",
		email: "christopher@frameonesoftware.com",
		phoneNumber: "(604) 319-5219",
		firstName: "Christopher",
		lastName: "Powroznik",
		position: "Lead Developer",
		notes: "Possibly the greatest candidate of all time."
	},
	{
		id: "2",
		email: "braxton.hall@alumni.ubc.ca",
		phoneNumber: "(604) 555-1234",
		firstName: "Braxton",
		lastName: "Hall",
		position: "Musical Programmer",
		notes: "Very talented at being creative with different mediums."
	},
	{
		id: "3",
		email: "kyeo@gmail.com",
		phoneNumber: "(604) 345-7890",
		firstName: "Kwangsoo",
		lastName: "Yeo",
		position: "Instructor",
		notes: "Good with people, excelled in phone interview."
	},
];

export const MOCK_ROOMS: ReadonlyArray<IRoom> = [ // TODO what are we even storing?
	{
		name: "1",
	},
	{
		name: "2",
	},
	{
		name: "3",
	}
];
