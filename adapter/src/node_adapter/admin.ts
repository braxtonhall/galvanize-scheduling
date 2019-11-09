import IAPIResponse from "../IAPIResponse";
import {fullURLs} from "./urls";
import axios from "axios";
import {ICandidate, IInterviewer, IRoom} from "../interfaces";

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
        if (typeof candidate.id === "string") {
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
            const {status, data} = await axios.delete(fullURLs.CANDIDATE, {data: {id: candidate.id}, headers: {token, "Content-Type": "application/json"}});
            return {success: status === 200};
        } catch (e) {
            return {success: false}
        }
    },
    updateCandidate: async(token: string, candidate: ICandidate) : Promise<IAPIResponse> => {
        if (typeof candidate.id !== "string") {
            return {success: false};
        }
        try {
            const {status, data} = await axios.post(fullURLs.CANDIDATE, {data: candidate}, {headers: {token, "Content-Type": "application/json"}});
            return {success: status === 200, data};
        } catch {
            return {success: false};
        }
    },
    getInterviewers: async(token: string) : Promise<IAPIResponse<IInterviewer[]>> => {
        try {
            const {status, data} = await axios.get(fullURLs.INTERVIEWERS, {headers: {token, "Content-Type": "application/json"}});
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
        if (room.eligible === undefined) {
            return {success: false, error: "Incomplete room object supplied. Field `eligible` required."};
        }
        try {
            if (room.eligible) {
                const {status, data} = await axios.delete(fullURLs.ROOM, {data: room, headers: {token, "Content-Type": "application/json"}});
                return {success: status === 200};
            } else {
                const {status, data} = await axios.post(fullURLs.ROOM, {data: room}, {headers: {token, "Content-Type": "application/json"}});
                return {success: status === 200, data};
            }
        } catch {
            return {success: false};
        }
        
    }

}