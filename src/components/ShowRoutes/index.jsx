import { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHandPointUp } from '@fortawesome/free-regular-svg-icons';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import styles from './ShowRoutes.module.scss';

const cx = classNames.bind(styles);

const ShowRoutes = ({ routes }) => {
	const [routesList, setRoutesList] = useState([]);
	const [garageList, setGarageList] = useState([]);

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
		if (routes?.length > 0) {
			const _garageList = routes.map((route) => route.garage_name);
			setGarageList([...new Set(_garageList)]);
			setRoutesList([...routes]);
		}

		// Auto scroll 100px down when show routes
		window.scrollTo({ top: 600, left: 0, behavior: 'smooth' });

		return () => {
			window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
		};
	}, [routes]);

	const garageOptionHandler = (e) => {
		e.stopPropagation();

		if (e.target.value !== '') {
			const _routes = routes.filter(
				(route) => route.garage_name === e.target.value
			);

			setRoutesList([..._routes]);
		}
	};

	const priceOptionHandler = (e) => {
		e.stopPropagation();

		if (e.target.value !== '') {
			const _routes = [...routes];

			if (e.target.value === '1') {
				_routes.sort((a, b) => a.price - b.price);
			} else {
				_routes.sort((a, b) => b.price - a.price);
			}

			setRoutesList([..._routes]);
		}
	};

	const closeHandler = () => {
		dispatch({ type: 'ROUTES/HIDE' });
	};

	const routeClickHandler = (scheduleId) => {
		dispatch({ type: 'SCHEDULE/VIEW', payload: scheduleId });
		navigate('/view-schedule');
	};

	return (
		<div
			className={cx('wrap')}
			style={{
				borderTopRightRadius: routes?.length > 4 ? '10px' : '20px',
				borderBottomRightRadius: routes?.length > 4 ? '10px' : '20px',
			}}
		>
			{routes?.length > 0 ? (
				<div>
					<div className={cx('header')}>
						<div className={cx('title')}>
							Tìm thấy {routes.length} chuyến xe phù hợp
						</div>
						<select
							className={cx('garage-option')}
							onChange={(e) => garageOptionHandler(e)}
						>
							<option value=''>Nhà xe</option>
							{garageList.map((garage, index) => (
								<option
									value={garage}
									key={index}
								>
									{garage}
								</option>
							))}
						</select>
						<select
							className={cx('price-option')}
							onChange={(e) => priceOptionHandler(e)}
						>
							<option value=''>Giá vé</option>
							<option value='1'>Giá thấp đến cao</option>
							<option value='2'>Giá cao đến thấp</option>
						</select>
						<button
							className={cx('close')}
							onClick={closeHandler}
						>
							Đóng
						</button>
					</div>
					{routesList.map((route, index) => (
						<div
							className={cx('item')}
							key={index}
							onClick={() => routeClickHandler(route.schedule_id)}
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
								<div className={cx('time-and-place')}>
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
										<div className={cx('start')}>
											<div className={cx('time')}>
												{formatTime(route.time)}
											</div>
											<div>•</div>
											<div className={cx('place')}>
												{route.start_place}
											</div>
										</div>
										<div className={cx('duration')}>
											{calculateHour(route.duration)}
										</div>
										<div className={cx('end')}>
											<div className={cx('time')}>
												{calculateTime(
													route.time,
													route.duration
												)}
											</div>
											<div>•</div>
											<div className={cx('place')}>
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
									{route.price.toLocaleString('vn-VN')}đ
								</div>
								<div className={cx('empty-seat')}>
									{`Còn ${route.empty_seats} chỗ trống`}
								</div>
								<button className={cx('choose-btn')}>
									Chọn chuyến
								</button>
							</div>
						</div>
					))}
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
