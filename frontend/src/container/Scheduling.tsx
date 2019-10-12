import React, {useContext, useEffect, useState} from "react";
import {Col, Container, Row} from "reactstrap";
import CandidateList from "../component/CandidateList";
import adapter from "../services/Adapter";
import Context from "../services/Context";
import {interfaces} from "adapter";
import InterviewSelection from "../component/InterviewSelection";
import {InterviewSelectionValue} from "../component/InterviewSelection";
import ScheduleView from "../component/ScheduleView";
import ScheduleActions from "../component/ScheduleActions";
type ICandidate = interfaces.ICandidate;
type ISchedule = interfaces.ISchedule;
type IInterviewer = interfaces.IInterviewer;

const Scheduling: React.FC = () => {

	const {token, updateContext} = useContext(Context);
	const [candidates, updateCandidates] = useState<ICandidate[]>([]);
	const [interviewerValue, updateInterviewerValue] = useState<InterviewSelectionValue>();
	const [selectedCandidate, updateSelectedCandidate] = useState<ICandidate>();
	const [schedules, updateSchedules] = useState<ISchedule[]>();
	const [selectedSchedule, updateSelectedSchedule] = useState<ISchedule>();

	useEffect(() => {refreshCandidates().then()}, []);
	useEffect(() => {selectedCandidate && refreshInterviewers().then()}, [JSON.stringify(selectedCandidate)]);
	useEffect(() => {interviewerValue && refreshSchedules().then()}, [JSON.stringify(interviewerValue)]);

	async function refreshCandidates(): Promise<void> {
		const {success, data, error} = await adapter.getCandidates(token);
		if (success) {
			updateCandidates(data);
		} else if (error) {
			updateContext({error});
		} else {
			updateContext({error: "There was an error getting the candidates, please try again."})
		}
	}

	async function refreshInterviewers(): Promise<void> {
		const {success, data, error} = await adapter.getInterviewers(token);
		if (success) {
			const value: InterviewSelectionValue = data.map((i: IInterviewer) => {
				return {
					interviewer: i,
					minutes: 0,
					preference: undefined,
				} as any
			});
			updateInterviewerValue(value);
		} else if (error) {
			updateContext({error});
		} else {
			updateContext({error: "There was an error getting the interviewers, please try again."})
		}
	}

	async function refreshSchedules(): Promise<void> {
		// TODO: Fill out input for getSchedules()
		const {success, data, error} = await adapter.getSchedules(token, {});
		if (success) {
			updateSchedules(data);
		} else if (error) {
			updateContext({error});
		} else {
			updateContext({error: "There was an error getting the schedules, please try again."})
		}

	}

	function selectCandidate(candidate: ICandidate) {
		updateSelectedCandidate(candidate);
	}

	return (
		<Container className="mb-4">
			<Row>
				<Col md={12}>
					<CandidateList
						candidates={candidates}
						selected={selectedCandidate}
						actions={[{text: "Select", color: "primary", onClick: selectCandidate}]}
					/>
				</Col>
				{ selectedCandidate &&
					<Col md={12}>
						<InterviewSelection
							value={interviewerValue}
							onChange={updateInterviewerValue}
						/>
					</Col>
				}
				{
					schedules &&
					<Col md={12}>
						<ScheduleView
							schedules={schedules}
							onSelect={updateSelectedSchedule}
						/>
					</Col>
				}
				{
					selectedSchedule &&
					<Col md={12}>
						<ScheduleActions
							schedule={selectedSchedule}
							actions={[{text: "Schedule & Send Emails", onClick: () => {}}]}
						/>
					</Col>
				}
			</Row>
		</Container>
	);
};

export default Scheduling;