import React, {useContext, useEffect, useState} from "react";
import {
	Button,
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	CardSubtitle,
	CardText,
	CardTitle,
	Col,
	Container, Row
} from "reactstrap";
import {
	useParams
} from "react-router-dom";
import adapter from "../services/Adapter";
import Context from "../services/Context";
import {interfaces} from "adapter";
import AvailableTimes from 'react-available-times';
import moment, {Moment} from "moment";
import Fade from 'react-reveal/Fade';

type ICandidate = interfaces.ICandidate;
type IAvailability = interfaces.IAvailability;
type ITimeslot = interfaces.ITimeslot;

const CandidateAvailability: React.FC = (props) => {
	const {updateContext, startLoadingProcess, endLoadingProcess} = useContext(Context);
	const {candidateID} = useParams();
	const [candidate, updateCandidate] = useState<ICandidate>();
	const [availability, updateAvailability] = useState<IAvailability>([]);
	const [submitted, updateSubmitted] = useState<boolean>(false);
	const [hasBefore, updateHasBefore] = useState(false);

	useEffect(() => {
		if (!candidateID) {
			updateContext({error: "this link is invalid, please request a new one from Galvanize."});
			return;
		}
		startLoadingProcess();
		(async () => {
			const {success, data} = await adapter.getCandidateByID(candidateID);
			if (!success) {
				endLoadingProcess({error: "The candidate this link associated with does not exist."});
				return;
			}
			endLoadingProcess();
			updateCandidate(data);
		})();
	}, [candidateID]);

	function onChange(data: Array<{ start: Date, end: Date }>) {
		const d = data.map(({start, end}) => ({
			start: moment(start),
			end: moment(end),
		}));
		const now = moment.now();
		const _d = d.filter((d) => {return d.start.isAfter(now)});
		updateHasBefore(d.length !== _d.length);
		updateAvailability(_d);
	}

	async function submitAvailability(): Promise<void> {
		startLoadingProcess();
		const {success, error} = await adapter.submitAvailability(candidateID, availability);
		if (!success) {
			endLoadingProcess({error: "There was an error submitting your availability."});
			return;
		}
		updateSubmitted(true);
		endLoadingProcess();
	}

	function createScheduleCard(timeSlot: ITimeslot, i: number): JSX.Element {
		return (
			<Col md={4} sm={12} key={"time_slot_" + i}>
				<CardSubtitle><u>Meeting #{i + 1}</u></CardSubtitle>
				<CardSubtitle className="small"><b>{(timeSlot.start as Moment).format("MMM Do")}</b></CardSubtitle>
				<CardSubtitle className="small">{(timeSlot.start as Moment).format("h:mm a")} - {(timeSlot.end as Moment).format("h:mm a")}</CardSubtitle>
				{timeSlot.note && timeSlot.note.split(";").map(n => <CardSubtitle className="small">{n}</CardSubtitle>)}
			</Col>
		)
	}

	return (
		<Container>
			{
				candidate &&
					<React.Fragment>
						{
							candidate.schedule ?
								<Fade bottom>
									<Card className="mt-4">
										<CardHeader>Candidate Schedule</CardHeader>
										<CardBody>
											{candidate.firstName &&
											<CardTitle><h5>Hello {candidate.firstName},</h5></CardTitle>}
											<CardText>You have been booked for an interview. Please see the following
												information...</CardText>
											<Row>
												{candidate.schedule.map(createScheduleCard)}
											</Row>
										</CardBody>
									</Card>
								</Fade>
								:
								<Fade bottom>
									<Card className="mt-4">
										<CardHeader>Candidate Availability</CardHeader>
										<CardBody>
											{candidate.firstName &&
											<CardTitle><h5>Hello {candidate.firstName},</h5></CardTitle>}
											{!submitted ?
												<React.Fragment>
													<CardSubtitle>
														Please submit your available schedule so we can book a time with
														our interviewers.
													</CardSubtitle>
													<hr/>
													<AvailableTimes
														onChange={onChange}
														height="50vh"
														initialSelections={mapAvailabilityToInitial(candidate.availability)}
													/>
													{hasBefore && <Fade><p className="text-danger small mt-3">You currently have times selected in the past, these will not be submitted.</p></Fade>}
													<Button className="mt-3" onClick={submitAvailability}
															color="primary" disabled={availability.length < 1}>
														Submit Availability
													</Button>
												</React.Fragment> :
												<CardText>Thank you for submitting your availability, you may now close
													this page.</CardText>
											}
										</CardBody>
										{
											candidate.availability && !submitted &&
											<CardFooter>
												You have already submitted an availability! by submitting another, you
												will override your previous entry.
											</CardFooter>
										}
									</Card>
								</Fade>
						}
					</React.Fragment>
			}
		</Container>
	);
};

function mapAvailabilityToInitial(availability: IAvailability = []): Array<{start: Date, end: Date}> {
	console.log(availability);
	return availability.map(a => ({
		start: moment(a.start).toDate(),
		end: moment(a.end).toDate(),
	}))
}

export default CandidateAvailability;