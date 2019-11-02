import React, {useState, useContext} from 'react';
import {
	Card,
	CardSubtitle,
	CardBody,
	Input,
	Button,
	Container,
	Row,
	Col,
	CardHeader,
	Label,
} from "reactstrap"
import adapter from "../services/Adapter";
import Context from '../services/Context';
import createOnChange from "../services/createOnChange";
import { RouteComponentProps } from 'react-router';
import { Redirect } from 'react-router-dom';

const Login: React.FC<RouteComponentProps> = (props: RouteComponentProps) => {
	const {updateContext, startLoadingProcess, endLoadingProcess} = useContext(Context);

	const [password, updatePassword] = useState("");
	const [email, updateEmail] = useState("");
	const [redirect, updateRedirect] = useState(false);

	const onChangePassword = createOnChange(updatePassword);
	const onChangeEmail = createOnChange(updateEmail);

	if (redirect) {
		return <Redirect to="/candidates"/>
	}

	async function login(e: React.FormEvent) {
		e.preventDefault();
		window.location.href = "http://localhost:8080/login";
		// startLoadingProcess();
		// const {success, data, error} = await adapter.login(email, password);
		//
		// if (error) {
		// 	endLoadingProcess({error});
		// 	return;
		// }
		//
		// if (success) {
		// 	endLoadingProcess({token: data});
		// 	updateRedirect(true);
		// 	return;
		// }
		//
		// endLoadingProcess({error: "There was an error logging in. Your username/password may not be valid."});
	}

	return (
		<Container>
			<Row>
				<Col sm="12" md={{size: 6, offset: 3}}>
					<Card className="mt-4">
						<CardHeader>Login</CardHeader>
						<CardBody>
							<CardSubtitle>Please input your email and password that is used by your official Galvanize email address.</CardSubtitle>
							<Label className="mt-4">Email</Label>
							<Input type="email" placeholder="enter email" onChange={onChangeEmail} value={email}/>
							<Label className="mt-2">Password</Label>
							<Input type="password" placeholder="enter password" onChange={onChangePassword} value={password}/>
							<Button className="mt-4" color="primary" onClick={login}>Login</Button>
						</CardBody>
					</Card>
				</Col>
			</Row>
		</Container>
	)
};

export default Login;
