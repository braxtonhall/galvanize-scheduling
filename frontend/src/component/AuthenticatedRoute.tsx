import * as React from "react";
import {useContext, useEffect} from "react";
import {Redirect, Route, RouteProps} from "react-router";
import Context from "../services/Context";

const AuthenticatedRoute: React.FC<RouteProps> = ({ component: Component, ...rest }) => {
	const context = useContext(Context);
	// useEffect(context.authenticateAndLogout, []);

	return (
		<Route
			{...rest}
			render={(props) => {

				if (!context.token || context.token.length < 1) {
					return <Redirect
						to={{
							pathname: "/login",
							state: {from: props.location}
						}}
					/>
				}

				context.authenticateAndLogout();

				// @ts-ignore
				return <Component {...props}/>
			}}
		/>
		)
};

export default AuthenticatedRoute;