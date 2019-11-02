import IAPIResponse from "../IAPIResponse";
import {fullURLs} from "./urls";

export function loginRedirectURL(): string {
    return fullURLs.LOGIN;
}

export async function logout(): Promise<IAPIResponse> {
    try {
        return {success: false}
    } catch {
        return {success: false}
    }
}
