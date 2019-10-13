import React, {useContext} from 'react';
import Context from "../services/Context";
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";

const ErrorModal: React.FC = () => {
	const {error, updateContext, operationsLoading} = useContext(Context);

	function close() {
		updateContext({error: undefined});
	}

	return (
		<Modal className="overflow-auto" isOpen={(error !== undefined && error !== null) && operationsLoading < 1} toggle={close}>
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