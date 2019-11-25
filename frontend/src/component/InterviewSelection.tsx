import {interfaces} from "adapter";
import React, {ChangeEventHandler, useState} from "react";
import {
	Button,
	ButtonGroup,
	Card,
	CardBody, CardFooter,
	CardHeader,
	CardText,
	FormFeedback,
	FormGroup,
	Input,
	Label,
	Table
} from "reactstrap";
import cloneDeep from "lodash/cloneDeep"
import Fade from 'react-reveal/Fade';
import {min} from "moment";

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
	const [showWarnings, updateShowWarnings] = useState(false);

	// used as util function in determining messages
	function getIndexOfInterviewer(interviewer: IInterviewer): number {
		if (!interviewer) {
			return -1
		}
		for (let i = 0; i < value.length; i++) {
			if (value[i].interviewer.id === interviewer.id) {
				return i;
			}
		}

		return -1;
	}

	// used as util function in determining messages
	function getInterviewersWhomPrefer(interviewer: IInterviewer): InterviewSelectionValue {
		const prefer: InterviewSelectionValue = [];
		for (let i = 0; i < value.length; i++) {
			if (value[i].preference && value[i].preference.id === interviewer.id) {
				prefer.push(value[i]);
			}
		}
		return prefer;
	}

	const onShowWarningsChange: ChangeEventHandler<HTMLInputElement> = (e) => {
		updateShowWarnings(!showWarnings);
	};

	function makeRow(v: { interviewer: IInterviewer, minutes: number, preference?: IInterviewer, }, index: number) {
		const {interviewer, minutes, preference} = v;
		const {id, firstName, lastName} = interviewer;
		const preferenceValueIndex = getIndexOfInterviewer(preference);
		const preferenceValue = preferenceValueIndex ? value[preferenceValueIndex] : undefined;
		const preferThisInterviewer = getInterviewersWhomPrefer(interviewer);
		const idsOfPreferThisInterview = preferThisInterviewer.map(i => i.interviewer.id);
		const preferences = (
			<React.Fragment>
				<option value={"Alone"}>Alone</option>
				{value.map(i => i.interviewer.id !== id && <option key={"preference_" + i.interviewer.id} value={i.interviewer.id}>{i.interviewer.firstName} {i.interviewer.lastName}</option>)}
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

		function makeOnPreferenceChange(i: IInterviewer): (e: any) => void {
			return (e) => {
				e.preventDefault();
				// @ts-ignore
				onPreferenceChange({target: {value: i.id}});
			}
		}

		const onMinuteChange: ChangeEventHandler<HTMLInputElement> = (e) => {
			const newValues: InterviewSelectionValue = cloneDeep(value);
			newValues[index].minutes = parseFloat(e.target.value);
			onChange(newValues);
		};

		function makeOnMinuteChange(time: number): (e: any) => void {
			return (e) => {
				e.preventDefault();
				// @ts-ignore
				onMinuteChange({target: {value: time.toString()}});
			}
		}


		// check if preference doesnt have the same time
		const nonMatchingTimeWithPreference = preferenceValue && preferenceValue.minutes !== minutes;

		const nonMatchingTimeWithPersonWhomPrefersYou = preferenceValue && preferenceValue.minutes !== minutes;

		// check if preference doesn't prefer them
		const preferSomeoneWhomDoesntPreferThem = preferenceValue && (!preferenceValue.preference || preferenceValue.preference.id !== interviewer.id);

		// check if preferred and doesn't prefer back
		const isPreferredButDoesntPreferThem = (!preference && preferThisInterviewer.length > 0)
			|| preferThisInterviewer.length > 1
			|| (preferenceValue && preferenceValue.preference && preferThisInterviewer.length > 0 && preference.id !== preferThisInterviewer[0].interviewer.id);

		// const inChain = preferSomeoneWhomDoesntPreferThem && isPreferredButDoesntPreferThem;
		const inChain = false;

		function createPreferThisInterviewerMessage(v: any): JSX.Element {
			if (preference && preference.id === v.interviewer.id) {
				return null;
			}
			return (
				<Fade key={"warning_not_preferred_back_" + v.interviewer.id}>
					<p className="my-0"><b>{interviewer.firstName}</b> is preferred by <b>{v.interviewer.firstName}</b>, but <b>{interviewer.firstName}</b> doesn't prefer them back.
						<a href="#" role="button" onClick={makeOnPreferenceChange(v.interviewer)}> Prefer <b>{v.interviewer.firstName} {v.interviewer.lastName}</b></a>
					</p>
				</Fade>
			)
		}

		function createPreferSomeoneWithDifferentTime(v: any): JSX.Element {
			if (v.minutes === minutes) {
				return null;
			}
			return (
				<Fade key={"warning_no_time_" + v}>
					<p className="my-0"><b>{v.interviewer.firstName}</b> prefers <b>{interviewer.firstName}</b>, but <b>{v.interviewer.firstName}</b> prefers <b>{v.minutes}</b> minutes.
						<a href="#" role="button" onClick={makeOnMinuteChange(v.minutes)}> Change to <b>{v.minutes}</b> minutes</a>
					</p>
				</Fade>
			)
		}

		return (
			<React.Fragment key={"interviewer_" + interviewer.id}>
				<tr>
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
					{ showWarnings &&
						<tr className="bg-transparent">
							<td colSpan={4} className="border-top-0 p-0">
								<p className="text-secondary mx-2 small my-0">
									{preferThisInterviewer.map(createPreferSomeoneWithDifferentTime)}
									{ nonMatchingTimeWithPreference &&
										<Fade>
											<p className="my-0">Does not have a matching time with <b>{preference.firstName}</b> (<b>{preferenceValue.minutes}</b> minutes).
												<a href="#" role="button" onClick={makeOnMinuteChange(preferenceValue.minutes)}> Change to <b>{preferenceValue.minutes}</b> minutes</a>
											</p>
										</Fade>
									}
									{/*{ !inChain && preferSomeoneWhomDoesntPreferThem &&*/}
									{/*	<Fade>*/}
									{/*		<p className="my-0"><b>{preference.firstName}</b> doesn't prefer <b>{interviewer.firstName}</b>.</p>*/}
									{/*	</Fade>*/}
									{/*}*/}
									{ !inChain && isPreferredButDoesntPreferThem &&
										preferThisInterviewer.map(createPreferThisInterviewerMessage)
									}
									{/*{ inChain &&*/}
									{/*	<Fade>*/}
									{/*		<p className="my-0">This interviewer is in a chain of people whom all prefer different people, the system will try to schedule these members together.</p>*/}
									{/*	</Fade>*/}
									{/*}*/}
								</p>
							</td>
						</tr>
					}
			</React.Fragment>
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
				<br/>
				<FormGroup check>
					<Input type="checkbox" name="check" id="check" onChange={onShowWarningsChange}/>
					<Label for="check" check>Show Warnings</Label>
				</FormGroup>
				<br/>
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
			<CardFooter>
				In scenarios where there a chains of preferences. It will be considered that all of these people will
				be interviewing together. If there are un-matching times for preferences, it is not guaranteed that
				everyone will get their preferred time.
			</CardFooter>
		</Card>
	)
};

InterviewSelection.defaultProps = {
	value: [],
	onChange: () => {},
	actions: [],
};

export default InterviewSelection;