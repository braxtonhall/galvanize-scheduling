interface IAPIResponse<D = undefined, E = string> {
	success: boolean;
	data?: D;
	error?: E;
}

export default IAPIResponse;