import axios from 'axios';
import * as dotenv from 'dotenv';
import {Moment} from "moment";
import moment = require("moment");
dotenv.config({path: "../.env"});

const generateMsToken = async () => {
    const pe = process.env;
    const url = pe.OAUTH_HOST + pe.TENANT_ID + pe.OAUTH_TOKEN_ENDPOINT;
    const params = new URLSearchParams();
    params.append('client_id', pe.OAUTH_APP_ID);
    params.append('scope', pe.PERMISSIONS_SCOPE);
    params.append('client_secret', pe.OAUTH_APP_PASSWORD);
    params.append('grant_type', pe.GRANT_TYPE);

    let status, data;
    try {
        ({status, data} = await axios.post(url, params, {
            headers: {'content-type': 'application/x-www-form-urlencoded'}
        }));
    } catch (error) {
        const res = error.response;
        console.error(`MS Response ${res.status}: ${res.statusText}`);
        console.error(res.data);
    }

    if (status === 200 && data.access_token) {
        return data.access_token;
    }
    throw new Error("Failed to generate application token.");
};

const createTestToken = async () => {
    const testSecretKey = process.env.TEST_SECRET_KEY;
    const msToken = await generateMsToken();
    try {
        await axios.post(
            "http://localhost:8080/saveauth",
            {"token": msToken},
            {headers: {"token": testSecretKey, "Content-Type": "application/json"}}
        );
        return msToken;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            throw new Error("Secret does not match backend configuration.");
        }
        console.error(error.response);
        throw new Error("Failed to save app token.");
    }
};

const momentThisWeek = (d: number, h: number, m: number): Moment =>
    moment().day(d).hour(h).minute(m).seconds(0).milliseconds(0);

const configGroupName = process.env.INTERVIEWER_GROUP_NAME;

export {createTestToken, momentThisWeek, configGroupName};
