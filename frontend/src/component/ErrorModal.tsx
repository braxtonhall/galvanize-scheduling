import React, {useContext} from 'react';
import Context from "../services/Context";
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";

const ErrorModal: React.FC = () => {
	const {error, updateContext} = useContext(Context);

	function close() {
		updateContext({error: undefined});
	}

	return (
		<Modal isOpen={error !== undefined && error !== null} toggle={close}>
			<ModalHeader toggle={close}>Error</ModalHeader>
			<ModalBody>
				{error}
			</ModalBody>
			<ModalFooter>
				<Button color="primary" onClick={close}>Okay</Button>
			</ModalFooter>
		</Modal>
	)
};

export default ErrorModal;