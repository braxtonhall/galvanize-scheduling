import {ChangeEventHandler} from "react";

const createOnChange = (update: (v: any) => void): ChangeEventHandler<HTMLInputElement> => {
	return (e) => {
		update(e.target.value);
	}
};

export default createOnChange;