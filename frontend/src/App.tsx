import React from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import Header from "./component/Header";


const App: React.FC = () => {
	return (
		<Router>
			<div>
				<Header />

				{/*<Route exact path="/" component={Home} />*/}
				{/*<Route path="/about" component={About} />*/}
				{/*<Route path="/topics" component={Topics} />*/}
			</div>
		</Router>
	);
};

export default App;
