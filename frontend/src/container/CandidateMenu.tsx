import React from "react";
import {Container, Row, Col} from "reactstrap";
import CandidateForm from "../component/CandidateForm";

const CandidateMenu: React.FC = () => {
	return (
		<Container>
			<Row>
				<Col md={12}>
					<CandidateForm/>
				</Col>
				<Col md={12}>
					<CandidateForm/>
				</Col>
			</Row>
		</Container>
	)
};

export default CandidateMenu