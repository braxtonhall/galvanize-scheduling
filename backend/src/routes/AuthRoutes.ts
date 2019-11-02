import {app} from "../index";

const passport = require('passport');
import {nodeAdapter} from "adapter/dist";

import AuthController from '../controllers/AuthController';
const ac = new AuthController();

// TODO: Change all localhost to env variables
app.get(nodeAdapter.urls.LOGIN,
    (req, res, next) => {
        passport.authenticate('azuread-openidconnect', {
            response: res,
            prompt: 'login',
            failureRedirect: 'http://localhost:3000/'
        })(req, res, next)
    },
    (req, res) => {
        res.redirect('http://localhost:3000/candidates');
    });

app.post('/callback',
    (req, res, next) => {
        passport.authenticate('azuread-openidconnect',
            {
                response: res,
                failureRedirect: 'http://localhost:3000/'
            }
        )(req, res, next)
    },
    (req, res) => {
        console.log(req.user);
        res.redirect('http://localhost:3000/candidates');
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
    res.redirect('http://localhost:3000/')
});
