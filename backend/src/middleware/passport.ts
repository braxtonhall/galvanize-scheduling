require('dotenv').config();
const passport = require('passport');
const OIDCStrategy = require('passport-azure-ad').OIDCStrategy;
import MSGraphController from "../controllers/MSGraphController";

import {app} from "../index";

// TODO: change to db storage
let users = {};

passport.serializeUser((user, done) => {
    // TODO: save to db
    console.log(1)
    users[user.profile.oid] = user;
    done(null, user.profile.oid);
});

passport.deserializeUser((id, done) => {
    // TODO: remove from db
    console.log(2)
    done(null, users[id]);
});


// use simple oauth2
const oauth2 = require('simple-oauth2').create({
    client: {
        id: process.env.OAUTH_APP_ID,
        secret: process.env.OAUTH_APP_PASSWORD
    },
    auth: {
        tokenHost: process.env.OAUTH_AUTHORITY,
        authorizePath: process.env.OAUTH_AUTHORIZE_ENDPOINT,
        tokenPath: process.env.OAUTH_TOKEN_ENDPOINT
    }
});

const signInComplete = async (iss, sub, profile, accessToken, refreshToken, params, done) => {
    if (!profile.oid) {
        return done(new Error("No user found"));
    }

    try {
        const client = MSGraphController.getClient(accessToken);
        const user = await client.api('/me').get();
        console.log(user);
    } catch(e) {
        done(e, null);
    }

    // this expires about every 30 min. Use getAccessToken to recreate token
    let oauthToken = oauth2.accessToken.create(params);

    // Save access token
    // TODO: change to db
    users[profile.oid] = {profile, oauthToken};
    return done(null, users[profile.oid]);
};

// Configure OIDC strategy
passport.use(new OIDCStrategy(
    {
        identityMetadata: `${process.env.OAUTH_AUTHORITY}${process.env.OAUTH_ID_METADATA}`,
        clientID: process.env.OAUTH_APP_ID,
        responseType: 'code id_token',
        responseMode: 'form_post',
        redirectUrl: process.env.OAUTH_REDIRECT_URI,
        allowHttpForRedirectUrl: true,
        clientSecret: process.env.OAUTH_APP_PASSWORD,
        validateIssuer: false,
        passReqToCallback: false,
        scope: process.env.OAUTH_SCOPES.split(' ')
    },
    signInComplete
));

app.use(passport.initialize());
app.use(passport.session());