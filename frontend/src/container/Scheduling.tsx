import React, {useContext, useEffect, useState} from "react";
import {Button, Card, CardBody, CardHeader, Col, Container, Row} from "reactstrap";
import CandidateList from "../component/CandidateList";
import adapter from "../services/Adapter";
import Context from "../services/Context";
import {interfaces} from "adapter";
type ICandidate = interfaces.ICandidate;

const Scheduling: React.FC = () => {

	const {token, updateContext} = useContext(Context);
	const [candidates, updateCandidates] = useState<ICandidate[]>([]);
	const [selectedCandidate, updateSelectedCandidate] = useState<ICandidate>();

	useEffect(() => {refreshCandidates().then()}, []);

	async function refreshCandidates(): Promise<void> {
		const {success, data, error} = await adapter.getCandidates(token);
		if (success) {
			updateCandidates(data);
		} else if (error) {
			updateContext({error});
		} else {
			updateContext({error: "There was an error getting the candidates, please try again."})
		}
	}

	function selectCandidate(candidate: ICandidate) {
		updateSelectedCandidate(candidate);
	}

	return (
		<Container>
			<Row>
				<Col md={12}>
					<CandidateList
						candidates={candidates}
						selected={selectedCandidate}
						actions={[{text: "Select", color: "primary", onClick: selectCandidate}]}
					/>
				</Col>
				<Col md={6} sm={12}>
					<Card className="mt-4">
						<CardHeader>Interviewers</CardHeader>
						<CardBody>
							<p>put in here</p>
						</CardBody>
					</Card>
				</Col>
				<Col md={6} sm={12}>
					<Card className="mt-4">
						<CardHeader>Schedules</CardHeader>
						<CardBody>
							<p>put in here</p>
						</CardBody>
					</Card>
				</Col>
				<Col md={6} sm={12}>
					<Card className="mt-4">
						<CardHeader>Rooms</CardHeader>
						<CardBody>
							<p>put in here</p>
						</CardBody>
					</Card>
				</Col>
				<Col md={6} sm={12}>
					<Card className="mt-4">
						<CardHeader>Actions</CardHeader>
						<CardBody>
							<p>put in here</p>
						</CardBody>
					</Card>
				</Col>
			</Row>
		</Container>
	);
};

export default Scheduling;