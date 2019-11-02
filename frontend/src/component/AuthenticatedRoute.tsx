import * as React from "react";
import {useContext} from "react";
import {Redirect, Route, RouteProps} from "react-router";
import Context from "../services/Context";

const AuthenticatedRoute: React.FC<RouteProps> = ({ component: Component, ...rest }) => {
	const {authenticated} = useContext(Context);
	return (
		<Route
			{...rest}
			render={async (props) => {
				if (!authenticated) {
					return <Redirect
						to={{
							pathname: "/login",
							state: {from: props.location}
						}}
					/>
				}

				// @ts-ignore
				return <Component {...props}/>
			}}
		/>
		)
};

export default AuthenticatedRoute;