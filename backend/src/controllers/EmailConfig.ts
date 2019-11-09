import {interfaces} from "adapter/dist";
import {Config, ConfigKey} from "../Config";

const createEmail = (candidate: interfaces.ICandidate) => {
    let header = '';
    if (!candidate.firstName && !candidate.lastName) {
        header = 'Hello,'
    } else {
        header = `Hello ${candidate.firstName || ""} ${candidate.lastName || ""}`.trim() + ","
    }

    const html = `<h4>${header}</h4>
                  <p>Thank you for considering Galvanize.</p>
                  <p>Please <a href="${Config.getInstance().get(ConfigKey.frontendUrl)}/submit_availability/${candidate.id}">Click Here</a>
                   to send your availability so we can schedule and interview for you.</p>
                   <br>
                   <p>Regards,</p>
                   <p>Galvanize Hiring Team</p>`;

    return {
        message: {
            subject: "Availability Form",
            body: {
                contentType: "HTML",
                content: html
            },
            toRecipients: [
                {
                    emailAddress: {
                        address: candidate.email
                    }
                }
            ]
        }
    }
};

export default createEmail;