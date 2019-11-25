import "mocha";
import {expect} from "chai";
import {v4 as generateUUID} from "uuid";

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
            const {success, data} = await adapter.getInterviewers(that.token, that.groupName);
            expect(success).to.be.true;
            expect(data).to.not.be.empty;
            const interviewer = data[0];
            expect(interviewer.id).to.not.be.empty;
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
                const perryData = data.find(i => i.email === perry.email);
                expect(perryData).to.exist.and.contain(perry);
            });
        }
    });

    context("toggleEligibility", () =>{
        const mockRoom = (name = "Integration Test Room", eligible?, id?) => ({id, name, eligible});

        it("should fail on invalid authentication", async () => {
            const {success} = await adapter.toggleEligibility(that.INVALID_TOKEN, mockRoom());
            expect(success).to.be.false;
        });

        it("should fail on bad room input", async () => {
            const {success: s1} = await adapter.toggleEligibility(that.token, undefined);
            expect(s1).to.be.false;
            const {success: s2} = await adapter.toggleEligibility(that.token, null);
            expect(s2).to.be.false;
        });

        it("should fail if given no eligibility", async () => {
            const {success} = await adapter.toggleEligibility(that.token, mockRoom());
            expect(success).to.be.false;
        });

        it("should succeed when toggling any room from either eligibility", async () => {
            const fakeRoom = mockRoom("Aperture Science Test Chambers 002", true, generateUUID());
            const {success: s1} = await adapter.toggleEligibility(that.token, fakeRoom);
            expect(s1).to.be.true;

            // NOTE: Nov.24 2019 -  This test was removed as we now ensure in Graph to save
            // const fakeRoom2 = mockRoom("Aperture Science Test Chambers 001", false);
            // const {success: s2} = await adapter.toggleEligibility(that.token, fakeRoom2);
            // expect(s2).to.be.true;
        });

        if (that.verifyTestAccounts) {
            it("should match on name and not id", async () => {
                // toggle both to false if they are already true
                const r2 = mockRoom("Interview Room 2", true, "Interview Room 2");
                const r3 = mockRoom("Interview Room 3", true, "Interview Room 3");
                await adapter.toggleEligibility(that.token, r2);
                await adapter.toggleEligibility(that.token, r3);

                const roomWithBadId = mockRoom("Interview Room 3", false, "Interview Room 2");
                const {success} = await adapter.toggleEligibility(that.token, roomWithBadId);
                const {data} = await adapter.getRooms(that.token);
                expect(success).to.be.true;
                expect(data.find(r => r.name === r3.name)).to.deep.include(r3);
                expect(data.find(r => r.name === r2.name)).to.not.deep.include(r2);
            });
        }
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
            const testRoom: IRoom = {
                id: "Interview Room 1",
                name: "Interview Room 1",
                eligible: false
            };

           it("should contain test room", async () => {
               const {success, data} = await adapter.getRooms(that.token);
               expect(success).to.be.true;
               const roomData = data.find(r => r.id === testRoom.id);
               expect(roomData).to.exist;
               expect(roomData).to.have.property('name', testRoom.name);
           });

           it("should contain test room with correct eligibility after toggling", async () => {
               const {success: toggled} = await adapter.toggleEligibility(that.token, testRoom);
               expect(toggled).to.be.true;
               const {success, data} = await adapter.getRooms(that.token);
               expect(success).to.be.true;
               expect(data).to.not.deep.include(testRoom);
               testRoom.eligible = !testRoom.eligible;
               expect(data.find(r => r.name === testRoom.id)).to.deep.include(testRoom);
           });
        }
    });

};

export default AdminTests;