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
import Dropdown from '../Dropdown';
import ToastContainerComponent from '../../components/ToastContainerComponent';
import ToastComponent from '../../components/ToastComponent';

const cx = classNames.bind(styles);

const Search = () => {
	const [toastList, setToastList] = useState([]);
	const [startDate, setStartDate] = useState('');
	const [isShowCalendar, setIsShowCalendar] = useState(false);
	const [startPlaceList, setStartPlaceList] = useState([]);
	const [endPlaceList, setEndPlaceList] = useState([{ id: 0, name: '---' }]);
	const [isRoundTrip, setIsRoundTrip] = useState(false);
	const [isShowRoundTripCalendar, setIsShowRoundTripCalendar] =
		useState(false);
	const [startRoundTripDate, setStartRoundTripDate] = useState('');

	const calendarRef = useRef(null);
	const startPlaceRef = useRef(null);
	const endPlaceRef = useRef(null);
	const roundTripCalendar = useRef(null);

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
					let arr = res.data;
					arr.unshift({ id: 0, name: '---' });
					setStartPlaceList([...arr]);
				}
			})
			.catch((err) => console.log(err));
	}, []);

	useEffect(() => {
		if (startPlace === 0) {
			setEndPlaceList([{ id: 0, name: '---' }]);
		} else {
			axios
				.get('http://localhost:3000/end-by-start', {
					params: {
						start_id: startPlace,
					},
				})
				.then((res) => {
					if (res?.data) {
						// Sort list by alphabetically
						const list = res.data.sort((a, b) =>
							a.name.localeCompare(b.name)
						);
						setEndPlaceList(list);

						if (endPlace === 0) {
							dispatch({
								type: 'END_PLACE/CHANGE',
								payload: list[0].id,
							});
						}
					}
				})
				.catch((err) => console.log(err));
		}
	}, [startPlace]);

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
				roundTripCalendar.current &&
				!roundTripCalendar.current.contains(event.target)
			) {
				setIsShowRoundTripCalendar(false);
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
		} else if (isShowRoundTripCalendar) {
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
	}, [
		isShowCalendar,
		isShowRoundTripCalendar,
		isShowStartPlaceDropdown,
		isShowEndPlaceDropdown,
	]);

	const convertPlace = (e) => {
		e.stopPropagation();

		const temp = startPlace;

		dispatch({ type: 'START_PLACE/CHANGE', payload: endPlace });
		dispatch({ type: 'END_PLACE/CHANGE', payload: temp });
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
		if (isRoundTrip) {
			if (!!!startDate && !!!startRoundTripDate) {
				setToastList([
					...toastList,
					<ToastComponent
						type='error'
						content={`Vui lòng chọn ngày đi và ngày về`}
					/>,
				]);

				return;
			}

			if (!!!startDate) {
				setToastList([
					...toastList,
					<ToastComponent
						type='error'
						content={`Vui lòng chọn ngày đi`}
					/>,
				]);

				return;
			}

			if (!!!startRoundTripDate) {
				setToastList([
					...toastList,
					<ToastComponent
						type='error'
						content={`Vui lòng chọn ngày về`}
					/>,
				]);

				return;
			}
		}

		dispatch({
			type: 'ROUNDTRIP/CHANGE_STATE',
			payload: isRoundTrip,
		});
		dispatch({
			type: 'TIME/CHANGE',
			payload: { fromTime: startDate, toTime: startRoundTripDate },
		});
		dispatch({ type: 'ROUTES/SHOW' });
	};

	return (
		<>
			<div
				className={cx('wrap')}
				style={
					isRoundTrip ? { height: '260px', marginBottom: '80px' } : {}
				}
			>
				<div className={cx('heading')}>
					<div className={cx('item', 'active')}>
						<FontAwesomeIcon
							className={cx('icon')}
							icon={faBus}
						/>
						<div className={cx('title')}>Xe khách</div>
					</div>
					<div className={cx('item', 'disable')}>
						<FontAwesomeIcon icon={faVanShuttle} />
						<div className={cx('title')}>Thuê xe</div>
					</div>
				</div>
				<div className={cx('option')}>
					<div
						className={cx('option-item', !isRoundTrip && 'active')}
						onClick={() => setIsRoundTrip(false)}
					>
						<input
							type='radio'
							name='option-route'
							id='one-way'
							className={cx('option-input')}
							defaultChecked
						/>
						<label
							htmlFor='one-way'
							className={cx('option-label')}
						>
							Một chiều
						</label>
					</div>
					<div
						className={cx('option-item', isRoundTrip && 'active')}
						onClick={() => setIsRoundTrip(true)}
					>
						<input
							type='radio'
							name='option-route'
							id='round-trip'
							className={cx('option-input')}
						/>
						<label
							htmlFor='round-trip'
							className={cx('option-label')}
						>
							Khứ hồi
						</label>
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
								{startPlaceList.length &&
									startPlaceList.map(
										(item, index) =>
											item.id === startPlace && (
												<div
													className={cx(
														'description'
													)}
													key={index}
												>
													{item.name}
												</div>
											)
									)}
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
								{endPlaceList.length &&
									endPlaceList.map(
										(item, index) =>
											item.id === endPlace && (
												<div
													className={cx(
														'description'
													)}
													key={index}
												>
													{item.name}
												</div>
											)
									)}
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
								<Calendar setStartDate={setStartDate} />
							)}
						</div>
					</div>
					{isRoundTrip && (
						<div
							className={cx('input')}
							onClick={() =>
								setIsShowRoundTripCalendar((prev) => !prev)
							}
							ref={roundTripCalendar}
						>
							<FontAwesomeIcon
								className={cx('icon', '--red')}
								icon={faCalendar}
							/>
							<div className={cx('label')}>
								<div className={cx('title')}>Ngày về</div>
								<div className={cx('description')}>
									{startRoundTripDate === ''
										? 'Nhập ngày về'
										: startRoundTripDate}
								</div>
							</div>
							{isShowRoundTripCalendar && (
								<Calendar
									startDate={startDate}
									setStartDate={setStartRoundTripDate}
								/>
							)}
						</div>
					)}
					<div
						className={cx('input', 'submit')}
						onClick={handleSubmit}
						style={
							isRoundTrip
								? {
										bottom: '-96px',
										right: 'unset',
										borderRadius: '50px',
								  }
								: { position: 'relative' }
						}
					>
						Tìm tuyến
					</div>
				</div>
			</div>
			<ToastContainerComponent
				toastList={toastList}
				setToastList={setToastList}
			/>
		</>
	);
};

export default Search;
