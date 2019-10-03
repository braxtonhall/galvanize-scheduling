import React, {ChangeEventHandler, useContext, useState} from "react";
import {Button, Card, CardBody, CardHeader, CardSubtitle, Col, Container, Input, Label, Row} from "reactstrap";
import createOnChange from "../services/createOnChange";
import {interfaces} from "adapter";

type ICandidate = interfaces.ICandidate;

interface IProps {
	title?: string
	description?: string
	candidate?: ICandidate;
	onChange?: (candidate: ICandidate) => void;
	buttons?: Array<{text: string, onClick: () => (void | Promise<void>)}>
}

const CandidateForm: React.FC<IProps> = (props: IProps) => {

	const {candidate, onChange, buttons, title, description} = props;
	const {id, email, phoneNumber, firstName, lastName, position, notes} = candidate;

	function createOnChange(key: keyof ICandidate): ChangeEventHandler<HTMLInputElement> {
		return (e) => {
			onChange({...candidate, [key]: e.target.value});
		}
	}

	function createButton({text, onClick}: {text: string, onClick: () => (void | Promise<void>)}): JSX.Element {
		return (<Button className="mt-4" color="primary" onClick={onClick}>{text}</Button>)
	}

	return (
		<Card className="mt-4">
			{title && <CardHeader>{title}</CardHeader>}
			<CardBody>
				{description && <CardSubtitle>{description}</CardSubtitle>}
				<Label className="mt-2">ID</Label>
				<Input type="text" placeholder="enter email" contentEditable={false} value={id}/>
				<Label className="mt-2">Email</Label>
				<Input type="email" placeholder="enter email" onChange={createOnChange("email")} value={email}/>
				<Label className="mt-2">First Name</Label>
				<Input type="text" placeholder="enter first name" onChange={createOnChange("firstName")} value={firstName}/>
				<Label className="mt-2">Last Name</Label>
				<Input type="text" placeholder="enter last name" onChange={createOnChange("lastName")} value={lastName}/>
				<Label className="mt-2">Phone Number</Label>
				<Input type="tel" placeholder="enter phone number" onChange={createOnChange("phoneNumber")} value={phoneNumber}/>
				<Label className="mt-2">Position</Label>
				<Input type="text" placeholder="enter position candidate is applying for" onChange={createOnChange("position")} value={position}/>
				<Label className="mt-2">Notes</Label>
				<Input type="textarea" placeholder="enter any additional notes" onChange={createOnChange("notes")} value={notes}/>
				{buttons.map(createButton)}
			</CardBody>
		</Card>
	);
};

CandidateForm.defaultProps = {
	candidate: {
		email: "",
		phoneNumber: "",
		firstName: "",
		lastName: "",
		position: "",
		notes: ""
	},
	onChange: () => {},
	buttons: [],
};

export default CandidateForm;