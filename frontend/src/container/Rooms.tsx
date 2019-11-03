import React, {useContext, useEffect, useState} from "react";
import {Button, Card, CardBody, CardHeader, Col, Container, Row} from "reactstrap";
import adapter from "../services/Adapter";
import Context from "../services/Context";
import {interfaces} from "adapter";
type IRoom = interfaces.IRoom;

const Rooms: React.FC = () => {
	const {token, updateContext, startLoadingProcess, endLoadingProcess} = useContext(Context);

	const [rooms, updateRooms] = useState<IRoom[]>([]);
	useEffect(() => {getRooms().then()}, []);

	async function getRooms(): Promise<void> {
		startLoadingProcess();
		const {success, data, error} = await adapter.getRooms(token);
		if (success) {
			updateRooms(data);
		} else if (error) {
			updateContext({error});
		} else {
			updateContext({error: "There was an error getting the candidates, please try again."})
		}
		endLoadingProcess();
	}

	return (
		<Container className="mb-4">
			<Row>
				<Col md={6} sm={12}>
					<Card className="mt-4">
						<CardHeader>Actions</CardHeader>
						<CardBody>
							<Button className="m-2" onClick={getRooms} color="primary">Refresh</Button>
						</CardBody>
					</Card>
				</Col>
				<Col md={12}>
					<Card className="mt-4">
						<CardHeader>Rooms</CardHeader>
						<CardBody>

						</CardBody>
					</Card>
				</Col>
			</Row>
		</Container>
	);
};

export default Rooms;