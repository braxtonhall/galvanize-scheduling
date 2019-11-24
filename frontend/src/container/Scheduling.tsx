import React, {useContext, useEffect, useState} from "react";
import {
	Button,
	Col,
	Container,
	Modal,
	ModalBody,
	ModalFooter, ModalHeader,
	Row
} from "reactstrap";
import CandidateList from "../component/CandidateList";
import adapter from "../services/Adapter";
import Context from "../services/Context";
import {interfaces} from "adapter";
import InterviewSelection from "../component/InterviewSelection";
import {InterviewSelectionValue} from "../component/InterviewSelection";
import ScheduleView from "../component/ScheduleView";
import ScheduleActions from "../component/ScheduleActions";
import Fade from 'react-reveal/Fade';
type ICandidate = interfaces.ICandidate;
type ISchedule = interfaces.ISchedule;
type IInterviewer = interfaces.IInterviewer;

const Scheduling: React.FC = () => {

	const {token, startLoadingProcess, endLoadingProcess} = useContext(Context);
	const [candidates, updateCandidates] = useState<ICandidate[]>([]);
	const [interviewerValue, updateInterviewerValue] = useState<InterviewSelectionValue>();
	const [interviewerGroup, updateInterviewerGroup] = useState<string>(process.env.REACT_APP_DEFAULT_GROUP);
	const [selectedCandidate, updateSelectedCandidate] = useState<ICandidate>();
	const [schedules, updateSchedules] = useState<ISchedule[]>();
	const [selectedSchedule, updateSelectedSchedule] = useState<ISchedule>();
	const [modalOpen, updateModalOpen] = useState(false);

	useEffect(() => {refreshCandidates().then()}, []);
	useEffect(() => {selectedCandidate && refreshInterviewers().then()}, [JSON.stringify(selectedCandidate)]);

	async function closeModal() {
		updateModalOpen(false);
		await refreshCandidates();
	}

	function selectSchedule(schedule) {
		updateSelectedSchedule(schedule);
	}

	async function confirmSchedule(schedule): Promise<void> {
		startLoadingProcess();
		const {success, error} = await adapter.confirmSchedule(token, schedule);
		if (success) {
			updateInterviewerValue(undefined);
			updateSchedules(undefined);
			updateSelectedCandidate(undefined);
			updateSelectedSchedule(undefined);
			endLoadingProcess();
			updateModalOpen(true);
		} else if (error) {
			endLoadingProcess({error});
		} else {
			endLoadingProcess({error: "There was an error scheduling the meetings."})
		}
	}

	async function refreshCandidates(): Promise<void> {
		startLoadingProcess();
		const {success, data, error} = await adapter.getCandidates(token);
		if (success) {
			const onlyWithAvailabilities = data.filter(c => c.availability !== undefined && c.schedule === undefined);
			updateCandidates(onlyWithAvailabilities);
			endLoadingProcess();
		} else if (error) {
			endLoadingProcess({error});
		} else {
			endLoadingProcess({error: "There was an error getting the candidates, please try again."})
		}
	}

	async function refreshInterviewers(): Promise<void> {
		startLoadingProcess();
		const {success, data, error} = await adapter.getInterviewers(token, interviewerGroup);
		if (success) {
			const value: InterviewSelectionValue = data.map((i: IInterviewer) => {
				return {
					interviewer: i,
					minutes: 0,
					preference: undefined,
				} as any
			});
			updateInterviewerValue(value);
			endLoadingProcess();
		} else if (error) {
			endLoadingProcess({error});
		} else {
			endLoadingProcess({error: "There was an error getting the interviewers, please try again."})
		}
	}

	async function refreshSchedules(v: InterviewSelectionValue): Promise<void> {
		startLoadingProcess();
		const {success, data, error} = await adapter.getSchedules(token, {
			preferences: interviewerValue,
			candidate: selectedCandidate,
		});
		if (success) {
			updateSelectedSchedule(undefined);
			updateSchedules(data);
			endLoadingProcess();
		} else if (error) {
			endLoadingProcess({error});
		} else {
			endLoadingProcess({error: "There was an error getting the schedules, please try again."})
		}
	}

	function selectCandidate(candidate: ICandidate) {
		updateSelectedCandidate(candidate);
	}

	return (
		<React.Fragment>
			<Container className="mb-4">
				<Row>
					<Col md={12}>
						<Fade left>
							<CandidateList
								candidates={candidates}
								selected={selectedCandidate}
								actions={[{text: "Select", color: "primary", onClick: selectCandidate}]}
								noCandidatesMessage="There are no candidates that are eligible for scheduling."
							/>
						</Fade>
					</Col>
					{ selectedCandidate &&
						<Col md={12}>
							<Fade right>
								<InterviewSelection
									value={interviewerValue}
									onChange={updateInterviewerValue}
									actions={[{text: "Generate Schedules", onClick: refreshSchedules}]}
									group={interviewerGroup}
									onChangeGroup={updateInterviewerGroup}
									refresh={refreshInterviewers}
								/>
							</Fade>
						</Col>
					}
					{
						schedules &&
						<Col md={12}>
							<Fade left>
								<ScheduleView
									schedules={schedules}
									onSelect={selectSchedule}
								/>
							</Fade>
						</Col>
					}
					{
						selectedSchedule &&
						<Col md={12}>
							<Fade right>
								<ScheduleActions
									schedule={selectedSchedule}
									actions={[{text: "Schedule & Send Emails", onClick: confirmSchedule}]}
								/>
							</Fade>
						</Col>
					}
				</Row>
				{
					!selectedSchedule &&
						<React.Fragment>
							<br/>
								<div className="p-5"/>
							<br/>
						</React.Fragment>
				}
			</Container>
			<Modal isOpen={modalOpen}>
				<ModalHeader>Booked</ModalHeader>
				<ModalBody>
					You have successfully scheduled the candidate. All respective parties will have received invites.
				</ModalBody>
				<ModalFooter>
					<Button color="primary" onClick={closeModal}>Okay</Button>
				</ModalFooter>
			</Modal>
		</React.Fragment>
	);
};

export default Scheduling;