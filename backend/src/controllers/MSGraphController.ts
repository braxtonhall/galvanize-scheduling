import {Client} from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch';
import {interfaces} from "adapter";
import {Config, ConfigKey} from "../Config";

const config: Config = Config.getInstance();

export default class MSGraphController {

    private static getClient(token: string): Client {
        return Client.init({
            authProvider: (done) => {
                done(null, token);
            }
        });
    }

    static buildRequest(query) {
        let url = config.get(ConfigKey.msOAuthAuthority) + config.get(ConfigKey.msOAuthAuthorizeEndpoint) + "?";

        return url + encodeURI(Object.entries(query).map(([k, v]) => `${k}=${v}`).join("&"));
    }

    static async getGroups(token: string): Promise<any> {
        return  await (this.getClient(token))
            .api('/groups')
            .select('id, displayName')
            .get();
    }
    
    static async getRooms(token: string): Promise<interfaces.IRoom[]> {
		return (await (this.getClient(token)).api('/me/findRooms')
			.version('beta')
			.get())
			.value
			.map((room) => ({
				id: room.name,
				name: room.name
			}));
	}

    static async getInterviewers(token: string, id: string): Promise<interfaces.IInterviewer[]> {
        return (await (this.getClient(token))
            .api(`/groups/${id}/members`)
            .select('id,givenName,surname')
            .get()).value
            .map((m) => ({
                id: m.id,
                firstName: m.givenName,
                lastName: m.surname
            }));
    }
}
