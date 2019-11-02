import React from 'react';
import {
	Card,
	CardBody,
	Button,
	Container,
	Row,
	Col,
	CardHeader,
	CardText,
} from "reactstrap"
import adapter from "../services/Adapter";

const Login: React.FC = () => {

	async function login(e: React.FormEvent) {
		e.preventDefault();
		console.log(adapter.loginRedirectURL());
		window.location.href = adapter.loginRedirectURL();
	}

	return (
		<Container>
			<Row>
				<Col sm="12" md={{size: 6, offset: 3}}>
					<Card className="mt-4">
						<CardHeader>Login</CardHeader>
						<CardBody>
							<CardText>In order to login into the Galvanize scheduling software, you need to authenticate with the Microsoft server for Galvanize. Please use your credentials you use to login with your outlook.</CardText>
							{process.env.NODE_ENV === "development" && <CardText>On the development version you may use <b>admin@ph14solutions.onmicrosoft.com</b> and <b>Galvanize319</b>.</CardText>}
							<Button className="mt-4" color="primary" onClick={login}>Login</Button>
						</CardBody>
					</Card>
				</Col>
			</Row>
		</Container>
	)
};

export default Login;
