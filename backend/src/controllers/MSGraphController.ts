import {Client} from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch';

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
}
