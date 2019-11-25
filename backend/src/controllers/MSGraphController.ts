import {Client} from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch';
import {interfaces} from "adapter";
import {Config, ConfigKey} from "../Config";
import {clipNonWorkingHours, concatenateMoments} from "./SchedulerUtils";
import {IScheduleAvailabilities, Preference} from "./Common";
import {info} from "../Log";

/**
 * Class representing the Controller for Microsoft
 */
export default class MSGraphController {
    /**
     * Creates a client
     * @param {string} token - The token needed for requests.
     * @returns {Promise<Client>} The client with provided options.
     */
    private static getClient(token: string): Client {
        return Client.init({
            authProvider: (done) => {
                done(null, token);
            }
        });
    }

    /**
     * Builds a URI request
     * @param {[string]: any} query - The query in form string: any format
     * @returns {string} The URI request.
     */
    static buildRequest(query: {[key: string]: any}): string {
    	const cf: Config = Config.getInstance();
        const url = cf.get(ConfigKey.msOAuthAuthority) + cf.get(ConfigKey.msOAuthAuthorizeEndpoint) + "?";
        return url + encodeURI(Object.entries(query).map(([k, v]) => `${k}=${v}`).join("&"));
    }

    /**
     * Get all the groups using the MSGraph API /groups
     * @param {string} token - The token needed for requests.
     * @returns {Promise} Return an MSGraph Object with groups displayName and ID.
     * @see https://docs.microsoft.com/en-us/graph/api/group-list?view=graph-rest-1.0&tabs=javascript
     */
    static async getGroups(token: string): Promise<any> {
        return  await (this.getClient(token))
            .api('/groups')
            .select('id, displayName')
            .get();
    }

    /**
     * Get all the room recourse from Outlook.
     * @param {string} token - The token needed for requests
     * @returns {Promise<IRoom>} The rooms associated with client.
     * @see https://docs.microsoft.com/en-us/graph/api/resources/room?view=graph-rest-beta
     * NOTE: This request is in beta
     */
    static async getRooms(token: string): Promise<Array<interfaces.IRoom>> {
		return (await (this.getClient(token))
			.api('/places/microsoft.graph.room')
			.version('beta')
			.get())
			.value
			.map((room) => ({
				id: room.displayName,
				name: room.displayName,
				email: room.emailAddress,
				capacity: room.capacity || 0
			}));
	}

    /**
     * Get all the interviewers.
     * @param {string} token - The token needed for requests.
     * @param {id} id - The id of the "Group" in Outlook.
     * @returns {Promise<Array<IInterviewer>>} The members associated with a group.
     * @see https://docs.microsoft.com/en-us/graph/api/group-list-members?view=graph-rest-1.0&tabs=javascript
     */
    static async getInterviewers(token: string, id: string): Promise<interfaces.IInterviewer[]> {
        return (await (this.getClient(token))
            .api(`/groups/${id}/members`)
            .select('id,givenName,surname,mail')
            .get()).value
            .map((m) => ({
                id: m.id,
                firstName: m.givenName,
                lastName: m.surname,
                email: m.mail
            }));
    }

    /**
     * Get all the schedules.
     * @param {string} token - The token needed for requests.
     * @param {scheduleRequest} request - The request body to get a schedule.
     * @returns {Promise} The schedules with availabilities.
     * @see MSGraphController.scheduleRequest
     * @see https://docs.microsoft.com/en-us/graph/api/calendar-getschedule?view=graph-rest-1.0&tabs=javascript
     */
	static async getSchedule(token: string, request) {
		return (await (this.getClient(token))
			.api(Config.getInstance().get(ConfigKey.msScheduleEndpoint))
			.post(request)).value;
	}

    /**
     * Get timeslots that overlap and are working hours
     * @param {string} token - The token needed for requests.
     * @param {ICandidate} candidate - Current candidate to schedule interviews
     * @param {Array<IRoom>} rooms - All eligible rooms
     * @param {Array<Preference>} interviewers - All interviewers with minutes and preferences
     * @returns {Promise<IScheduleAvailabilities>} All timeslots between Candidate, Room and Interviewers.
     * @see MSGraphController.getSchedule
     */
    @info
    static async getScheduleWrapper(
    	token: string,
    	candidate: interfaces.ICandidate,
		rooms: Array<interfaces.IRoom>,
		interviewers: Array<Preference>
	): Promise<IScheduleAvailabilities> {
    	try {
    		let email_type = {};
			let availability_map = new Map<string, interfaces.IAvailability>();
			let object_map = new Map<string, any>();
			const request_array = rooms.map(r => {
				email_type[r.email] = 'room';
				object_map.set(r.email, r);
				availability_map.set(r.email, []);
				return r.email;
			}).concat(interviewers.map(i => {
				email_type[i.interviewer.email] = 'interviewer';
				availability_map.set(i.interviewer.email, []);
				object_map.set(i.interviewer.email, i);
				return i.interviewer.email;
			}));


			for (let timeslot of candidate.availability) {
				let floor = Math.floor(request_array.length / 20);
				for (let i = 0; i < floor+1; i++) {
					const availabilities = await this.getSchedule(token, this.scheduleRequest(
						request_array.slice((i * 20), ((i + 1) * 20)),
						// @ts-ignore
						timeslot
					));
					for (let availability of availabilities) {
						let date = new Date(timeslot.start.toString());

						for (let i = 0; i < availability.availabilityView.length; i++) {
							let time: interfaces.ITimeslot = {
								start: this.buildDate(date, 0),
								end: this.buildDate(date)
							};
							if (availability.availabilityView.charAt(i) === '0') {
							   availability_map.get(availability.scheduleId).push(time);
							}
						}

						availability_map.set(
							availability.scheduleId,
							clipNonWorkingHours(concatenateMoments(availability_map.get(availability.scheduleId)), availability.workingHours)
						)
					}
				}
			}

			let scheduleAvailabilities: IScheduleAvailabilities = {
				rooms: [],
				interviewers: []
			};

			for (let email of request_array) {
				scheduleAvailabilities[`${email_type[email]}s`] = [...scheduleAvailabilities[`${email_type[email]}s`], {
					[email_type[email]]: object_map.get(email),
					availability: availability_map.get(email)
				}]
			}
			
			return scheduleAvailabilities;

		} catch(e) {
    		throw new Error(e);
		}
	}

