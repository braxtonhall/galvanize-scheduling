import React, {useContext, useEffect, useState} from "react";
import {Container, Row, Col, Card, Button, CardBody, CardHeader} from "reactstrap";
import CandidateForm from "../component/CandidateForm";
import CandidateList from "../component/CandidateList";
import {interfaces} from "adapter";
import Context from "../services/Context";
import adapter from "../services/Adapter";

type ICandidate = interfaces.ICandidate;

const CandidateMenu: React.FC = () => {
	const {token, updateContext, startLoadingProcess, endLoadingProcess} = useContext(Context);
	const [candidates, updateCandidates] = useState<ICandidate[]>([]);
	const [selectedCandidate, updateSelectedCandidate] = useState<ICandidate>();
	const [title, updateTitle] = useState<string>();
	const [description, updateDescription] = useState<string>();
	const [buttons, updateButtons] = useState<Array<{text: string, onClick: (candidate: ICandidate) => (void | Promise<void>)}>>();
	const actions: Array<{text: string, color: string, onClick: (candidate: ICandidate) => (void | Promise<void>)}> = [
		{text: "Select", onClick: selectCandidate, color: "primary"},
		{text: "Send Availability", onClick: sendAvailabilityEmail, color: "secondary"},
		{text: "Delete", onClick: deleteCandidate, color: "danger"},
	];

	useEffect(() => {refreshCandidates().then()}, []);

	function selectCandidate(candidate: ICandidate): void {
		updateTitle("Edit Candidate");
		updateDescription("You may edit all the details of a candidate and save them.");
		updateSelectedCandidate({...candidate});
		updateButtons([{text: "Update", onClick: updateCandidate}])
	}

	async function sendAvailabilityEmail(candidate: ICandidate): Promise<void> {
		startLoadingProcess();
		const {success, error} = await adapter.sendAvailabilityEmail(token, candidate);
		if (!success && error) {
			updateContext({error});
		} else if (!success) {
			updateContext({error: "There was an error sending the availability email."})
		}
		endLoadingProcess();
	}

	function newCandidate(): void {
		updateTitle("Create New Candidate");
		updateDescription("Enter all the details of a new candidate and save them.");
		updateSelectedCandidate({
			email: "",
			phoneNumber: "",
			firstName: "",
			lastName: "",
			position: "",
			notes: ""
		});
		updateButtons([{text: "Create", onClick: createNewCandidate}])
	}

	function onChangeSelected(candidate: ICandidate) {
		if (candidate) {
			updateSelectedCandidate(candidate);
		}
	}

	// API calls
	async function deleteCandidate(candidate: ICandidate): Promise<void> {
		startLoadingProcess();
		const {success, error} = await adapter.deleteCandidate(token, candidate);
		if (success) {
			await refreshCandidates()
		} else if (error) {
			updateContext({error});
		} else {
			updateContext({error: "There was an error deleting the candidate."})
		}
		endLoadingProcess();
	}

	async function refreshCandidates(): Promise<void> {
		startLoadingProcess();
		const {success, data, error} = await adapter.getCandidates(token);
		updateSelectedCandidate(undefined);
		updateTitle(undefined);
		updateDescription(undefined);
		updateButtons(undefined);
		if (success) {
			updateCandidates(data);
		} else if (error) {
			updateContext({error});
		} else {
			updateContext({error: "There was an error getting the candidates, please try again."})
		}
		endLoadingProcess();
	}

	async function createNewCandidate(candidate: ICandidate): Promise<void> {
		startLoadingProcess();
		const {success, error} = await adapter.createCandidate(token, candidate);
		if (success) {
			await refreshCandidates()
		} else if (error) {
			updateContext({error});
		} else {
			updateContext({error: "There was an error creating the candidate."})
		}
		endLoadingProcess();
	}

	async function updateCandidate(candidate: ICandidate): Promise<void> {
		startLoadingProcess();
		const {success, error} = await adapter.updateCandidate(token, candidate);
		if (success) {
			await refreshCandidates()
		} else if (error) {
			updateContext({error});
		} else {
			updateContext({error: "There was an error updating the candidate."})
		}
		endLoadingProcess();
	}

	return (
		<Container className="pb-4">
			<Row>
				<Col md={6} sm={12}>
					<Card className="mt-4">
						<CardHeader>Actions</CardHeader>
						<CardBody>
							<Button className="m-2" onClick={refreshCandidates} color="primary">Refresh</Button>
							<Button className="m-2" onClick={newCandidate} color="primary">New Candidate</Button>
						</CardBody>
					</Card>
				</Col>
				<Col md={12}>
					<CandidateList
						candidates={candidates}
						selected={selectedCandidate}
						actions={actions}
					/>
				</Col>
				{
					selectedCandidate &&
					<Col md={12}>
						<CandidateForm
							candidate={selectedCandidate}
							title={title}
							description={description}
							onChange={onChangeSelected}
							buttons={buttons}
						/>
					</Col>
				}
			</Row>
		</Container>
	)
};

export default CandidateMenu