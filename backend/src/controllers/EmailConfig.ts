import {interfaces} from "adapter/dist";
import {Config, ConfigKey} from "../Config";


const createAvailabilityContent = (candidate: interfaces.ICandidate): string => {
    let header = '';
    if (!candidate.firstName && !candidate.lastName) {
        header = 'Hello,'
    } else {
        header = `Hello ${candidate.firstName || ""} ${candidate.lastName || ""}`.trim() + ","
    }

    return `<h4>${header}</h4>
               <p>Thank you for considering Galvanize.</p>
               <p>Please <a href="${Config.getInstance().get(ConfigKey.frontendUrl)}/submit_availability/${candidate.id}">Click Here</a>
               to send your availability so we can schedule an interview for you.</p>
               <br>
               <p>Regards,</p>
               <p>Galvanize Hiring Team</p>`;
};

interface IEmail {
    subject: string,
    content: string,
    recipients: string[]
}

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

export {createAvailabilityContent};
export default createEmail;