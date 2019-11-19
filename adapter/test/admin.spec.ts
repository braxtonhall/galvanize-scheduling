import "mocha";
import {expect} from "chai";

import adapter from "../src/node_adapter";
import {IInterviewer, IRoom} from "../src/interfaces";

const AdminTests = args => () => {
    const that = args;

    context("getInterviewers", () => {
        it("should fail on invalid authentication", async () => {
            const {success} = await adapter.getInterviewers(that.INVALID_TOKEN, that.groupName);
            expect(success).to.be.false;
        });

        it("should return empty on empty group name", async () => {
            const {success, data} = await adapter.getInterviewers(that.token, "");
            expect(success).to.be.true;
            expect(data).to.be.empty;
        });

        it ("should return empty if group does not exist", async () => {
            const {success, data} = await adapter.getInterviewers(that.token, "integrationtest!@#$");
            expect(success).to.be.true;
            expect(data).to.be.empty;
        });

        it("should return an array of interviewers on success", async () => {
            // TODO: bug, returned data does not have email yet has extra id key, need to update interface
            const {success, data} = await adapter.getInterviewers(that.token, that.groupName);
            expect(success).to.be.true;
            expect(data).to.not.be.empty;
            const interviewer = data[0];
            expect(interviewer.email).to.not.be.empty;
            expect(interviewer).ownProperty('firstName');
            expect(interviewer).ownProperty('lastName');
        });

        if (that.verifyTestAccounts) {
            it("should contain test interviewer", async () => {
                const perry: IInterviewer = {
                    email: "perry@ph14solutions.onmicrosoft.com",
                    firstName: "Perry",
                    lastName: "Liao"
                };
                const {success, data} = await adapter.getInterviewers(that.token, that.groupName);
                expect(success).to.be.true;
                expect(data).to.be.an('array');
                expect(data).to.deep.include(perry);
            });
        }
    });

    context("getSchedules", () => {

    });

    context("toggleEligibility", () =>{
        const mockRoom = (name = "Integration Test Room", eligible?) => ({name, eligible});

        it("should fail on invalid authentication", async () => {
            const {success} = await adapter.toggleEligibility(that.INVALID_TOKEN, mockRoom());
            expect(success).to.be.false;
        });

        it("should fail if given no eligibility", async () => {
            const {success} = await adapter.toggleEligibility(that.token, mockRoom());
            expect(success).to.be.false;
        });
/*
        it("should succeed when toggling any room", async () => {
            // TODO: id is not in the interface, but required to use this function

            const fakeRoom = mockRoom("Aperture Science Test Chambers 002", true);
            const {success: s1, data: d1} = await adapter.toggleEligibility(that.token, fakeRoom);
            expect(s1).to.be.true;

            const fakeRoom2 = mockRoom("Aperture Science Test Chambers 001", false);
            const {success: s2, data: d2} = await adapter.toggleEligibility(that.token, fakeRoom2);
            expect(s2).to.be.true;

        });
*/
        it("should succeed when setting rooms true to false", async () => {

        });

        it("should succeed when setting false rooms to true", async () => {

        });

        it("should succeed when setting an existing status", async () => {

        });
    });

    context("getRooms", () => {
        it("should fail on invalid authentication", async () => {
            const {success} = await adapter.getRooms(that.INVALID_TOKEN);
            expect(success).to.be.false;
        });

        it("should fetch a list of rooms and their eligibilities", async () => {
            const {success, data} = await adapter.getRooms(that.token);
            expect(success).to.be.true;
            expect(data).to.not.be.empty;
            const room = data[0];
            expect(room.name).to.not.be.empty;
        });

        if (that.verifyTestAccounts) {
           it("should contain test room", async () => {
                const testRoom: IRoom = {
                    name: "Interview Room 1",
                    eligible: false
                };
               const {success, data} = await adapter.getRooms(that.token);
               expect(success).to.be.true;
               expect(data).to.deep.include(testRoom);
           });
        }
    });

};

export default AdminTests;