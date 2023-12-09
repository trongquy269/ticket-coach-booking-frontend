import { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import styles from './Ticket.module.scss';

const cx = classNames.bind(styles);

function Ticket({ scheduleId, seat, onclick, payments }) {
	const [schedule, setSchedule] = useState({});

	const navigate = useNavigate();
	const dispatch = useDispatch();

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

	const formatTime = (time) => {
		if (!time) return '';

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

	const calculateHour = (duration) => {
		const hour = Math.floor(duration / 60);
		const minute = duration % 60;

		return hour + 'h' + minute + 'm';
	};

	const clickHandler = () => {
		if (!onclick) return;

		dispatch({ type: 'SCHEDULE/VIEW', payload: schedule });
		navigate('/view-schedule');
	};

	useEffect(() => {
		axios
			.post('http://localhost:3000/schedule', {
				scheduleId,
			})
			.then((res) => {
				if (res?.data) {
					setSchedule({ ...res.data[0] });
				}
			})
			.catch((err) => console.log(err));
	}, []);

	return (
		<div
			className={cx('wrap')}
			onClick={clickHandler}
			style={{ cursor: onclick ? 'pointer' : 'default' }}
		>
			<div className={cx('title')}>Vé xe</div>
			<div className={cx('header')}>
				<div className={cx('garage_name')}>
					Nhà xe: {schedule.garage_name}
				</div>
				<div className={cx('date')}>
					Ngày: {formatDate(schedule.date)}
				</div>
			</div>
			<div className={cx('start-place')}>
				Nơi xuất phát: {schedule.start_place}
			</div>
			<div className={cx('end-place')}>Nơi đến: {schedule.end_place}</div>
			<div className={cx('time')}>
				<div>Thời gian bắt đầu: {formatTime(schedule.time)}</div>
				<div>
					Thời gian di chuyển: {calculateHour(schedule.duration)}
				</div>
			</div>
			<div className={cx('seat')}>
				<div>Ghế: {seat.length < 2 ? seat : seat.join(', ')}</div>
				<div>
					Giá vé:{' '}
					{(
						schedule.price * seat.length -
						(schedule.price * seat.length * schedule.discount) / 100
					).toLocaleString('vi-VN')}{' '}
					đồng
				</div>
			</div>
			<div className={cx('state')}>
				Trạng thái: {payments || 'Chưa thanh toán'}
			</div>
		</div>
	);
}

export default Ticket;
