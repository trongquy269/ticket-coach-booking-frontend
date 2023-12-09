import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from '../views/Home';
import Schedule from '../views/Schedule';
import MySchedule from '../views/MySchedule';
import Manager from '../views/Manager';

const AppRouter = () => {
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
		</Router>
	);
};

export default AppRouter;
