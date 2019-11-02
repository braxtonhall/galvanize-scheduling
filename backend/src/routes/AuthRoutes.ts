import {app} from "../index";
import {nodeAdapter} from "adapter/dist";

import AuthController from '../controllers/AuthController';
import {Config, ConfigKey} from "../Config";

const passport = require('passport');
const ac = new AuthController();

const config: Config = Config.getInstance();

app.get(nodeAdapter.urls.LOGIN,
    (req, res, next) => {
        passport.authenticate('azuread-openidconnect', {
            response: res,
            prompt: 'login',
            failureRedirect: config.get(ConfigKey.frontendUrl)
        })(req, res, next)
    },
    (req, res) => {
        res.redirect(`${config.get(ConfigKey.frontendUrl)}/candidates`);
    });

app.post('/callback',
    (req, res, next) => {
        passport.authenticate('azuread-openidconnect',
            {
                response: res,
                failureRedirect: config.get(ConfigKey.frontendUrl)
            }
        )(req, res, next)
    },
    (req, res) => {
        console.log(req.user);
        res.redirect(`${config.get(ConfigKey.frontendUrl)}/candidates`);
    });

app.get(nodeAdapter.urls.AUTHENTICATE, (req, res) => {
    if (ac.checkAuth(req)) {
        res.status(200).send(true);
    } else {
        res.status(403).send(false);
    }
});

app.get(nodeAdapter.urls.LOGOUT, async (req, res) => {
    await req.session.destroy((e : Error | undefined) => {
        if (e) {
            console.log(e);
        }
    });
    res.redirect(config.get(ConfigKey.frontendUrl))
});
