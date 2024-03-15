import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';

import Home from '../views/Home';
import Schedule from '../views/Schedule';
import MySchedule from '../views/MySchedule';
import Manager from '../views/Manager';
import Profile from '../views/Profile';

const AppRouter = () => {
	const { user } = useSelector((state) => state.users);

	return (
		<Router>
			<Routes>
				<Route
					path='/'
					element={<Home />}
				/>
			</Routes>
			<Routes>
				<Route
					path='/view-schedule'
					element={<Schedule />}
				/>
			</Routes>
			<Routes>
				<Route
					path='/my-schedule'
					element={<MySchedule />}
				/>
			</Routes>

			<Routes>
				<Route
					path='/manager'
					element={<Manager />}
				/>
			</Routes>

			<Routes>
				<Route
					path='/profile'
					element={<Profile />}
				/>
			</Routes>
		</Router>
	);
};

export default AppRouter;
