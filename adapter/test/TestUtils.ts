import axios from 'axios';
import {v4 as generateUUID} from 'uuid';
import * as dotenv from 'dotenv';
dotenv.config({path: "../.env"});

const createTestToken = async () => {
    const testSecretKey = process.env.TEST_SECRET_KEY;
    const msToken = generateUUID();
    const { status } = await axios.post(
        "http://localhost:8080/saveauth",
        {"token": msToken},
        {headers: {"token": testSecretKey, "Content-Type": "application/json"}}
        );
    if (status === 200) {
        return msToken;
    } else if (status === 401) {
        throw "Secret does not match backend configuration.";
    } else {
        throw "Failed to save test token.";
    }
};

export {createTestToken};
