import {interfaces} from "adapter/dist";
import {Config, ConfigKey} from "../Config";

const createEmail = (candidate: interfaces.ICandidate) => {
    const html = `<h1>Hello ${!candidate.firstName} ${!candidate.lastName},</h1>
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