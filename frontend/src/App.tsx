import React from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
import Header from "./component/Header";
import Login from './container/login';
import AuthenticatedRoute from "./component/AuthenticatedRoute";
import ErrorModal from "./component/ErrorModal";
import CandidateList from "./component/CandidateList";


const App: React.FC = () => {

	return (
		<Router>
			<Header/>
			<ErrorModal/>
			<AuthenticatedRoute exact path="/" component={Header} />
			<Route exact path="/create-candidate" component={CandidateList} />
			<Route exact path="/login" component={Login} />
		</Router>
	);
};

export default App;
