import Cookies from 'js-cookie';
import jwt from 'jwt-decode';

const initState = {
	users: {
		id: 0,
		name: '',
		role: '',
		token: '',
	},
	isShowAccountForm: false,
	startPlaceID: 0,
	endPlaceID: 0,
	isShowStartPlaceDropdown: false,
	isShowEndPlaceDropdown: false,
	routes: [],
	isShowRoutes: false,
	scheduleID: 0,
	managerState: 'manager-garage/view',
	search: { id: 0, type: '' },
};

const token = Cookies.get('token');
if (token) {
	const decoded = jwt(token);
	initState.users = {
		id: decoded.id,
		name: decoded.name,
		role: decoded.role,
		token: token,
	};
}

// Get the schedule from localStorage
const schedule = localStorage.getItem('schedule');
if (schedule) {
	initState.scheduleID = JSON.parse(schedule);
}

const rootReducer = (state = initState, action) => {
	switch (action.type) {
		case 'LOGIN':
			return {
				...state,
				users: { ...action.payload },
			};

		case 'LOGOUT':
			var newState = {
				...state,
				users: {
					id: 0,
					name: '',
					role: '',
					token: '',
				},
			};

			// Remove token from Cookies
			Cookies.remove('token');

			return newState;

		case 'ACCOUNT_FORM/SHOW':
			return {
				...state,
				isShowAccountForm: true,
			};

		case 'ACCOUNT_FORM/HIDE':
			return {
				...state,
				isShowAccountForm: false,
			};

		case 'START_PLACE/CHANGE':
			return {
				...state,
				startPlaceID: action.payload,
			};

		case 'END_PLACE/CHANGE':
			return {
				...state,
				endPlaceID: action.payload,
			};

		case 'START_PLACE/SHOW':
			return {
				...state,
				isShowStartPlaceDropdown: true,
			};

		case 'START_PLACE/HIDE':
			return {
				...state,
				isShowStartPlaceDropdown: false,
			};

		case 'END_PLACE/SHOW':
			return {
				...state,
				isShowEndPlaceDropdown: true,
			};

		case 'END_PLACE/HIDE':
			return {
				...state,
				isShowEndPlaceDropdown: false,
			};

		case 'ROUTES/CHANGE':
			return {
				...state,
				routes: [...action.payload],
			};

		case 'ROUTES/SHOW':
			return {
				...state,
				isShowRoutes: true,
			};

		case 'ROUTES/HIDE':
			return {
				...state,
				isShowRoutes: false,
			};

		case 'SCHEDULE/VIEW':
			// Save the schedule to localStorage
			localStorage.setItem('schedule', JSON.stringify(action.payload));

			return {
				...state,
				scheduleID: action.payload,
			};

		case 'SCHEDULE/SET_DISCOUNT':
			return {
				...state,
				schedule: {
					...state.schedule,
					discount: action.payload,
				},
			};

		case 'MANAGER/CHANGE_STATE':
			return {
				...state,
				managerState: action.payload,
			};

		case 'SEARCH/SET':
			return {
				...state,
				search: action.payload,
			};

		case 'SEARCH/CLEAR':
			return {
				...state,
				search: { id: 0, type: '' },
			};

		default:
			return state;
	}
};

export default rootReducer;
