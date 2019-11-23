import IAPIResponse from "../IAPIResponse";
import {fullURLs} from "./urls";
import axios from "axios";
import {ICandidate, IGetSchedulesOptions, IInterviewer, IRoom, ISchedule} from "../interfaces";
import CandidateOps from "./candidate"

export default {
    getCandidates: async(token: string) : Promise<IAPIResponse<ICandidate[]>> => {
        try {
            const {status, data} = await axios.get(fullURLs.CANDIDATES, {headers: {token, "Content-Type": "application/json"}});
            return {success: status === 200, data};
        } catch {
            return {success: false}
        }
    },
    createCandidate: async(token: string, candidate: ICandidate) : Promise<IAPIResponse<ICandidate>> => {
        if (!candidate || typeof candidate.id === "string") {
            return {success: false};
        }
        try {
            const {status, data} = await axios.post(fullURLs.CANDIDATE, {data: candidate}, {headers: {token, "Content-Type": "application/json"}});
            return {success: status === 200, data};
        } catch {
            return {success: false}
        }
    },
    deleteCandidate: async(token: string, candidate: ICandidate) : Promise<IAPIResponse> => {
        try {
            const {status} = await axios.delete(fullURLs.CANDIDATE, {data: {id: candidate.id}, headers: {token, "Content-Type": "application/json"}});
            return {success: status === 200};
        } catch (e) {
            return {success: false}
        }
    },
    updateCandidate: async(token: string, candidate: ICandidate) : Promise<IAPIResponse> => {
        const candidateExists = candidate && (await CandidateOps.getCandidateByID(candidate.id)).success;
        if (!candidateExists) {
            return {success: false};
        }
        try {
            const {status, data} = await axios.post(fullURLs.CANDIDATE, {data: candidate}, {headers: {token, "Content-Type": "application/json"}});
            return {success: status === 200, data};
        } catch {
            return {success: false};
        }
    },
    getInterviewers: async(token: string, groupName: string) : Promise<IAPIResponse<IInterviewer[]>> => {
        try {
            const {status, data} = await axios.get(fullURLs.INTERVIEWERS, {headers: {token, "Content-Type": "application/json"}, params: {groupName}});
            return {success: status === 200, data};
        } catch {
            return {success: false};
        }
    },
    getRooms: async(token: string) : Promise<IAPIResponse<IRoom[]>> => {
        try {
            const {status, data} = await axios.get(fullURLs.ROOMS, {headers: {token, "Content-Type": "application/json"}});
            return {success: status === 200, data};
        } catch {
            return {success: false};
        }
    },
    toggleEligibility: async(token: string, room: IRoom) : Promise<IAPIResponse> => {
        if (!room || room.eligible === undefined) {
            return {success: false, error: "Incomplete room object supplied. Field `eligible` required."};
        }
        try {
            if (room.eligible) {
                const {status} = await axios.delete(fullURLs.ROOM, {data: room, headers: {token, "Content-Type": "application/json"}});
                return {success: status === 200};
            } else {
                const {status, data} = await axios.post(fullURLs.ROOM, {data: room}, {headers: {token, "Content-Type": "application/json"}});
                return {success: status === 200, data};
            }
        } catch {
            return {success: false};
        }
    },
    getSchedules: async(token: string, options: IGetSchedulesOptions) : Promise<IAPIResponse<ISchedule[]>> => {
        try {
            const {status, data} = await axios.get(fullURLs.SCHEDULES, {headers: {token, "Content-Type": "application/json"}, params: options});
            return {success: status === 200, data};
        } catch {
            return {success: false};
        }
    },
    confirmSchedule: async(token: string, schedule: ISchedule): Promise<IAPIResponse> => {
        try {
            const {status, data} = await axios.post(fullURLs.SCHEDULE, {data: schedule}, {headers: {token, "Content-Type": "application/json"}});
            return {success: status === 200, data};
        } catch {
            return {success: false}
        }
    },
}