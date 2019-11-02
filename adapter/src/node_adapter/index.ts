import IAPIAdapter from "../IAPIAdapter";
import placeholderAdapter from "../placeholder_adapter";
import {urls, fullURLs} from "./urls";
import health from "./health";
import {loginRedirectURL, logout} from "./auth";
import admin from "./admin";

const adapter: IAPIAdapter = {
	...placeholderAdapter,
	loginRedirectURL,
	logout,
	...admin,
	health,
	urls,
	fullURLs,
};

export default adapter;