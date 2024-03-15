import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faBus,
	faCalendar,
	faLocationDot,
	faRepeat,
	faVanShuttle,
} from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';

import styles from './Search.module.scss';
import Calendar from '../Calendar';
import Slider from '../Slider';
import Dropdown from '../Dropdown';

const cx = classNames.bind(styles);

const images = [
	'/images/slider3.png',
	'/images/slider1.jpg',
	'/images/slider2.jpg',
];

const Search = () => {
	const [startDate, setStartDate] = useState('');
	const [isShowCalendar, setIsShowCalendar] = useState(false);
	const [startPlaceList, setStartPlaceList] = useState([]);
	const [endPlaceList, setEndPlaceList] = useState([]);

	const calendarRef = useRef(null);
	const startPlaceRef = useRef(null);
	const endPlaceRef = useRef(null);

	const dispatch = useDispatch();
	const startPlace = useSelector((state) => state.startPlaceID);
	const endPlace = useSelector((state) => state.endPlaceID);
	const isShowStartPlaceDropdown = useSelector(
		(state) => state.isShowStartPlaceDropdown
	);
	const isShowEndPlaceDropdown = useSelector(
		(state) => state.isShowEndPlaceDropdown
	);

	useEffect(() => {
		axios
			.get('http://localhost:3000/start-point')
			.then((res) => {
				if (res?.data) {
					setStartPlaceList(res.data);
				}
			})
			.catch((err) => console.log(err));

		axios
			.get('http://localhost:3000/end-point')
			.then((res) => {
				if (res?.data) {
					setEndPlaceList(res.data);
				}
			})
			.catch((err) => console.log(err));
	}, []);

	useEffect(() => {
		// Function to close the calendar when clicking outside of it
		const handleClickOutside = (event) => {
			if (
				calendarRef.current &&
				!calendarRef.current.contains(event.target)
			) {
				setIsShowCalendar(false);
			}

			if (
				startPlaceRef.current &&
				!startPlaceRef.current.contains(event.target)
			) {
				dispatch({ type: 'START_PLACE/HIDE' });
			}

			if (
				endPlaceRef.current &&
				!endPlaceRef.current.contains(event.target)
			) {
				dispatch({ type: 'END_PLACE/HIDE' });
			}
		};

		// Add event listener when the calendar is visible
		if (isShowCalendar) {
			document.addEventListener('click', handleClickOutside);
		} else if (isShowStartPlaceDropdown) {
			document.addEventListener('click', handleClickOutside);
		} else if (isShowEndPlaceDropdown) {
			document.addEventListener('click', handleClickOutside);
		} else {
			// Remove the event listener when the calendar is hidden
			document.removeEventListener('click', handleClickOutside);
		}

		// Clean up the event listener on unmount
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	}, [isShowCalendar, isShowStartPlaceDropdown, isShowEndPlaceDropdown]);

	const convertPlace = (e) => {
		e.stopPropagation();

		dispatch({ type: 'START_PLACE/CHANGE', payload: endPlace });
		dispatch({ type: 'END_PLACE/CHANGE', payload: startPlace });
	};

	const startPlaceHandle = () => {
		if (isShowStartPlaceDropdown) {
			dispatch({ type: 'START_PLACE/HIDE' });
		} else {
			dispatch({ type: 'START_PLACE/SHOW' });
		}
	};

	const endPlaceHandle = () => {
		if (isShowEndPlaceDropdown) {
			dispatch({ type: 'END_PLACE/HIDE' });
		} else {
			dispatch({ type: 'END_PLACE/SHOW' });
		}
	};

	const handleSubmit = () => {
		axios
			.get('http://localhost:3000/schedule', {
				params: {
					startPlace,
					endPlace,
					startDate,
				},
			})
			.then((res) => {
				if (res?.data?.length) {
					dispatch({ type: 'ROUTES/CHANGE', payload: res.data });
				}

				dispatch({ type: 'ROUTES/SHOW' });
			})
			.catch((error) => console.log(error));
	};

	return (
		<div className={cx('wrap')}>
			<Slider images={images} />

			<div className={cx('search')}>
				<div className={cx('heading')}>
					<div className={cx('item', 'active')}>
						<FontAwesomeIcon
							className={cx('icon')}
							icon={faBus}
						/>
						<div className={cx('title')}>Xe khách</div>
					</div>
					<div className={cx('item')}>
						<FontAwesomeIcon icon={faVanShuttle} />
						<div className={cx('title')}>Thuê xe</div>
					</div>
				</div>
				<div className={cx('interact')}>
					<div className={cx('route')}>
						<div
							className={cx('input')}
							onClick={startPlaceHandle}
							ref={startPlaceRef}
						>
							<FontAwesomeIcon
								className={cx('icon')}
								icon={faLocationDot}
							/>
							<div className={cx('label')}>
								<div className={cx('title')}>Nơi xuất phát</div>
								<div className={cx('description')}>
									{startPlaceList.length &&
										startPlaceList[startPlace - 1].name}
								</div>
							</div>
							<div
								className={cx('convert')}
								onClick={(e) => convertPlace(e)}
							>
								<FontAwesomeIcon icon={faRepeat} />
							</div>
							{isShowStartPlaceDropdown && (
								<Dropdown data={startPlaceList} />
							)}
						</div>
						<div
							className={cx('input')}
							onClick={endPlaceHandle}
							ref={endPlaceRef}
						>
							<FontAwesomeIcon
								className={cx('icon', '--red')}
								icon={faLocationDot}
							/>
							<div className={cx('label')}>
								<div className={cx('title')}>Nơi đến</div>
								<div className={cx('description')}>
									{endPlaceList.length &&
										endPlaceList[endPlace - 1].name}
								</div>
							</div>
							{isShowEndPlaceDropdown && (
								<Dropdown data={endPlaceList} />
							)}
						</div>
						<div
							className={cx('input')}
							onClick={() => setIsShowCalendar((prev) => !prev)}
							ref={calendarRef}
						>
							<FontAwesomeIcon
								className={cx('icon')}
								icon={faCalendar}
							/>
							<div className={cx('label')}>
								<div className={cx('title')}>Ngày đi</div>
								<div className={cx('description')}>
									{startDate === ''
										? 'Nhập ngày đi'
										: startDate}
								</div>
							</div>
							{isShowCalendar && (
								<Calendar
									startDate={startDate}
									setStartDate={setStartDate}
								/>
							)}
						</div>
					</div>
					<div
						className={cx('input')}
						onClick={handleSubmit}
					>
						Tìm tuyến
					</div>
				</div>
			</div>
		</div>
	);
};

export default Search;
