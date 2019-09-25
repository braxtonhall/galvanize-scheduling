import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './container/App';
import * as serviceWorker from './serviceWorker';
import urls from "adapter";

console.log(urls);

ReactDOM.render(<App />, document.getElementById('root'));

serviceWorker.unregister();
