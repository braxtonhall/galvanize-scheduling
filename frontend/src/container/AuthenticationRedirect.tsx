import { RouteComponentProps, Redirect } from "react-router";
import React, {useContext, useEffect, useState} from "react";
import adapter from "../services/Adapter";
import Context from "../services/Context";

const AuthenticationRedirect: React.FC<RouteComponentProps<{token: string}>> = ({match}) => {
	const {startLoadingProcess, endLoadingProcess} = useContext(Context);
	const [authenticated, updateAuthentication] = useState();
	const token =  match.params.token;

	useEffect(() => {
		startLoadingProcess();
		adapter.checkToken(token)
			.then(({success, data}) => {
				if (success && data) {
					endLoadingProcess({token});
					updateAuthentication(true);
				} else {
					endLoadingProcess({error: "This is not an authenticated user. Please use an authenticated user."});
					updateAuthentication(false);
				}
			})
	}, [token]);

	if (authenticated === undefined) {
		return null;
	} else if (authenticated) {
		return  <Redirect to="/candidates"/>
	} else {
		return <Redirect to="/login"/>;
	}
};

export default AuthenticationRedirect;