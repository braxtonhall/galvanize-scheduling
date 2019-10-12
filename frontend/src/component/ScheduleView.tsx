import {Button, Card, CardBody, CardHeader, CardSubtitle, CardText, CardTitle, Col, Row} from "reactstrap";
import React from "react";
import { interfaces } from "adapter";

type ISchedule = interfaces.ISchedule;
type IMeeting = interfaces.IMeeting;

interface IProps {
	schedules?: ISchedule[];
	onSelect?: (schedule: ISchedule) => (void | Promise<void>);
}

const ScheduleView: React.FC<IProps> = (props: IProps) => {

	const {schedules, onSelect} = props;

	function createSchedule(schedule: ISchedule, index: number) {

		function select() {
			onSelect(schedule);
		}

		return (
			<Col md={4} sm={6} key={"Schedule_" + index }>
				<CardTitle><h5>Option #{index + 1}</h5></CardTitle>
				{schedule.meetings.map(createMeeting)}
				<Button onClick={select} color="primary">Select</Button>
				{index !== schedules.length - 1 && <hr/>}
			</Col>
		)
	}

	return (
		<Card className="mt-4">
			<CardHeader>Schedules</CardHeader>
			<CardBody>
				<Row>
					{
						schedules.length > 0
							? schedules.map(createSchedule)
							: <CardText>There are no available schedules.</CardText>
					}
				</Row>
			</CardBody>
		</Card>
	)
};

export function createMeeting(meeting: IMeeting, index: number) {
	const {startTime, endTime, room, interviewers} = meeting;
	const {name} = room;
	const interviewersElement = interviewers.map((i, k) => {
		return <CardSubtitle className="small" key={"interviewers_" + k}>{i.firstName} {i.lastName}</CardSubtitle>
	});
	return (
		<React.Fragment key={"Meeting_" + index }>
			<CardSubtitle><u>Meeting #{index + 1}</u></CardSubtitle>
			<CardSubtitle className="small">{startTime.format(formatString)} - {endTime.format(formatString)}</CardSubtitle>
			<CardSubtitle className="small">{name}</CardSubtitle>
			{interviewersElement}
			<br/>
		</React.Fragment>
	)
}

const formatString = "MMM Do h:mm a";

ScheduleView.defaultProps = {
	schedules: [],
	onSelect: () => {},
};

export default ScheduleView;