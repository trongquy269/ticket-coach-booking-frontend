import { useEffect, useState, Fragment } from 'react';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHandPointUp } from '@fortawesome/free-regular-svg-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import styles from './ShowRoutes.module.scss';
import SignInPopup from '../../components/SignInPopup';
import { trashIcon } from '../../store/icons';

const cx = classNames.bind(styles);

const ShowRoutes = () => {
	const [oriRoutes, setOriRoutes] = useState([]);
	const [routesList, setRoutesList] = useState([]);
	const [routeThresholdShow, setRouteThresholdRoute] = useState(5);
	const [garageList, setGarageList] = useState([]);
	const [roundTripNavState, setRoundTripNavState] = useState('left');
	const [filterTime, setFilterTime] = useState([]);
	const [filterCoachType, setFilterCoachType] = useState('');
	const [filterGarage, setFilterGarage] = useState([]);
	const [filterPrice, setFilterPrice] = useState('');

	const isRoundTrip = useSelector((state) => state.isRoundTrip);
	const fromTime = useSelector((state) => state.fromTime);
	const toTime = useSelector((state) => state.toTime);
	const startPlace = useSelector((state) => state.startPlaceID);
	const endPlace = useSelector((state) => state.endPlaceID);
	const rootScheduleID = useSelector((state) => state.scheduleID);
	const rootScheduleBackID = useSelector((state) => state.scheduleBackID);

	const dispatch = useDispatch();
	const navigate = useNavigate();

	const formatTime = (time) => {
		const timeArr = time.split(':');
		const hour = parseInt(timeArr[0]);
		const minute = parseInt(timeArr[1]);

		let result = hour + ':' + minute;

		if (hour < 10) {
			if (minute < 10) {
				result = '0' + hour + ':0' + minute;
			} else {
				result = '0' + hour + ':' + minute;
			}
		} else {
			if (minute < 10) {
				result = hour + ':0' + minute;
			}
		}

		return result;
	};

	const calculateTime = (time, duration) => {
		const hour = Math.floor(duration / 60);
		const minute = duration % 60;
		const timeArr = time.split(':');
		const hourArr = parseInt(timeArr[0]) + hour;
		const minuteArr = parseInt(timeArr[1]) + minute;

		let result = hourArr + ':' + minuteArr;

		if (hourArr < 10) {
			if (minuteArr < 10) {
				result = '0' + hourArr + ':0' + minuteArr;
			} else {
				result = '0' + hourArr + ':' + minuteArr;
			}
		} else {
			if (minuteArr < 10) {
				result = hourArr + ':0' + minuteArr;
			}
		}

		return result;
	};

	const calculateHour = (duration) => {
		const hour = Math.floor(duration / 60);
		const minute = duration % 60;

		return hour + 'h' + minute + 'm';
	};

	const formatDate = (date) => {
		const _date = new Date(date);
		const year = _date.getFullYear();
		const month = _date.getMonth() + 1;
		const day = _date.getDate();

		let result = day + '/' + month + '/' + year;

		if (month < 10) {
			if (day < 10) {
				result = '0' + day + '/0' + month + '/' + year;
			} else {
				result = day + '/0' + month + '/' + year;
			}
		} else {
			if (day < 10) {
				result = '0' + day + '/' + month + '/' + year;
			}
		}

		return result;
	};

	const createImgSrc = (typeCoach, numberSeat, garageName) => {
		const path = '/images/coach/background/';
		const str1 = typeCoach.toLowerCase();
		const str2 = numberSeat;
		const str3 = garageName.toLowerCase().replace(/\s/g, '-');

		return path + str1 + '-' + str2 + '-' + str3 + '.png';
	};

	useEffect(() => {
		if (oriRoutes?.length > 0) {
			const _garageList = oriRoutes.map((route) => route.garage_name);
			setGarageList([...new Set(_garageList)]);
		}

		// Auto scroll 100px down when show routes
		window.scrollTo({ top: 600, left: 0, behavior: 'smooth' });

		return () => {
			window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
		};
	}, [oriRoutes]);

	const closeHandler = () => {
		dispatch({ type: 'ROUTES/HIDE' });
	};

	const routeClickHandler = (scheduleId) => {
		if (isRoundTrip) {
			if (roundTripNavState === 'left') {
				if (scheduleId === rootScheduleID) {
					dispatch({ type: 'SCHEDULE_GO/CHANGE', payload: 0 });
					return;
				}

				dispatch({ type: 'SCHEDULE_GO/CHANGE', payload: scheduleId });

				if (rootScheduleBackID) {
					navigate(
						`/view-schedule?from=${scheduleId}&to=${rootScheduleBackID}`
					);
					return;
				}

				setRoundTripNavState('right');
			} else {
				if (scheduleId === rootScheduleBackID) {
					dispatch({ type: 'SCHEDULE_BACK/CHANGE', payload: 0 });
					return;
				}

				dispatch({ type: 'SCHEDULE_BACK/CHANGE', payload: scheduleId });

				if (rootScheduleID) {
					navigate(
						`/view-schedule?from=${rootScheduleID}&to=${scheduleId}`
					);
					return;
				}

				setRoundTripNavState('left');
			}
		} else {
			dispatch({ type: 'SCHEDULE/VIEW', payload: scheduleId });
			navigate(`/view-schedule?from=${scheduleId}`);
		}
	};

	const changeRoundtripState = (state) => {
		if (state === roundTripNavState) return;

		setRoundTripNavState(state);
	};

	const clearFilter = () => {
		setFilterTime([]);
		setFilterCoachType('');
		setFilterGarage([]);
		setFilterPrice('');
	};

	const filterTimeChange = (e, timeString) => {
		if (e.target.checked) {
			setFilterTime((prev) => [...prev, timeString]);
		} else {
			const newFilter = filterTime.filter((time) => time !== timeString);
			setFilterTime(newFilter);
		}
	};

	const filterGarageChange = (e, garageString) => {
		if (e.target.checked) {
			setFilterGarage((prev) => [...prev, garageString]);
		} else {
			const newFilter = filterGarage.filter(
				(garage) => garage !== garageString
			);
			setFilterGarage(newFilter);
		}
	};

	const getRouteInfo = async (timeline = 'start') => {
		if (timeline === 'start') {
			await axios
				.get('http://localhost:3000/schedule', {
					params: {
						startPlace,
						endPlace,
						startDate: fromTime,
					},
				})
				.then((res) => {
					if (res?.data?.length) {
						setOriRoutes(res.data);
					}
				})
				.catch((error) => console.log(error));
		} else {
			await axios
				.get('http://localhost:3000/schedule', {
					params: {
						startPlace: endPlace,
						endPlace: startPlace,
						startDate: toTime,
					},
				})
				.then((res) => {
					if (res?.data?.length) {
						setOriRoutes(res.data);
					}
				})
				.catch((error) => console.log(error));
		}
	};

	useEffect(() => {
		if (roundTripNavState === 'left') {
			getRouteInfo();
		} else {
			getRouteInfo('end');
		}
	}, [roundTripNavState]);

	useEffect(() => {
		if (oriRoutes.length > 0) {
			setRoutesList(oriRoutes);
			setRouteThresholdRoute(5);
		}
	}, [oriRoutes]);

	const renderDate = (dateString) => {
		const [day, month, year] = dateString.split('/').map(Number);
		const date = new Date(year, month - 1, day);
		const weekdayLong = date
			.toLocaleDateString('vi-VN', {
				weekday: 'short',
				timeZone: 'Asia/Ho_Chi_Minh',
			})
			.replace('Th', 'THỨ')
			.replace('CN', 'CHỦ NHẬT');
		const formattedDay = String(day).padStart(2, '0');
		const formattedMonth = String(month).padStart(2, '0');

		return `${weekdayLong}, ${formattedDay}/${formattedMonth}`;
	};

	const isTimeInRange = (timeString, startTime, endTime) => {
		// Convert times into "HH:mm" format for comparison
		const time = timeString.split(':').map(Number);
		const start = startTime.split(':').map(Number);
		const end = endTime.split(':').map(Number);

		// Convert to minutes for easier comparison
		const timeMinutes = time[0] * 60 + time[1];
		const startMinutes = start[0] * 60 + start[1];
		const endMinutes = end[0] * 60 + end[1];

		// Check if the time is within the range
		return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
	};

	// START: filter
	useEffect(() => {
		let routeFiltered = [...oriRoutes];
		let isTruthy = false;

		if (oriRoutes.length > 0) {
			// Filter time
			if (filterTime.length !== 0) {
				isTruthy = true;

				routeFiltered = routeFiltered.filter((route) => {
					let isTruthy = false;

					if (filterTime.includes('morning')) {
						isTruthy = isTimeInRange(route.time, '00:00', '06:00');

						if (isTruthy) {
							return route;
						}
					}

					if (filterTime.includes('afternoon')) {
						isTruthy = isTimeInRange(route.time, '06:00', '12:00');

						if (isTruthy) {
							return route;
						}
					}

					if (filterTime.includes('evening')) {
						isTruthy = isTimeInRange(route.time, '12:00', '18:00');

						if (isTruthy) {
							return route;
						}
					}

					if (filterTime.includes('night')) {
						isTruthy = isTimeInRange(route.time, '18:00', '00:00');

						if (isTruthy) {
							return route;
						}
					}

					return isTruthy;
				});
			}

			// Filter coach type
			if (!!filterCoachType) {
				isTruthy = true;

				routeFiltered = routeFiltered.filter(
					(route) =>
						route.type_coach.toLowerCase() ===
						filterCoachType.toLowerCase()
				);
			}

			// Filter garage
			if (filterGarage.length !== 0) {
				isTruthy = true;

				routeFiltered = routeFiltered.filter((route) =>
					filterGarage.includes(route.garage_name)
				);
			}

			// Filter price
			if (filterPrice === 'asc') {
				isTruthy = true;

				routeFiltered = routeFiltered.sort((a, b) => a.price - b.price);
			} else if (filterPrice === 'desc') {
				isTruthy = true;

				routeFiltered = routeFiltered.sort((a, b) => b.price - a.price);
			} else if (filterPrice === 'disc') {
				isTruthy = true;

				routeFiltered = routeFiltered.filter(
					(route) => route.discount !== 0
				);
			}

			if (isTruthy) {
				setRoutesList(routeFiltered);
			} else {
				setRoutesList(oriRoutes);
			}
		}
	}, [filterTime, filterCoachType, filterPrice, filterGarage]);
	// END: Filter

	return (
		<div className={cx('wrap')}>
			{oriRoutes?.length > 0 ? (
				<div className={cx('grid')}>
					<div className={cx('main')}>
						<div className={cx('heading')}>
							Tìm thấy {routesList.length} chuyến xe phù hợp
						</div>
						{isRoundTrip && (
							<div className={cx('roundtrip-nav')}>
								<button
									className={cx(
										roundTripNavState === 'left' && 'active'
									)}
									onClick={() => changeRoundtripState('left')}
								>
									CHUYẾN ĐI - {renderDate(fromTime)}
								</button>
								<button
									className={cx(
										roundTripNavState === 'right' &&
											'active'
									)}
									onClick={() =>
										changeRoundtripState('right')
									}
								>
									CHUYẾN VỀ - {renderDate(toTime)}
								</button>
							</div>
						)}
						{routesList
							.slice(0, routeThresholdShow)
							.map((route, index) => (
								<Fragment key={index}>
									{index === 1 && (
										<div className={cx('popup')}>
											<SignInPopup />
										</div>
									)}
									<div
										className={cx(
											'item',
											((roundTripNavState === 'left' &&
												rootScheduleID ===
													route.schedule_id) ||
												(roundTripNavState ===
													'right' &&
													rootScheduleBackID ===
														route.schedule_id)) &&
												'selected'
										)}
										onClick={() =>
											routeClickHandler(route.schedule_id)
										}
									>
										<img
											src={createImgSrc(
												route.type_coach,
												route.number_seat,
												route.garage_name
											)}
											alt=''
											className={cx('img')}
										/>
										<div className={cx('content')}>
											<div className={cx('title')}>
												Nhà xe {route.garage_name}
											</div>
											<div className={cx('type-coach')}>
												{route.type_coach +
													' ' +
													route.number_seat +
													' chỗ'}
											</div>
											<div
												className={cx('time-and-place')}
											>
												<svg
													className={cx('icon')}
													xmlns='http://www.w3.org/2000/svg'
													width='14'
													height='74'
													viewBox='0 0 14 74'
												>
													<path
														fill='none'
														stroke='#787878'
														strokeLinecap='round'
														strokeWidth='2'
														strokeDasharray='0 7'
														d='M7 13.5v46'
													></path>
													<g
														fill='none'
														stroke='#484848'
														strokeWidth='3'
													>
														<circle
															cx='7'
															cy='7'
															r='7'
															stroke='none'
														></circle>
														<circle
															cx='7'
															cy='7'
															r='5.5'
														></circle>
													</g>
													<path
														d='M7 58a5.953 5.953 0 0 0-6 5.891 5.657 5.657 0 0 0 .525 2.4 37.124 37.124 0 0 0 5.222 7.591.338.338 0 0 0 .506 0 37.142 37.142 0 0 0 5.222-7.582A5.655 5.655 0 0 0 13 63.9 5.953 5.953 0 0 0 7 58zm0 8.95a3.092 3.092 0 0 1-3.117-3.06 3.117 3.117 0 0 1 6.234 0A3.092 3.092 0 0 1 7 66.95z'
														fill='#787878'
													></path>
												</svg>
												<div>
													<div
														className={cx('start')}
													>
														<div
															className={cx(
																'time'
															)}
														>
															{formatTime(
																route.time
															)}
														</div>
														<div>•</div>
														<div
															className={cx(
																'place'
															)}
														>
															{route.start_place}
														</div>
													</div>
													<div
														className={cx(
															'duration'
														)}
													>
														{calculateHour(
															route.duration
														)}
													</div>
													<div className={cx('end')}>
														<div
															className={cx(
																'time'
															)}
														>
															{calculateTime(
																route.time,
																route.duration
															)}
														</div>
														<div>•</div>
														<div
															className={cx(
																'place'
															)}
														>
															{route.end_place}
														</div>
													</div>
												</div>
											</div>
										</div>
										<div className={cx('ticket')}>
											<div className={cx('date')}>
												<span>Ngày: </span>
												{formatDate(route.date)}
											</div>
											<div className={cx('price')}>
												<span>Chỉ từ </span>
												{route.price.toLocaleString(
													'vn-VN'
												)}
												đ
											</div>
											<div className={cx('empty-seat')}>
												{`Còn ${route.empty_seats} chỗ trống`}
											</div>
											<button
												className={cx('choose-btn')}
											>
												{(roundTripNavState ===
													'left' &&
													rootScheduleID ===
														route.schedule_id) ||
												(roundTripNavState ===
													'right' &&
													rootScheduleBackID ===
														route.schedule_id)
													? 'Đã chọn'
													: 'Chọn chuyến'}
											</button>
										</div>
									</div>
								</Fragment>
							))}
						{routeThresholdShow < routesList.length && (
							<div className={cx('show-more')}>
								<button
									onClick={() =>
										setRouteThresholdRoute(
											(prev) => prev + 5
										)
									}
								>
									Hiện thêm
								</button>
							</div>
						)}
					</div>
					<div className={cx('filter')}>
						<div className={cx('heading')}>
							<div className={cx('title')}>BỘ LỌC TÌM KIẾM</div>
							<div
								className={cx('icon')}
								onClick={clearFilter}
							>
								<div>Bỏ lọc</div>
								<div className={cx('trash')}>{trashIcon}</div>
							</div>
						</div>
						<div className={cx('option')}>
							<div className={cx('title')}>Giờ đi</div>
							<div className={cx('content')}>
								<div className={cx('item')}>
									<input
										type='checkbox'
										name='filter'
										id='morning'
										checked={filterTime.includes('morning')}
										onChange={(e) =>
											filterTimeChange(e, 'morning')
										}
									/>
									<label htmlFor='morning'>
										Sáng sớm 00:00 - 06:00 (0)
									</label>
								</div>
								<div className={cx('item')}>
									<input
										type='checkbox'
										name='filter'
										id='afternoon'
										checked={filterTime.includes(
											'afternoon'
										)}
										onChange={(e) =>
											filterTimeChange(e, 'afternoon')
										}
									/>
									<label htmlFor='afternoon'>
										Buổi trưa 06:00 - 12:00 (0)
									</label>
								</div>
								<div className={cx('item')}>
									<input
										type='checkbox'
										name='filter'
										id='evening'
										checked={filterTime.includes('evening')}
										onChange={(e) =>
											filterTimeChange(e, 'evening')
										}
									/>
									<label htmlFor='evening'>
										Buổi chiều 12:00 - 18:00 (0)
									</label>
								</div>
								<div className={cx('item')}>
									<input
										type='checkbox'
										name='filter'
										id='night'
										checked={filterTime.includes('night')}
										onChange={(e) =>
											filterTimeChange(e, 'night')
										}
									/>
									<label htmlFor='night'>
										Buổi tối 18:00 - 00:00 (0)
									</label>
								</div>
							</div>
						</div>
						<div className={cx('option')}>
							<div className={cx('title')}>Loại xe</div>
							<div className={cx('content')}>
								<div
									className={cx(
										'item',
										'--border',
										filterCoachType === 'ghế' && 'active'
									)}
									onClick={() => setFilterCoachType('ghế')}
								>
									Ghế
								</div>
								<div
									className={cx(
										'item',
										'--border',
										filterCoachType === 'giường' && 'active'
									)}
									onClick={() => setFilterCoachType('giường')}
								>
									Giường
								</div>
								<div
									className={cx(
										'item',
										'--border',
										filterCoachType === 'limousine' &&
											'active'
									)}
									onClick={() =>
										setFilterCoachType('limousine')
									}
								>
									Limousine
								</div>
							</div>
						</div>
						<div className={cx('option')}>
							<div className={cx('title')}>Nhà xe</div>
							<div className={cx('content')}>
								{garageList.map((garage, index) => (
									<div
										className={cx('item')}
										key={index}
									>
										<input
											type='checkbox'
											name='filter'
											id={garage}
											checked={filterGarage.includes(
												garage
											)}
											onChange={(e) =>
												filterGarageChange(e, garage)
											}
										/>
										<label htmlFor={garage}>{garage}</label>
									</div>
								))}
							</div>
						</div>
						<div className={cx('option')}>
							<div className={cx('title')}>Giá vé</div>
							<div className={cx('content')}>
								<div
									className={cx(
										'item',
										'--border',
										filterPrice === 'asc' && 'active'
									)}
									onClick={() => setFilterPrice('asc')}
								>
									Thấp - Cao
								</div>
								<div
									className={cx(
										'item',
										'--border',
										filterPrice === 'desc' && 'active'
									)}
									onClick={() => setFilterPrice('desc')}
								>
									Cao - Thấp
								</div>
								<div
									className={cx(
										'item',
										'--border',
										filterPrice === 'disc' && 'active'
									)}
									onClick={() => setFilterPrice('disc')}
								>
									Khuyến mãi
								</div>
							</div>
						</div>
					</div>
				</div>
			) : (
				<div
					className={cx('empty')}
					onClick={closeHandler}
				>
					<FontAwesomeIcon
						icon={faHandPointUp}
						className={cx('icon')}
					/>
					<p>
						Không tìm thấy chuyến xe nào phù hợp với lịch trình của
						bạn
					</p>
				</div>
			)}
		</div>
	);
};

export default ShowRoutes;
