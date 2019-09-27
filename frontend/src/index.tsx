import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as serviceWorker from './serviceWorker';
import { Root } from './services/Context';

ReactDOM.render(
	<Root/>,
	document.getElementById('root')
);

serviceWorker.unregister();
