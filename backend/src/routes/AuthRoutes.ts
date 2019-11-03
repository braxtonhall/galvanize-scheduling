import {app} from "../index";
import {nodeAdapter} from "adapter/dist";

import AuthController from '../controllers/AuthController';
import {Config, ConfigKey} from "../Config";
import MSGraphController from "../controllers/MSGraphController";

const config: Config = Config.getInstance();

app.get(nodeAdapter.urls.LOGIN, (req, res) => {
    const query = {
        client_id: config.get(ConfigKey.msOAuthAppId),
        response_type: "code",
        redirect_uri: config.get(ConfigKey.msOAuthRedirectURI),
        response_mode: "form_post",
        scope: config.get(ConfigKey.msOAuthScopes),
    };

    res.redirect(MSGraphController.buildRequest(query));

});

app.post('/callback', async (req, res) => {
    const {code} = req.body;

    const query = {
        client_id: config.get(ConfigKey.msOAuthAppId),
        code: code,
        redirect_uri: config.get(ConfigKey.msOAuthRedirectURI),
        grant_type: "authorization_code",
        scope: config.get(ConfigKey.msOAuthScopes),
        client_secret: config.get(ConfigKey.msOAuthAppPassword)
    };

    try {
        let body = encodeURI(Object.entries(query).map(([k, v]) => `${k}=${v}`).join("&"));

        let response = await fetch(config.get(ConfigKey.msOAuthAuthority) + config.get(ConfigKey.msOAuthTokenEndpoint), {
            method: 'post',
            body,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        response = await response.json();
        await new AuthController().saveAuth(response['access_token']);
        res.redirect(config.get(ConfigKey.frontendUrl) + `/auth/${response['access_token']}`);
    } catch (e) {
        res.redirect(config.get(ConfigKey.frontendUrl));
    }

});

app.post(nodeAdapter.urls.AUTHENTICATE, async (req, res) => {
    const {token} = req.body;
    const result = await new AuthController().checkAuth(token);
    res.send(result);
});

app.get(nodeAdapter.urls.LOGOUT, async (req, res) => {
    const {token} = req.body;
    const result = await new AuthController().removeAuth(token);
    res.sendStatus(200);
});
