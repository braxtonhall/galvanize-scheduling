import {Client} from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch';
import {interfaces} from "adapter";
import {Config, ConfigKey} from "../Config";
import {clipNonWorkingHours, concatenateMoments} from "./SchedulerUtils";
import {IScheduleAvailabilities, Preference} from "./Common";

export default class MSGraphController {
    private static getClient(token: string): Client {
        return Client.init({
            authProvider: (done) => {
                done(null, token);
            }
        });
    }

    static buildRequest(query: {[key: string]: any}): string {
    	const cf: Config = Config.getInstance();
        const url = cf.get(ConfigKey.msOAuthAuthority) + cf.get(ConfigKey.msOAuthAuthorizeEndpoint) + "?";
        return url + encodeURI(Object.entries(query).map(([k, v]) => `${k}=${v}`).join("&"));
    }

    static async getGroups(token: string): Promise<any> {
        return  await (this.getClient(token))
            .api('/groups')
            .select('id, displayName')
            .get();
    }

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

	static async getSchedule(token: string, request) {
		return (await (this.getClient(token))
			.api('/me/calendar/getSchedule')
			.post(request)).value;
	}

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
    		console.log(e);
    		throw new Error(e);
		}
	}
	
	static async bookSchedule(token: string, schedule: interfaces.ISchedule): Promise<string[]> {
    	const client: Client = this.getClient(token);
    	const promises = schedule.meetings.map(m => {
			return client
				.api(`/me/events`)
				.post({
					"subject": `Interview with ${schedule.candidate.firstName ? schedule.candidate.firstName : schedule.candidate.email}`,
					"body": {
						"contentType": "HTML",
						"content": `Be ready to join ${schedule.candidate.firstName} in an interview for ${schedule.candidate.position ? schedule.candidate.position : "Galvanize"}.`
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
				.then(e => e.id);
		});
    	return Promise.all(promises);
	}
	
	static async deleteSchedule(token: string, events: string[]) {
		const client: Client = this.getClient(token);
    	return Promise.all(events.map(e => {
			return client
				.api(`/me/events/${e}`)
				.delete();
		}))
	}

	static scheduleRequest(request: Array<string>, timeslot: {start: string, end: string}, availabilityViewInterval: number = 15) {
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

	static buildDate(startDate: Date, offset: number = 15) {
		startDate.setMinutes(startDate.getMinutes() + offset);
		return startDate.toISOString();
	}

	static async sendEmail(token: string, content: any): Promise<string> {
        return (await (this.getClient(token))
            .api(Config.getInstance().get(ConfigKey.msEmailEndpoint))
            .post(content));
    }
}

