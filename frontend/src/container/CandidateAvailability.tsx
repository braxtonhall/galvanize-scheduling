import React, {useContext, useEffect, useState} from "react";
import {Card, CardBody, CardHeader, Container} from "reactstrap";
import {
	useParams
} from "react-router-dom";
import adapter from "../services/Adapter";
import Context from "../services/Context";
import {interfaces} from "adapter";
type ICandidate = interfaces.ICandidate;

const CandidateAvailability: React.FC = (props) => {
	const {updateContext} = useContext(Context);
	const {candidateID} = useParams();
	const [candidate, updateCandidate] = useState<ICandidate>();

	useEffect(() => {
		if (!candidateID) {
			updateContext({error: "this link is invalid, please request a new one from Galvanize."})
			return;
		}
		(async () => {
			const {success, data} = await adapter.getCandidateByID(candidateID);
			if (!success) {
				updateContext({error: "The candidate this link associated with does not exist."})
				return;
			}
			updateCandidate(data);
		})();
	},[candidateID]);

	return (
		<Container>
			{
				candidate &&
				<Card>
					<CardHeader>Submit Availability</CardHeader>
					<CardBody>
						
					</CardBody>
				</Card>
			}
		</Container>
	);
};

export default CandidateAvailability;