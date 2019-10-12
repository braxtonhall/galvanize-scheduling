import React from "react";
import {interfaces} from "adapter";
import {Button, Card, CardBody, CardHeader, CardSubtitle, CardTitle, Col, Row} from "reactstrap";
import {createMeeting} from "./ScheduleView";

type ISchedule = interfaces.ISchedule;
type IMeeting = interfaces.IMeeting;

interface IButton {
	text: string,
	onClick: (schedule: ISchedule) => (void | Promise<void>)
}

interface IProps {
	schedule: ISchedule
	actions?: IButton[]
}

const ScheduleActions: React.FC<IProps> = (props) => {
	const {schedule, actions} = props;
	const {candidate, meetings} = schedule;
	const {email, phoneNumber, firstName, lastName, position} = candidate;

	function createButton({text, onClick}: IButton, k: number): JSX.Element {
		function onClickWrapper(): void {
			onClick(schedule);
		}

		return <Button className="mr-3" onClick={onClickWrapper} color="primary" key={"schedule_actions_button_"+k}>{text}</Button>
	}

	return (
		<Card className="mt-4">
			<CardHeader>Actions</CardHeader>
			<CardBody>
				<CardTitle><h5>Candidate</h5></CardTitle>
				<CardSubtitle>name: <b>{firstName} {lastName}</b></CardSubtitle>
				<CardSubtitle>email: <b>{email}</b></CardSubtitle>
				<CardSubtitle>phone number: <b>{phoneNumber}</b></CardSubtitle>
				<CardSubtitle>position: <b>{position}</b></CardSubtitle>
				<hr/>
				<Row>
					{meetings.map(createMeetingCol)}
				</Row>
				{actions.map(createButton)}
			</CardBody>
		</Card>
	)
};

function createMeetingCol(meeting: IMeeting, index: number): JSX.Element {
	return (
		<Col md={4} className="mt-2" key={"meeting_"+index}>
			{createMeeting(meeting, index)}
		</Col>
	)
}

ScheduleActions.defaultProps = {
	actions: [],
};

export default ScheduleActions;