import React from "react";
import {Container, Row, Col} from "reactstrap";
import CandidateForm from "./CandidateForm";

const CandidateList: React.FC = () => {
	return (
		<Container>
			<Row>
				<Col md={12}>
					<CandidateForm/>
				</Col>
				<Col md={12}>
				</Col>
			</Row>
		</Container>
	)
};

export default CandidateList