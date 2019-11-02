import {Client} from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch';
import {interfaces} from "adapter";
import {Config, ConfigKey} from "../Config";

const config: Config = Config.getInstance();

export default class MSGraphController {

    static getClient(token: string): Client {
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

    static async getGroups(client): Promise<any> {
        return  await client
            .api('/groups')
            .select('id, displayName')
            .get();
    }

    static async getInterviewers(client, id): Promise<interfaces.IInterviewer[]> {
        return (await client
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
