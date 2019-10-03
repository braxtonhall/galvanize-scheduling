import React, {useContext, useEffect, useState} from "react";
import {Container, Row, Col} from "reactstrap";
import CandidateForm from "../component/CandidateForm";
import CandidateList from "../component/CandidateList";
import {interfaces} from "adapter";
import Context from "../services/Context";
import adapter from "../services/Adapter";

type ICandidate = interfaces.ICandidate;

const CandidateMenu: React.FC = () => {
	const {token, updateContext} = useContext(Context);
	const [candidates, updateCandidates] = useState<ICandidate[]>([]);
	const [selectedCandidate, updateSelectedCandidate] = useState<ICandidate>();
	const actions: Array<{text: string, onClick: (candidate: ICandidate) => (void | Promise<void>)}> = [
		{text: "Select", onClick: selectCandidate}
	];

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

	function selectCandidate(candidate: ICandidate): void {
		updateSelectedCandidate(candidate);
	}


	return (
		<Container>
			<Row>
				<Col md={12}>
					<CandidateList
						candidates={candidates}
						selected={selectedCandidate}
						actions={actions}
					/>
				</Col>
				<Col md={12}>
					<CandidateForm/>
				</Col>
			</Row>
		</Container>
	)
};

export default CandidateMenu