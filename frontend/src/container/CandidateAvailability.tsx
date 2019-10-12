import React, {useContext, useEffect, useState} from "react";
import {Button, Card, CardBody, CardHeader, CardSubtitle, CardText, CardTitle, Container} from "reactstrap";
import {
	useParams
} from "react-router-dom";
import adapter from "../services/Adapter";
import Context from "../services/Context";
import {interfaces} from "adapter";
import AvailableTimes from 'react-available-times';
import moment from "moment";

type ICandidate = interfaces.ICandidate;
type IAvailability = interfaces.IAvailability;

const CandidateAvailability: React.FC = (props) => {
	const {updateContext} = useContext(Context);
	const {candidateID} = useParams();
	const [candidate, updateCandidate] = useState<ICandidate>();
	const [availability, updateAvailability] = useState<IAvailability>([]);
	const [submitted, updateSubmitted] = useState<boolean>(false);

	useEffect(() => {
		if (!candidateID) {
			updateContext({error: "this link is invalid, please request a new one from Galvanize."})
			return;
		}
		(async () => {
			const {success, data} = await adapter.getCandidateByID(candidateID);
			if (!success) {
				updateContext({error: "The candidate this link associated with does not exist."});
				return;
			}
			updateCandidate(data);
		})();
	}, [candidateID]);

	function onChange(data: Array<{ start: Date, end: Date }>) {
		updateAvailability(data.map(({start, end}) => ({
			start: moment(start),
			end: moment(end),
		})));
	}

	async function submitAvailability(): Promise<void> {
		const {success} = await adapter.submitAvailability(candidateID, availability);
		if (!success) {
			updateContext({error: "There was an error submitting your availability."});
			return;
		}
		updateSubmitted(true);
	}

	return (
		<Container>
			{
				candidate &&
				<Card className="mt-4">
					<CardHeader>Submit Availability</CardHeader>
					<CardBody>
						<CardTitle><h5>{candidate.firstName} {candidate.lastName}</h5></CardTitle>
						{!submitted ?
							<React.Fragment>
								<CardSubtitle>
									Please submit your available schedule so we can book a time with out interviewers.
								</CardSubtitle>
								<hr/>
								<AvailableTimes
									onChange={onChange}
									height="50vh"
								/>
								<Button className="mt-3" onClick={submitAvailability} color="primary">Submit
									Availability</Button>
							</React.Fragment> :
							<CardText>Thank you for submitted your availability, you may now close this page.</CardText>
						}
					</CardBody>
				</Card>
			}
		</Container>
	);
};

export default CandidateAvailability;