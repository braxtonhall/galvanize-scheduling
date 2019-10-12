import React, {useContext} from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from "react-router-dom";
import Header from "./component/Header";
import Login from './container/Login';
import AuthenticatedRoute from "./component/AuthenticatedRoute";
import ErrorModal from "./component/ErrorModal";
import CandidateMenu from "./container/CandidateMenu";
import Scheduling from "./container/Scheduling";
import Context from "./services/Context";
import CandidateAvailability from "./container/CandidateAvailability";

const App: React.FC = () => {
	const {token} = useContext(Context);

	return (
		<Router>
			<Header/>
			<ErrorModal/>
			<Switch>
				<AuthenticatedRoute exact path="/candidates" component={CandidateMenu} />
				<AuthenticatedRoute exact path="/scheduling" component={Scheduling} />
				<Route exact path="/login" component={Login} />
				<Route exact path="/submit_availability/:candidateID" component={CandidateAvailability} />
				<Redirect to="/login"/>
			</Switch>
		</Router>
	);
};

export default App;