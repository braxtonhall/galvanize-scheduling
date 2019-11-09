import * as dotenv from 'dotenv';
dotenv.config({path: "../.env"});

const testSecretKey = process.env.TEST_SECRET_KEY;

const createTestToken = () => {
    // TODO: use headless chrome or something to authenticate
    return "";
};

const deauthTestToken = (token: string) => {
    // TODO: logout
};

export {createTestToken, deauthTestToken};
