import React from "react";
import {ButtonGroup, Table} from 'reactstrap';
import {Button, Card, CardBody, CardHeader} from "reactstrap";
import {interfaces} from "adapter";
import {Link} from "react-router-dom";

type ICandidate = interfaces.ICandidate;

interface IProps {
	candidates?: ICandidate[],
	actions?: Array<{ text: string, color: string, onClick: (candidate: ICandidate) => (void | Promise<void>) }>
	selected?: ICandidate,
}

const CandidateList: React.FC<IProps> = (props: IProps) => {

	const {candidates, actions, selected} = props;

	function makeRow(candidate: ICandidate, index: number): JSX.Element {
		const {id, email, phoneNumber, firstName, lastName, position} = candidate;

		function makeButtons({text, onClick, color}: { text: string, color: string, onClick: (candidate: ICandidate) => (void | Promise<void>) }, k: number) {

			function onClickWrapper() {
				onClick(candidate);
			}

			return (
				<Button onClick={onClickWrapper} size="sm" color={color} key={"candidate_button_" + k}>{text}</Button>)
		}

		const isSelected = selected ? selected.id === id : false;

		return (
			<tr className={"text-nowrap " + (isSelected ? "bg-light" : "")} key={"row_" + index}>
				<th scope="row">{emptyEntry(email)}</th>
				<td>{emptyEntry(phoneNumber)}</td>
				<td>{emptyEntry(firstName)}</td>
				<td>{emptyEntry(lastName)}</td>
				<td>{emptyEntry(position)}</td>
				<td><a href={`/submit_availability/${candidate.id}`} target="_blank">/submit_availability/{candidate.id}</a></td>
				<td>
					<ButtonGroup>
						{actions.map(makeButtons)}
					</ButtonGroup>
				</td>
			</tr>
		)
	}

	return (
		<Card className="mt-4">
			<CardHeader>Candidates List</CardHeader>
			<CardBody>
				<div className="table-responsive">
					<Table hover>
						<thead>
						<tr>
							<th>Email</th>
							<th>Phone Number</th>
							<th>First Name</th>
							<th>Last Name</th>
							<th>Position</th>
							<th>Availability URL</th>
							<th>Actions</th>
						</tr>
						</thead>
						<tbody>
						{candidates.map(makeRow)}
						</tbody>
					</Table>
				</div>
			</CardBody>
		</Card>
	)
};

function emptyEntry(i: string): string {
	if (i === undefined || i === null || typeof i !== "string" || i.length < 1) {
		return "N/A";
	}

	return i;
}

CandidateList.defaultProps = {
	candidates: [],
	actions: [],
};

export default CandidateList