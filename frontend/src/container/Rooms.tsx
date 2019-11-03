import React, {useContext, useEffect, useState} from "react";
import {Button, ButtonGroup, Card, CardBody, CardHeader, Col, Container, Row, Table} from "reactstrap";
import adapter from "../services/Adapter";
import Context from "../services/Context";
import {interfaces} from "adapter";
import Fade from 'react-reveal/Fade';
type IRoom = interfaces.IRoom;

const Rooms: React.FC = () => {
	const {token, updateContext, startLoadingProcess, endLoadingProcess} = useContext(Context);

	const [rooms, updateRooms] = useState<IRoom[]>([]);
	useEffect(() => {getRooms().then()}, []);

	async function getRooms(): Promise<void> {
		startLoadingProcess();
		const {success, data, error} = await adapter.getRooms(token);
		console.log({success, data, error});
		if (success) {
			updateRooms(data);
			endLoadingProcess();
		} else if (error) {
			endLoadingProcess({error});
		} else {
			endLoadingProcess({error: "There was an error getting the candidates, please try again."})
		}
	}

	function makeRow(room: IRoom, index: number): JSX.Element {
		const {id, name, eligible} = room;

		async function onClickWrapper() {
			startLoadingProcess();
			await adapter.toggleEligibility(token, room);
			endLoadingProcess();
		}

		return (
			<tr className={"text-nowrap"} key={"row_" + index}>
				<th scope="row">{id}</th>
				<td>{name}</td>
				<td>{eligible}</td>
				<td>
					<ButtonGroup>
						<Button onClick={onClickWrapper} size="sm" color="primary">{eligible ?  "remove eligibility" : "make eligible"}</Button>)
					</ButtonGroup>
				</td>
			</tr>
		)
	}

	return (
		<Container className="mb-4">
			<Row>
				<Col md={6} sm={12}>
					<Fade left>
						<Card className="mt-4">
							<CardHeader>Actions</CardHeader>
							<CardBody>
								<Button className="m-2" onClick={getRooms} color="primary">Refresh</Button>
							</CardBody>
						</Card>
					</Fade>
				</Col>

				<Col md={12}>
					<Fade right>
						<Card className="mt-4">
							<CardHeader>Rooms</CardHeader>
							<CardBody>
								<div className="table-responsive">
									<Table hover>
										<thead>
										<tr>
											<th>id</th>
											<th>name</th>
											<th>eligible</th>
											<th>toggle</th>
										</tr>
										</thead>
										<tbody>
										{rooms.map(makeRow)}
										</tbody>
									</Table>
								</div>
							</CardBody>
						</Card>
					</Fade>
				</Col>
			</Row>
		</Container>
	);
};

export default Rooms;