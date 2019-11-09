import {interfaces} from "adapter/dist";
import {Config, ConfigKey} from "../Config";

const createEmail = (candidate: interfaces.ICandidate) => {
    let name = `${candidate.firstName || ""} ${candidate.lastName || ""},`.trim();

    const html = `<h4>Hello ${name}</h4>
                          <p>Please submit your availability by clicking the link below so we can schedule an interview.</p>
                          <a href="${Config.getInstance().get(ConfigKey.frontendUrl)}/submit_availability/${candidate.id}">Link to availability</a>`

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