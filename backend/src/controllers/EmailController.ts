import {interfaces} from "adapter";
import {Config, ConfigKey} from "../Config";
import MSGraphController from "./MSGraphController";

interface IEmail {
    subject: string,
    content: string,
    recipients: string[]
}

const buildHeader = (candidate: interfaces.ICandidate): string => {
    if (!candidate.firstName && !candidate.lastName) {
        return 'Hello,';
    } else {
        return `Hello ${candidate.firstName || ""} ${candidate.lastName || ""}`.trim() + ",";
    }
};
const createAvailabilityContent = (candidate: interfaces.ICandidate): string => {
    let header = buildHeader(candidate);
    return `<h4>${header}</h4>
               <p>Thank you for considering Galvanize.</p>
               <p>Please <a href="${Config.getInstance().get(ConfigKey.frontendUrl)}/submit_availability/${candidate.id}">click here</a>
               to send your availability so we can schedule an interview for you.</p>
               <br>
               <p>Regards,</p>
               <p>The Galvanize Hiring Team</p>`;
};

const createScheduleContent = (schedule: interfaces.ISchedule): string => {
    let header = buildHeader(schedule.candidate).replace("Hello", "Hello again");
    
    return `<h4>${header}</h4>
               <p>We at Galvanize are looking forward to meeting you!</p>
               <p>Please <a href="${Config.getInstance().get(ConfigKey.frontendUrl)}/submit_availability/${schedule.candidate.id}">click here</a>
               to see your upcoming interview schedule at our offices.</p>
               <br>
               <p>Regards,</p>
               <p>The Galvanize Hiring Team</p>`;
};

const createCancellationContent = (candidate: interfaces.ICandidate): string => {
    let header = buildHeader(candidate);
    return `<h4>${header}</h4>
               <p>Due to unfortunate circumstances, we have had to reschedule your upcoming interviews at Galvanize.</p>
               <p>Be on the lookout for another email containing your updated schedule.</p>
               <br>
               <p>Regards,</p>
               <p>The Galvanize Hiring Team</p>`;
};

const createEmail = (email: IEmail) => {
    return {
        message: {
            subject: email.subject,
            body: {
                contentType: "HTML",
                content: email.content
            },
            toRecipients: email.recipients.map((e) => ({emailAddress: {address: e}}))
        }
    }
};

/**
 * Following functions to send and cancel emails.
 * @param {string} token - The token needed for requests
 * @param {ICandidate} candidate - The candidate to send the email to
 * @returns {Promise} whether sending the email succeeded or failed.
 * @see MSGraphController.sendEmail
 */
const sendAvailabilityEmail = (token, candidate: interfaces.ICandidate) => {
    const email = {
        subject: 'Your availability for an interview with Galvanize',
        content: createAvailabilityContent(candidate),
        recipients: [candidate.email]
    };
    return MSGraphController.sendEmail(token, createEmail(email));
};

const sendScheduleEmail = (token: string, schedule: interfaces.ISchedule) => {
    const email = {
        subject: 'Your schedule for an interview with Galvanize',
        content: createScheduleContent(schedule),
        recipients: [schedule.candidate.email]
    };
    return MSGraphController.sendEmail(token, createEmail(email));
};

export const sendCancellationEmail = (token: string, candidate: interfaces.ICandidate) => {
    const email = {
        subject: 'Interview rescheduling notice',
        content: createCancellationContent(candidate),
        recipients: [candidate.email]
    };
    return MSGraphController.sendEmail(token, createEmail(email));
};

export {sendAvailabilityEmail, sendScheduleEmail};