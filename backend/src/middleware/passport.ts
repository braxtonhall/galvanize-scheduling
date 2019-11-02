import {Config, ConfigKey} from "../Config";
import MSGraphController from "../controllers/MSGraphController";

import {app} from "../index";

require('dotenv').config();
const passport = require('passport');
const OIDCStrategy = require('passport-azure-ad').OIDCStrategy;

const config: Config = Config.getInstance();

// TODO: change to db storage
let users = {};

passport.serializeUser((user, done) => {
    // TODO: save to db
    console.log(1);
    users[user.profile.oid] = user;
    done(null, user.profile.oid);
});

passport.deserializeUser((id, done) => {
    // TODO: remove from db
    console.log(2);
    done(null, users[id]);
});


// use simple oauth2
const oauth2 = require('simple-oauth2').create({
    client: {
        id: config.get(ConfigKey.msOAuthAppId), // process.env.OAUTH_APP_ID,
        secret: config.get(ConfigKey.msOAuthAppPassword), // process.env.OAUTH_APP_PASSWORD
    },
    auth: {
        tokenHost: config.get(ConfigKey.msOAuthAuthority), // process.env.OAUTH_AUTHORITY,
        authorizePath: config.get(ConfigKey.msOAuthAuthorizeEndpoint), // process.env.OAUTH_AUTHORIZE_ENDPOINT,
        tokenPath: config.get(ConfigKey.msOAuthTokenEndpoint), // process.env.OAUTH_TOKEN_ENDPOINT
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
        // identityMetadata: `${process.env.OAUTH_AUTHORITY}${process.env.OAUTH_ID_METADATA}`,
        identityMetadata: `${config.get(ConfigKey.msOAuthAuthority)}${config.get(ConfigKey.msOAuthMetaData)}`,
        clientID: config.get(ConfigKey.msOAuthAppId), // process.env.OAUTH_APP_ID,
        responseType: 'code id_token',
        responseMode: 'form_post',
        redirectUrl: config.get(ConfigKey.msOAuthRedirectURI), // process.env.OAUTH_REDIRECT_URI,
        allowHttpForRedirectUrl: true,
        clientSecret: config.get(ConfigKey.msOAuthAppPassword), // process.env.OAUTH_APP_PASSWORD,
        validateIssuer: false,
        passReqToCallback: false,
        scope: config.get(ConfigKey.msOAuthScopes).split(' '), // process.env.OAUTH_SCOPES.split(' ')
    },
    signInComplete
));

app.use(passport.initialize());
app.use(passport.session());