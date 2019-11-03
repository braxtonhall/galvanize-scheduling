import IAPIAdapter from "../IAPIAdapter";
import placeholderAdapter from "../placeholder_adapter";
import {urls, fullURLs} from "./urls";
import health from "./health";
import {checkToken, loginRedirectURL, logout} from "./auth";
import admin from "./admin";

const adapter: IAPIAdapter = {
	...placeholderAdapter,
	checkToken,
	logout,
	loginRedirectURL,
	...admin,
	health,
	urls,
	fullURLs,
};

export default adapter;