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
    
    static async getMeetingTimes(
    	token: string,
		rooms: Array<interfaces.IRoom & {email: string, capacity: number}>,
		options: interfaces.IGetSchedulesOptions
	): Promise<any> {
	}

	static async sendAvailabilityEmail(token: string, content: any): Promise<any> {
        return (await (this.getClient(token))
            .api("/me/sendMail")
            .post(content));
    }
}
