import {interfaces} from "adapter";
import React, {ChangeEventHandler} from "react";
import {Button, ButtonGroup, Card, CardBody, CardHeader, CardText, Input, Label, Table} from "reactstrap";
import cloneDeep from "lodash/cloneDeep"

type IInterviewer = interfaces.IInterviewer;

export type InterviewSelectionValue = Array<{
	interviewer: IInterviewer,
	minutes: number,
	preference?: IInterviewer,
}>

interface IProps {
	value?: InterviewSelectionValue,
	onChange?: (v: InterviewSelectionValue) => void,
	group?: string;
	onChangeGroup?: (v: string) => void,
	actions?: Array<{text: string, onClick: (v: InterviewSelectionValue) => void | Promise<void>}>
	refresh?: () => void,
}

const allowedMinutes = [0, 15, 30, 45, 60, 75, 90, 105, 120];
const minuteOptions = (
	<React.Fragment>
		{allowedMinutes.map(i => <option key={"minutes_" + i} value={i}>{i} minutes</option>)}
	</React.Fragment>
);

const InterviewSelection: React.FC<IProps> = (props: IProps) => {

	const {value, onChange, actions, group, onChangeGroup, refresh} = props;

	function makeRow(v: { interviewer: IInterviewer, minutes: number, preference?: IInterviewer, }, index: number) {
		const {interviewer, minutes, preference} = v;
		const {id, firstName, lastName} = interviewer;
		const preferences = (
			<React.Fragment>
				<option value={"Alone"}>Alone</option>
				{value.map(i => <option key={"preference_" + i.interviewer.id} value={i.interviewer.id}>{i.interviewer.firstName} {i.interviewer.lastName}</option>)}
			</React.Fragment>
		);

		const onPreferenceChange: ChangeEventHandler<HTMLInputElement> = (e) => {
			const newValues: InterviewSelectionValue = cloneDeep(value);
			const newPreferenceID = e.target.value;
			let newPreference: IInterviewer;
			for (let i = 0; i < newValues.length; i++) {
				const interviewer = newValues[i].interviewer;
				if (interviewer.id === newPreferenceID) {
					newPreference = interviewer;
				}
			}
			newValues[index].preference = newPreference;
			onChange(newValues);
		};

		const onMinuteChange: ChangeEventHandler<HTMLInputElement> = (e) => {
			const newValues: InterviewSelectionValue = cloneDeep(value);
			newValues[index].minutes = parseFloat(e.target.value);
			if (newValues[index].preference) {
				for (let i = 0; i < newValues.length; i++) {
					if (newValues[i].interviewer.id === newValues[index].preference.id) {
						newValues[i].minutes = newValues[index].minutes;
						break;
					}
				}
			}
			onChange(newValues);
		};

		return (
			<tr key={"interviewer_" + interviewer.id}>
				<td>{firstName}</td>
				<td>{lastName}</td>
				<td>
					<Input type="select" value={preference ? preference.id : "Alone"} onChange={onPreferenceChange}>
						{preferences}
					</Input>
				</td>
				<td>
					<Input type="select" value={minutes} onChange={onMinuteChange}>
						{minuteOptions}
					</Input>
				</td>
			</tr>
		)
	}

	function onChangeGroupWrapper(e): void {
		onChangeGroup(e.target.value);
	}

	function makeButton({text, onClick}: {text: string, onClick: (v: InterviewSelectionValue) => void | Promise<void>}, index: number) {
		function onClickWrapper() {
			onClick(value);
		}

		return (<Button key={"interview_selection_button_" + index} onClick={onClickWrapper} color="primary">{text}</Button>)
	}

	return (
		<Card className="mt-4">
			<CardHeader>Interviewers</CardHeader>
			<CardBody>
				<CardText>
					Please allocate times for each interviewer you want to meet with the candidate. Preferences will try
					to be accommodated, but cannot be guaranteed based on room availability/schedules. The employees
					shown are based on which groups they are a part of on Outlook, you may adjust this to view employees
					from other groups.
				</CardText>
				<Label>Outlook Group</Label>
				<Input value={group} onChange={onChangeGroupWrapper}/>
				<Button onClick={refresh} color="primary" className="my-3">Refresh Interviewers</Button>
				<div className="table-responsive">
					<Table hover>
						<thead>
						<tr>
							<th>First Name</th>
							<th>Last Name</th>
							<th>Preference</th>
							<th>Time Needed</th>
						</tr>
						</thead>
						<tbody>
						{value.map(makeRow)}
						</tbody>
					</Table>
				</div>
				{
					actions.length > 0 &&
					<ButtonGroup>
						{actions.map(makeButton)}
					</ButtonGroup>
				}
			</CardBody>
		</Card>
	)
};

InterviewSelection.defaultProps = {
	value: [],
	onChange: () => {},
	actions: [],
};

export default InterviewSelection;