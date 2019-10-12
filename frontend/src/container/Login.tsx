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
import {Simulate} from "react-dom/test-utils";

const Login: React.FC<RouteComponentProps> = (props: RouteComponentProps) => {
	const {updateContext} = useContext(Context);

	const [password, updatePassword] = useState("");
	const [email, updateEmail] = useState("");

	const onChangePassword = createOnChange(updatePassword);
	const onChangeEmail = createOnChange(updateEmail);

	async function login() {
		const {success, data, error} = await adapter.login(email, password);

		if (error) {
			updateContext({error});
			return;
		}

		if (success) {
			updateContext({token: data});
			props.history.push("/candidates");
			return;
		}

		updateContext({error: "There was an error logging in. Your username/password may not be valid."})
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
