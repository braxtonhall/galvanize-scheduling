import {Client} from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch';
import {interfaces} from "adapter";

export default class MSGraphController {
    static getClient(token: string): Client {
        return Client.init({
            authProvider: (done) => {
                done(null, token);
            }
        });
    }

    static async getAccessToken(req) {
        if (req.user) {
            const storedToken = req.user.oauthToken;

            if (storedToken) {
                if (storedToken.expired()) {
                    const newToken = await storedToken.refresh();

                    req.user.oauthToken = newToken;
                    return newToken.token.access_token;
                }

                return storedToken.token.access_token;
            }

        }
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
