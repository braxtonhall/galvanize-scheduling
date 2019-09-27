import React, {ChangeEventHandler, useState, useContext} from 'react';
import {Card, CardSubtitle, CardBody, Input, Button, Container, Row, Col, CardHeader} from "reactstrap"
import adapter from "../services/Adapter";
import Context from '../services/Context';
import {interfaces} from "adapter";

const Login: React.FC = () => {
	const {updateContext} = useContext(Context);
	const [password, updatePassword] = useState("");
	const [email, updateEmail] = useState("");
	const onChangePassword: ChangeEventHandler<HTMLInputElement> = e => updatePassword(e.target.value)
	const onChangeEmail: ChangeEventHandler<HTMLInputElement> = e => updateEmail(e.target.value)

	async function login() {
		// attempt login human resource
		let res = await adapter.loginHumanResource(email, password);
		if (res.success) {
			updateContext({token: res.data, tokenType: interfaces.Role.HUMAN_RESOURCE});
			return;
		}

		// login hiring manager
		res = await adapter.loginHiringManager(email, password);
		if (res.success) {
			updateContext({token: res.data, tokenType: interfaces.Role.HIRING_MANAGER});
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
							<CardSubtitle>Please input your email and password that is used by your offical Galvanize email address.</CardSubtitle>
							<Input className="mt-4" type="email" placeholder="enter email" onChange={onChangeEmail} value={email}/>
							<Input className="mt-1" type="password" placeholder="enter password" onChange={onChangePassword} value={password}/>
							<Button className="mt-4" color="primary" onClick={login}>Login</Button>
						</CardBody>
					</Card>
				</Col>
			</Row>
		</Container>
	)
}

export default Login;
