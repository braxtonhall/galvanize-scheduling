import React, {useContext} from 'react';
import {BrowserRouter as Router, Route, Redirect, Switch} from "react-router-dom";
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
import Rooms from "./container/Rooms";
import Fade from 'react-reveal/Fade';
import About from "./container/About";

const App: React.FC = () => {
	const {operationsLoading} = useContext(Context);

	return (
		<React.Fragment>
			<LoadingOverlay
				className="min-vh-100 m-0 p-0"
				active={operationsLoading > 0}
				spinner={<Spinner color="white"/>}
				fadeSpeed={300}
				styles={{
					overlay: (base: HTMLStyleElement) => ({
						...base,
						background: 'rgba(0, 0, 0, 0.5)',
						position: "fixed"
					})
				}}
			>
				<Router>
					<Fade top>
						<Header/>
					</Fade>
					<ErrorModal/>
					<Switch>
						<AuthenticatedRoute exact path="/candidates" component={CandidateMenu}/>
						<AuthenticatedRoute exact path="/scheduling" component={Scheduling}/>
						<AuthenticatedRoute exact path="/rooms" component={Rooms}/>
						<AuthenticatedRoute exact path="/about" component={About}/>
						<Route exact path="/auth/:token" component={AuthenticationRedirect}/>
						<Route exact path="/login" component={Login}/>
						<Route exact path="/submit_availability/:candidateID" component={CandidateAvailability}/>
						<Redirect to="/login"/>
					</Switch>
				</Router>
			</LoadingOverlay>
		</React.Fragment>
	);
};

export default App;