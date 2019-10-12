import React, {ChangeEventHandler} from "react";
import {Button, Card, CardBody, CardHeader, CardSubtitle, Input, Label} from "reactstrap";
import {interfaces} from "adapter";

type ICandidate = interfaces.ICandidate;

interface IProps {
	title?: string
	description?: string
	candidate?: ICandidate;
	onChange?: (candidate: ICandidate) => void;
	buttons?: Array<{text: string, onClick: (candidate: ICandidate) => (void | Promise<void>)}>
}

const CandidateForm: React.FC<IProps> = (props: IProps) => {

	const {candidate, buttons, title, description} = props;
	const {id, email, phoneNumber, firstName, lastName, position, notes} = candidate;

	function createOnChange(key: keyof ICandidate): ChangeEventHandler<HTMLInputElement> {
		return (e) => {
			props.onChange({...candidate, [key]: e.target.value});
		}
	}

	function createButton({text, onClick}: {text: string, onClick: (candidate: ICandidate) => (void | Promise<void>)}, k: number): JSX.Element {

		function onClickWrapper() {
			onClick(candidate)
		}

		return (<Button className="mt-4" color="primary" onClick={onClickWrapper} key={"candidate_form_button_" + k}>{text}</Button>)
	}

	return (
		<Card className="mt-4">
			{title && <CardHeader>{title}</CardHeader>}
			<CardBody>
				{description && <CardSubtitle className="mb-4">{description}</CardSubtitle>}
				{
					id &&
					<React.Fragment>
						<Label className="mt-2">ID</Label>
						< Input type="text" placeholder="enter email" disabled={true} value={id}/>
					</React.Fragment>
				}
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