import React from 'react';
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import Header from "./component/Header";
import Login from './container/login';
import AuthenticatedRoute from "./component/AuthenticatedRoute";
import ErrorModal from "./component/ErrorModal";
import CandidateMenu from "./container/CandidateMenu";
import Scheduling from "./container/Scheduling";


const App: React.FC = () => {

	return (
		<Router>
			<Header/>
			<ErrorModal/>
			<AuthenticatedRoute exact path="/candidates" component={CandidateMenu} />
			<AuthenticatedRoute exact path="/scheduling" component={Scheduling} />
			<Route exact path="/login" component={Login} />
			{/*<Route component={() => (<Redirect to="/login"/>)} />*/}
		</Router>
	);
};

export default App;
