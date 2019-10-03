import React from "react";
import CandidateForm from "./CandidateForm";
import {CardTitle, Table} from 'reactstrap';
import {Button, Card, CardBody, CardHeader, CardSubtitle, Input, Label} from "reactstrap";
import {interfaces} from "adapter";

type ICandidate = interfaces.ICandidate;

interface IProps {
	candidates?: ICandidate[],
	actions?: Array<{text: string, onClick: (candidate: ICandidate) => (void | Promise<void>)}>
	selected?: ICandidate,
}

const CandidateList: React.FC<IProps> = (props: IProps) => {

	const {candidates, actions, selected} = props;
	console.log(selected);

	function makeRow(candidate: ICandidate, index: number): JSX.Element {
		const {id, email, phoneNumber, firstName, lastName, position} = candidate;

		function makeButtons({text, onClick}: {text: string, onClick: (candidate: ICandidate) => (void | Promise<void>)}) {

			function onClickWrapper() {
				onClick(candidate);
			}

			return (<Button onClick={onClickWrapper} size="sm">{text}</Button>)
		}

		const isSelected = selected ? selected.id === id : false;

		return (
			<tr className={isSelected && "bg-light"}>
				<th scope="row">{id}</th>
				<td>{email}</td>
				<td>{phoneNumber}</td>
				<td>{firstName}</td>
				<td>{lastName}</td>
				<td>{position}</td>
				<td>{actions.map(makeButtons)}</td>
			</tr>
		)
	}

	return (
		<Card className="mt-4">
			<CardHeader>Candidates List</CardHeader>
			<CardBody>
				<Table hover>
					<thead>
						<tr>
							<th>ID</th>
							<th>Email</th>
							<th>Phone Number</th>
							<th>First Name</th>
							<th>Last Name</th>
							<th>Position</th>
							<th/>
						</tr>
					</thead>
					<tbody>
					{candidates.map(makeRow)}
					</tbody>
				</Table>
			</CardBody>
		</Card>
	)
};

CandidateList.defaultProps = {
	candidates: [],
	actions: [],
};

export default CandidateList