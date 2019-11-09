import {Client} from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch';
import {interfaces} from "adapter";
import {Config, ConfigKey} from "../Config";

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

    static async getRooms(token: string): Promise<Array<interfaces.IRoom & {email: string, capacity: number}>> {
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
            .select('id,givenName,surname,emailAddress')
            .get()).value
            .map((m) => ({
                id: m.id,
                firstName: m.givenName,
                lastName: m.surname,
                email: m.emailAddress
            }));
    }

    public static async getMeetingTimes(
    	token:string,
		rooms: Array<interfaces.IRoom & {email: string, capacity: number}>,
		options: interfaces.IGetSchedulesOptions
	): Promise<any> {
    	rooms.sort((a, b) => a.capacity - b.capacity);
    	const {candidate, preferences} = options;
    	const groups = this.buildGroups(preferences);
    	const suggestions = [];
    	const client = this.getClient(token);
    	for (const room of rooms) {
			if (room.capacity < 2) {
				continue;
			}
			const promises = [];
			for (const group of groups) {
				promises.push(client
					.api('/me/findMeetingTimes')
					.post(this.buildMeeting(room, group, candidate)));
			}
			const results = await Promise.all(promises);
		}
    	
	}
	
	private static buildMeeting(room, group: any[], candidate): any {
    	return {
    		attendees: [
				{
					type: "resource",
					emailAddress: {
						name: room.name,
						address: room.email,
					},
				},
			].concat(group
				.map((p) => ({
					type: "required",
					emailAddress: {
						name: `${p.interviewer.firstName} ${p.interviewer.lastName}`,
						address: p.interviewer.email
					}}))),
			timeConstraints: {
    			activityDomain: "work",
				timeslots: candidate.availability.map((a) => ({
					start: {
						dateTime: a.start,
						timeZone: "Pacific Standard Time"
					},
					end: {
						dateTime: a.end,
						timeZone: "Pacific Standard Time"
					},
				})),
			},
			isOrganizerOptional: true,
			meetingDuration: `PTH${Math.floor(group[0].minutes / 60)}M${group[0].minutes % 60}`,
			returnSuggestionReasons: false,
			minimumAttendeePercentage: 1 / group.length
		};
	}
	
	private static buildGroups(preferences: Array<{interviewer: interfaces.IInterviewer, preference?: interfaces.IInterviewer, minutes: number}>)
		: Array<Array<{interviewer: interfaces.IInterviewer, preference?: interfaces.IInterviewer, minutes: number}>> {
    	const groups = [];
		for (const preference of preferences) {
			let found = false;
			for (const group of groups) {
				if (preference.interviewer.id in group.members && preference.preference) {
					group.members.add(preference.preference.id);
					group.data.push(preference);
					found = true;
					break;
				} else if (preference.preference && preference.preference.id in group.members) {
					group.members.add(preference.interviewer.id);
					group.data.push(preference);
					found = true;
					break;
				}
			}
			if (!found) {
				const set = new Set(preference.interviewer.id);
				if (preference) {
					set.add(preference.preference.id);
				}
				groups.push({members: set, data: [preference]});
			}
		}
		return groups;
	}

	static async sendAvailabilityEmail(token: string, content: any): Promise<any> {
        return (await (this.getClient(token))
            .api("/me/sendMail")
            .post(content));
    }
}