    /**
     * Schedules event with the selected interview options.
     * @param {string} token - The token needed for requests.
     * @param {ISchedule} schedule - Currently selected schedule option.
     * @returns {Promise<ISchedule>} All the scheduled interviews.
     * @see https://docs.microsoft.com/en-us/graph/api/user-post-events?view=graph-rest-1.0&tabs=javascript
     */
	static async bookSchedule(token: string, schedule: interfaces.ISchedule): Promise<interfaces.ISchedule> {
    	const client: Client = this.getClient(token);
    	const promises: Promise<interfaces.IMeeting>[] = schedule.meetings.map(m => {
			return client
				.api(`/me/events`)
				.post({
					"subject": `Interview with ${schedule.candidate.firstName ? schedule.candidate.firstName : schedule.candidate.email}`,
					"body": {
						"contentType": "HTML",
						"content": `Be ready ${schedule.candidate.firstName ? `to join ${schedule.candidate.firstName} in` : "for"} an interview for ${schedule.candidate.position ? schedule.candidate.position : "Galvanize"}.`
					},
					"start": {
						"dateTime": typeof m.start === "string" ? m.start : m.start.toISOString(),
						"timeZone": "UTC"
					},
					"end": {
						"dateTime": typeof m.end === "string" ? m.end : m.end.toISOString(),
						"timeZone": "UTC"
					},
					"location":{
						"displayName": m.room.name
					},
					"attendees": m.interviewers.map(i => ({
						"emailAddress": {
							"address": i.email,
							"name": `${i.firstName} ${i.lastName}`
						},
						"type": "required"
					})).concat([{
						"emailAddress": {
							"address": m.room.email,
							"name": m.room.name
						},
						"type": "required"
					}])
				})
				.then(e => ({...m, id: e.id}));
		});
		schedule.meetings = await Promise.all(promises);
		return schedule;
	}
	
	static async deleteSchedule(token: string, events: string[]) {
		const client: Client = this.getClient(token);
    	return Promise.all(events.map(e => {
			return client
				.api(`/me/events/${e}`)
				.delete();
		}))
	}

    /**
     * Returns the request object for getSchedulesAPI.
     * @param {[string]} request - The emails of the users.
     * @param {start: string, end: string} timeslot - Object of start and end dates.
     * @param {number} availabilityViewInterval - Interval to get the schedules on. DEFAULT = 15
     * @returns The request for getting a schedule.
     */
	private static scheduleRequest(request: Array<string>, timeslot: {start: string, end: string}, availabilityViewInterval: number = 15) {
    	return {
			schedules: request,
			startTime: {
				dateTime: timeslot.start,
				timeZone: 'Pacific Standard Time'
			},
			endTime: {
				dateTime: timeslot.end,
				timeZone: 'Pacific Standard Time'
			},
			availabilityViewInterval
		}
	}

    /**
     * Helper function for building the dates from a schedule
     * @param {Date} startDate - The date to create a range
     * @param {Offset} offset - The offset of each time slot(end - start). DEFAULT = 15
     */
	private static buildDate(startDate: Date, offset: number = 15) {
		startDate.setMinutes(startDate.getMinutes() + offset);
		return startDate.toISOString();
	}

    /**
     * Sends an email through outlook
     * @param {string} token - The token needed for request
     * @param content - Content to send email with.
     * @returns {Promise<string>} if sending an email succeeded.
     * @see https://docs.microsoft.com/en-us/graph/api/user-sendmail?view=graph-rest-1.0&tabs=javascript
     */
	static async sendEmail(token: string, content: any): Promise<string> {
        return (await (this.getClient(token))
            .api(Config.getInstance().get(ConfigKey.msEmailEndpoint))
            .post(content));
    }
}

