import { useEffect, useState } from 'react';
import classnames from 'classnames/bind';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faVanShuttle } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

import styles from './Schedule.module.scss';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Seat from '../../components/Seat';
import Bill from '../../components/Bill';
import Notification from '../../components/Notification';
import ShowFeedback from '../../components/ShowFeedback';

const cx = classnames.bind(styles);
const BE_BASE_URL = import.meta.env.VITE_BE_BASE_URL;

const Schedule = () => {
	const [coachMove, setCoachMove] = useState('calc(18% - 100px)');
	const [seat, setSeat] = useState([]);
	const [closeBill, setCloseBill] = useState(true);
	const [isShowNotification, setIsShowNotification] = useState(false);
	const [hadBooked, setHadBooked] = useState('Đặt vé');
	const [isSelectSeat, setIsSelectSeat] = useState(true);
	const [message, setMessage] = useState('');
	const [isShowFeedback, setIsShowFeedback] = useState(false);
	const [isScrollTo, setIsScrollTo] = useState(false);

	const schedule = useSelector((state) => state.schedule);
	const user = useSelector((state) => state.users);

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
		let hourArr = parseInt(timeArr[0]) + hour;
		let minuteArr = parseInt(timeArr[1]) + minute;

		if (minuteArr >= 60) {
			minuteArr -= 60;
			hourArr += 1;
		}

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

	useEffect(() => {
		// Check ticket had been booked
		if (user.id !== 0) {
			axios
				.get(`${BE_BASE_URL}/booking`, {
					params: {
						scheduleId: schedule.schedule_id,
						userId: user.id,
					},
				})
				.then((res) => {
					if (res?.data) {
						res?.data?.message
							? setHadBooked('Đặt vé')
							: setHadBooked('Hủy vé');
					}
				})
				.catch((err) => console.log(err));
		}

		// Calculate the percentage of the coach icon's movement
		const currentTime = new Date();
		const currentHour = currentTime.getHours();
		const currentMinute = currentTime.getMinutes();
		const currentTotalMinutes = currentHour * 60 + currentMinute;
		const startTime = schedule.time.split(':');
		const startHour = parseInt(startTime[0]);
		const startMinute = parseInt(startTime[1]);
		const startTotalMinutes = startHour * 60 + startMinute;
		const intervalMinutes = currentTotalMinutes - startTotalMinutes;

		const scheduleDate = new Date(schedule.date);

		// Show feedbacks
		if (currentTime.getFullYear() > scheduleDate.getFullYear()) {
			setIsShowFeedback(true);
			setCoachMove('calc(100% - 101px)');
		} else if (currentTime.getFullYear() === scheduleDate.getFullYear()) {
			if (currentTime.getMonth() > scheduleDate.getMonth()) {
				setIsShowFeedback(true);
				setCoachMove('calc(100% - 101px)');
			} else if (currentTime.getMonth() === scheduleDate.getMonth()) {
				if (currentTime.getDate() > scheduleDate.getDate()) {
					setIsShowFeedback(true);
					setCoachMove('calc(100% - 101px)');
				} else if (currentTime.getDate() === scheduleDate.getDate()) {
					const [timeEndScheduleHours, timeEndScheduleMinutes] =
						calculateTime(schedule.time, schedule.duration)
							.split(':')
							.map(Number);
					const timeEndSchedule =
						timeEndScheduleHours * 60 + timeEndScheduleMinutes;
					if (currentTotalMinutes > timeEndSchedule) {
						setIsShowFeedback(true);
					} else {
						setIsShowFeedback(false);
					}

					const duration = schedule.duration;

					const percentage = intervalMinutes / duration;

					if (percentage >= 1) {
						setCoachMove('calc(100% - 101px)');
					} else {
						setCoachMove(
							`calc(16% + (100% - 16%) * ${percentage} - 100px)`
						);
						console.log((0.16 + (1 - 0.16)) * percentage);
					}
				} else {
					setIsShowFeedback(false);
					setCoachMove('70px');
				}
			} else {
				setIsShowFeedback(false);
				setCoachMove('70px');
			}
		} else {
			setIsShowFeedback(false);
			setCoachMove('70px');
		}

		// Check if the schedule is already happened or has 1 hour left, then you can't book ticket and cancel ticket
		if (
			scheduleDate < currentTime ||
			(scheduleDate === currentTime && intervalMinutes >= 60)
		) {
			setIsSelectSeat(false);
		}

		// Scroll to your feedback
		const currentUrl = window.location.href;

		if (currentUrl.includes('?')) {
			const tail = currentUrl.substring(currentUrl.lastIndexOf('?') + 1);

			if (tail.includes('feedback')) {
				setIsScrollTo(true);
			}
		}

		return () => {
			setIsScrollTo(false);
		};
	}, []);

	const createImgSrc = (typeCoach, numberSeat, garageName) => {
		const path = '/images/coach/background/';
		const str1 = typeCoach.toLowerCase();
		const str2 = numberSeat;
		const str3 = garageName.toLowerCase().replace(/\s/g, '-');

		return path + str1 + '-' + str2 + '-' + str3 + '.png';
	};

	useEffect(() => {
		if (isScrollTo) {
			window.scrollTo({ top: 1000, left: 0, behavior: 'smooth' });

			return () => {
				window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
			};
		}
	}, [isScrollTo]);

	const submit = () => {
		if (!isSelectSeat) {
			setMessage(
				'Quý khách không thể đặt vé hoặc hủy vé khi chuyến xe đã diễn ra hoặc còn 1 giờ nữa mới diễn ra.'
			);
			setIsShowNotification(true);

			setTimeout(() => {
				setIsShowNotification(false);
			}, 7300);

			return;
		}

		if (user.id === 0) {
			setMessage('Vui lòng đăng nhập tài khoản để tiến hành đặt vé.');
			setIsShowNotification(true);

			setTimeout(() => {
				setIsShowNotification(false);
			}, 7300);

			return;
		} else {
			if (hadBooked === 'Đặt vé') {
				setCloseBill(false);
			} else if (hadBooked === 'Hủy vé') {
				axios
					.delete(`${BE_BASE_URL}/booking`, {
						params: {
							scheduleId: schedule.schedule_id,
							userId: user.id,
						},
					})
					.then((res) => {
						if (res?.data?.message) {
							setHadBooked('Đặt vé');
							window.location.reload();
						}
					})
					.catch((err) => console.log(err));
			}
		}
	};

	return (
		<div className={cx('wrap')}>
			<Header />
			<div className={cx('content')}>
				<div className={cx('trip')}>
					<div className={cx('point')}>
						<FontAwesomeIcon
							className={cx('location-icon')}
							icon={faLocationDot}
						/>
						<div className={cx('name')}>{schedule.start_place}</div>
					</div>
					<div className={cx('duration')}>
						<div className={cx('time')}>
							<div>{formatTime(schedule.time)}</div>
							<div>{calculateHour(schedule.duration)}</div>
							<div>
								{calculateTime(
									schedule.time,
									schedule.duration
								)}
							</div>
						</div>
						<span className={cx('dot-icon')}></span>
						<div
							className={cx('distance')}
						>{`${schedule.distance} km`}</div>
						<FontAwesomeIcon
							className={cx('coach-icon')}
							icon={faVanShuttle}
							style={{
								left: coachMove,
							}}
						/>
					</div>
					<div className={cx('point')}>
						<FontAwesomeIcon
							className={cx('location-icon', '--red')}
							icon={faLocationDot}
						/>
						<div className={cx('name')}>{schedule.end_place}</div>
					</div>
				</div>
				<div className={cx('info-wrap')}>
					<Seat
						type={schedule.type_coach}
						list={schedule.seats}
						setSeat={setSeat}
						isSelectSeat={isSelectSeat}
					/>
					<div className={cx('info')}>
						<div className={cx('header')}>Thông tin chuyến xe</div>
						<div className={cx('coach-info')}>
							<img
								src={createImgSrc(
									schedule.type_coach,
									schedule.number_seat,
									schedule.garage_name
								)}
								alt=''
								className={cx('img')}
							/>
							<div className={cx('coach')}>
								<div className={cx('garage-name')}>
									Nhà xe: {schedule.garage_name}
								</div>
								<div className={cx('vehicle-number')}>
									Số xe: {schedule.vehicle_number}
								</div>
								<div className={cx('license-plates')}>
									Biển số: {schedule.license_plates}
								</div>
								<div className={cx('type-coach')}>
									Loại xe: {schedule.type_coach}
								</div>
								<div className={cx('number-seat')}>
									Số lượng {schedule.type_coach}
									{': '}
									{schedule.number_seat}
								</div>
							</div>
						</div>
						<div className={cx('date')}>
							Ngày: {formatDate(schedule.date)}
						</div>
						<div className={cx('start-place')}>
							Địa điểm xuất phát: {schedule.start_place}
						</div>
						<div className={cx('end-place')}>
							Địa điểm đến: {schedule.end_place}
						</div>
						<div className={cx('distance')}>
							Khoảng cách: {schedule.distance} km
						</div>
						<div className={cx('time')}>
							Thời gian khởi hành: {formatTime(schedule.time)}
						</div>
						<div className={cx('duration')}>
							Thời gian di chuyển ước tính:{' '}
							{calculateHour(schedule.duration)}
						</div>
						<div className={cx('price')}>
							Giá vé cho mỗi ghế:{' '}
							{schedule.price.toLocaleString('vn-VN')} đồng
						</div>
						{!isShowFeedback && (
							<button
								className={cx(
									'submit',
									isSelectSeat ? '' : 'disable'
								)}
								onClick={submit}
							>
								{hadBooked}
							</button>
						)}
						{isShowFeedback && (
							<ShowFeedback scheduleId={schedule.schedule_id} />
						)}
					</div>
				</div>
			</div>
			<Footer />
			{!closeBill && (
				<Bill
					scheduleId={schedule.schedule_id}
					seat={seat}
					onclick={false}
					setClose={setCloseBill}
				/>
			)}
			{isShowNotification && (
				<Notification
					type='error'
					message={message}
					timeout={7000}
				/>
			)}
		</div>
	);
};

export default Schedule;
