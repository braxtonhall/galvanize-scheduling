import React, {useContext, useState} from "react";
import {Button, Card, CardBody, CardHeader, CardSubtitle, Col, Container, Input, Label, Row} from "reactstrap";
import Context from "../services/Context";
import createOnChange from "../services/createOnChange";
import {interfaces} from "adapter";

type ICandidate = interfaces.ICandidate;

interface IProps {
	candidate: ICandidate;
	onChange: (candidate: ICandidate) => void;
	buttons: Array<{text: string, onClick: () => (void | Promise<void>)}>
}

const CandidateForm: React.FC = () => {

	const [email, updateEmail] = useState("");
	const [phoneNumber, updatePhoneNumber] = useState("");
	const [firstName, updateFirstName] = useState("");
	const [lastName, updateLastName] = useState("");
	const [position, updatePosition] = useState("");
	const [notes, updateNotes] = useState("");

	const onChangeEmail = createOnChange(updateEmail);
	const onChangePhoneNumber = createOnChange(updatePhoneNumber);
	const onChangeFirstName = createOnChange(updateFirstName);
	const onChangeLastName = createOnChange(updateLastName);
	const onChangePosition = createOnChange(updatePosition);
	const onChangeNotes = createOnChange(updateNotes);

	return (
		<Card className="mt-4">
			<CardHeader>Enter a New Candidate</CardHeader>
			<CardBody>
				<CardSubtitle>Please input all new data for a candidate.</CardSubtitle>
				<Label className="mt-4">Email</Label>
				<Input type="email" placeholder="enter email" onChange={onChangeEmail} value={email}/>
				<Label className="mt-2">First Name</Label>
				<Input type="text" placeholder="enter first name" onChange={onChangeFirstName} value={firstName}/>
				<Label className="mt-2">Last Name</Label>
				<Input type="text" placeholder="enter last name" onChange={onChangeLastName} value={lastName}/>
				<Label className="mt-2">Phone Number</Label>
				<Input type="tel" placeholder="enter phone number" onChange={onChangePhoneNumber} value={phoneNumber}/>
				<Label className="mt-2">Position</Label>
				<Input type="text" placeholder="enter position candidate is applying for" onChange={onChangePosition} value={position}/>
				<Label className="mt-2">Notes</Label>
				<Input type="textarea" placeholder="enter any additional notes" onChange={onChangeNotes} value={notes}/>
				<Button className="mt-4" color="primary">Create Candidate</Button>
			</CardBody>
		</Card>
	);
};

export default CandidateForm;