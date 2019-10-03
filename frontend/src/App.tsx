import React from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
import Header from "./component/Header";
import Login from './container/login';
import AuthenticatedRoute from "./component/AuthenticatedRoute";
import ErrorModal from "./component/ErrorModal";
import CandidateMenu from "./container/CandidateMenu";


const App: React.FC = () => {

	return (
		<Router>
			<Header/>
			<ErrorModal/>
			<AuthenticatedRoute exact path="/candidates" component={CandidateMenu} />
			<Route exact path="/login" component={Login} />
		</Router>
	);
};

export default App;
