import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';

import Home from '../views/Home';
import Schedule from '../views/Schedule';
import MySchedule from '../views/MySchedule';
import Manager from '../views/Manager';
import Profile from '../views/Profile';
import SearchSchedule from '../views/SearchSchedule';
import NotFound from '../views/NotFound';

const AppRouter = () => {
	const { user } = useSelector((state) => state.users);

	return (
		<Router>
			<Routes>
				<Route
					path='/'
					element={<Home />}
				/>
				<Route
					path='/home'
					element={<Home />}
				/>
				<Route
					path='/view-schedule'
					element={<Schedule />}
				/>
				<Route
					path='/my-schedule'
					element={<MySchedule />}
				/>
				<Route
					path='/manager'
					element={<Manager />}
				/>
				<Route
					path='/profile'
					element={<Profile />}
				/>
				<Route
					path='/search/schedule'
					element={<SearchSchedule />}
				/>

				{/* Catch all route for undefined routes */}
				<Route
					path='*'
					element={<NotFound />}
				/>
			</Routes>
		</Router>
	);
};

export default AppRouter;
