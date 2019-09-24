import IAPIAdapter from "../IAPIAdapter";
import placeholderAdapter from "../placeholder_adapter";
import {urls, fullURLs} from "./urls";
import health from "./health";

const adapter: IAPIAdapter = {
	health,
	urls,
	fullURLs,
};

export default adapter;