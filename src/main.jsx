import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import rootReducer from './store/reducers/rootReducer.jsx';
import { GoogleOAuthProvider } from '@react-oauth/google';

const reduxStore = createStore(rootReducer);

ReactDOM.createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<Provider store={reduxStore}>
			<GoogleOAuthProvider clientId='1097821296752-acjoqhck9l7kmd2j0inuua30tf7dmfed.apps.googleusercontent.com'>
				<App />
			</GoogleOAuthProvider>
		</Provider>
	</React.StrictMode>
);
