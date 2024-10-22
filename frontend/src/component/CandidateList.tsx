import React from "react";
import {ButtonGroup, CardText, Table} from 'reactstrap';
import {Button, Card, CardBody, CardHeader} from "reactstrap";
import {interfaces} from "adapter";

type ICandidate = interfaces.ICandidate;

interface IProps {
	candidates?: ICandidate[],
	actions?: Array<{ text: string, color: string, onClick: (candidate: ICandidate) => (void | Promise<void>), disabled?: (candidate: ICandidate) => boolean }>
	selected?: ICandidate,
	noCandidatesMessage?: string,
}

const CandidateList: React.FC<IProps> = (props: IProps) => {

	const {candidates, actions, selected, noCandidatesMessage} = props;

	function makeRow(candidate: ICandidate, index: number): JSX.Element {
		const {id, email, phoneNumber, firstName, lastName, position, schedule} = candidate;

		function makeButtons({text, onClick, color, disabled}: { text: string, color: string, onClick: (candidate: ICandidate) => (void | Promise<void>), disabled?: (candidate: ICandidate) => boolean }, k: number) {

			function onClickWrapper() {
				onClick(candidate);
			}

			const _disabled = disabled ? disabled(candidate) : false;

			if (_disabled) {
				return null;
			}

			return (
				<Button onClick={onClickWrapper} size="sm" color={color} key={"candidate_button_" + k} disabled={_disabled}>{text}</Button>)
		}

		const isSelected = selected ? selected.id === id : false;

		return (
			<tr className={"text-nowrap " + (isSelected ? "bg-light" : "")} key={"row_" + index}>
				<th scope="row">{emptyEntry(email)}</th>
				<td>{emptyEntry(phoneNumber)}</td>
				<td>{emptyEntry(firstName)}</td>
				<td>{emptyEntry(lastName)}</td>
				<td>{emptyEntry(position)}</td>
				<td><a href={`/submit_availability/${candidate.id}`} target="_blank">{schedule ? "View Schedule" : "Submit Availability"}</a></td>
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
				{candidates.length > 0 ?
					<div className="table-responsive">
						<Table hover>
							<thead>
							<tr>
								<th>Email</th>
								<th>Phone Number</th>
								<th>First Name</th>
								<th>Last Name</th>
								<th>Position</th>
								<th>Candidate URL</th>
								<th>Actions</th>
							</tr>
							</thead>
							<tbody>
							{candidates.map(makeRow)}
							</tbody>
						</Table>
					</div>
				 :
					<CardText>{noCandidatesMessage}</CardText>
				}
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
	noCandidatesMessage: "There are currently no candidates.",
};

export default CandidateList