import React, {useContext} from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from "react-router-dom";
import Header from "./component/Header";
import Login from './container/Login';
import AuthenticatedRoute from "./component/AuthenticatedRoute";
import ErrorModal from "./component/ErrorModal";
import CandidateMenu from "./container/CandidateMenu";
import Scheduling from "./container/Scheduling";
import CandidateAvailability from "./container/CandidateAvailability";
import LoadingOverlay from "react-loading-overlay";
import Context from "./services/Context";
import {Spinner} from "reactstrap";
import AuthenticationRedirect from "./container/AuthenticationRedirect";

const App: React.FC = () => {
	const {operationsLoading} = useContext(Context);

	return (
		<LoadingOverlay
			className="min-vh-100"
			active={operationsLoading > 0}
			spinner={<Spinner color="white"/>}
			fadeSpeed={300}
			styles={{
				overlay: (base: HTMLStyleElement) => ({
					...base,
					background: 'rgba(0, 0, 0, 0.5)'
				})
			}}
		>
			<Router>
				<Header/>
				<ErrorModal/>
				<Switch>
					<AuthenticatedRoute exact path="/candidates" component={CandidateMenu} />
					<AuthenticatedRoute exact path="/scheduling" component={Scheduling} />
					<Route exact path="/auth/:token" component={AuthenticationRedirect} />
					<Route exact path="/login" component={Login} />
					<Route exact path="/submit_availability/:candidateID" component={CandidateAvailability} />
					<Redirect to="/login"/>
				</Switch>
			</Router>
		</LoadingOverlay>
	);
};

export default App;