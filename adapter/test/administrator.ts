import adapter from "./adapter";
import {expect} from 'chai';
import {interfaces} from "../dist/";

import authTests from "./authentication";
import scheduleTests from "./schedule";
import manageCandidatesTest from "./manageCandidate";


describe("Test Administrator actions", () => {
    describe("Auth related", authTests);

    describe("Schedule related actions", scheduleTests);

    describe("Candidate related actions", manageCandidatesTest);

});
