import IAPIResponse from "../IAPIResponse";
import {fullURLs} from "./urls";
import axios from "axios";

async function logout(): Promise<IAPIResponse> {
    try {
        return {success: false}
    } catch {
        return {success: false}
    }
}

async function checkToken(token: string): Promise<IAPIResponse<boolean>> {
    try {
        const {status, data} = await axios.post(fullURLs.AUTHENTICATE, {token});
        return {success: status === 200, data}
    } catch {
        return {success: false};
    }
}

function loginRedirectURL(): string {
    return fullURLs.LOGIN;
}

export {logout, checkToken, loginRedirectURL};
