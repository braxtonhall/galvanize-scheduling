import IAPIAdapter from "../IAPIAdapter";
import {urls, fullURLs} from "./urls";
import health from "./health";
import {checkToken, loginRedirectURL, logout} from "./auth";
import admin from "./admin";
import candidate from "./candidate";

const adapter: IAPIAdapter = {
	checkToken,
	logout,
	loginRedirectURL,
	...admin,
	...candidate,
	health,
	urls,
	fullURLs,
};

export default adapter;