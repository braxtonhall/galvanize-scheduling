import {Client} from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch';
import {interfaces} from "adapter";
import {Config, ConfigKey} from "../Config";
import {IScheduleAvailabilities, concatenateMoments} from "./SchedulerUtils";

export default class MSGraphController {
	private static readonly HOUR_REGEX = /(?<=T)[0-9]{2}(?=:)/;
	private static readonly MINUTE_REGEX = /(?<=:)[0-9]{2}(?=:)/;

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
		interviewers: Array<interfaces.IInterviewer>
	): Promise<IScheduleAvailabilities> {
    	try {
    		let email_type = {};
			let availability_map = new Map<string, interfaces.IAvailability>();
			const request_array = rooms.map(r => {
				email_type[r.email] = 'room';
				availability_map.set(r.email, []);
				return r.email;
			}).concat(interviewers.map(i => {
				email_type[i.email] = 'interviewer';
				availability_map.set(i.email, []);
				return i.email;
			}));


			for (let timeslot of candidate.availability) {
				const availabilities = await this.getSchedule(token, this.scheduleRequest(
					request_array,
					// @ts-ignore
					timeslot
				));

				for (let availability of availabilities) {
					let date = new Date(timeslot.start.toString());

					for (let i = 0; i < availability.availabilityView.length; i++) {
						let time: interfaces.IAvailability = {
							// @ts-ignore
							start: this.buildDate(date, 0),
							end: this.buildDate(date)
						};
						if (availability.availabilityView.charAt(i) === '0') {
							availability_map.set(
								availability.scheduleId,
								// @ts-ignore
								[...availability_map.get(availability.scheduleId), time]
							);
						}
					}
				}
			}

			let scheduleAvailabilities: IScheduleAvailabilities = {
				rooms: [],
				interviewers: []
			};

			for (let email of request_array) {
				scheduleAvailabilities[`${email_type[email]}s`] = [...scheduleAvailabilities[`${email_type[email]}s`], {
					[email_type[email]]: email,
					availability: concatenateMoments(availability_map.get(email))
				}]
			}

			
			return scheduleAvailabilities;

		} catch(e) {
    		console.log(e);
    		throw new Error(e);
		}
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

	static async sendAvailabilityEmail(token: string, content: any): Promise<any> {
        return (await (this.getClient(token))
            .api("/me/sendMail")
            .post(content));
    }
}
