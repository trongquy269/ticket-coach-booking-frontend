import { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { QRCodeSVG } from 'qrcode.react';

import styles from './Ticket.module.scss';
import { locationArrowIcon } from '../../store/icons';

const cx = classNames.bind(styles);

function Ticket ({
	                 scheduleId,
	                 seat,
	                 onclick,
	                 payments,
	                 price,
	                 isPaid = 0,
	                 ticketId = 0,
                 }) {
	const [schedule, setSchedule] = useState({});
	// console.log(price);

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
		if (!time) {
			return '';
		}

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
		if (!onclick) {
			return;
		}

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
	console.log(schedule);

	return (
		<div className={cx('wrap')}>
			<div className={cx('header')}>
				<div>
					<img
						src="/images/logo.png"
						alt="logo"
						className={cx('logo')}
					/>
					<div className={cx('title')}>COACH BOOKING</div>
				</div>
				<div>VÉ XE</div>
			</div>
			<div className={cx('main')}>
				<div className={cx('space-between')}>
					<div className={cx('block')}>
						<div className={cx('label')}>Tên khách hàng:</div>
						<div className={cx('input')}>Nguyễn Văn A</div>
					</div>
					<div className={cx('block')}>
						<div className={cx('label')}>Số điện thoại:</div>
						<div className={cx('input')}>0123456789</div>
					</div>
				</div>
				<div className={cx('grid-3-col')}>
					<div className={cx('block', 'break')}>
						<div className={cx('label')}>Lịch trình:</div>
						<div className={cx('input')}>
							<div className={cx('--red')}>
								{schedule.start_place}
							</div>
							<div className={cx('arrive-icon')}>
								{locationArrowIcon}
							</div>
							<div>{schedule.end_place}</div>
						</div>
					</div>
					<div className={cx('block', 'break')}>
						<div className={cx('label')}>Ngày khởi hành:</div>
						<div className={cx('input')}>
							{formatDate(schedule.date)}
						</div>
					</div>
					<div className={cx('block', 'break')}>
						<div className={cx('label')}>Giờ khởi hành:</div>
						<div className={cx('input')}>
							{formatTime(schedule.time)}
						</div>
					</div>
				</div>
				<div className={cx('grid-3-col')}>
					<div className={cx('block', 'break')}>
						<div className={cx('label')}>Nhà xe:</div>
						<div className={cx('input')}>
							{schedule.garage_name}
						</div>
					</div>
					<div className={cx('block', 'break')}>
						<div className={cx('label')}>Mã xe:</div>
						<div className={cx('input')}>
							{schedule.vehicle_number}
						</div>
					</div>
					<div className={cx('block', 'break')}>
						<div className={cx('label')}>Biển số xe:</div>
						<div className={cx('input')}>
							{schedule.license_plates}
						</div>
					</div>
				</div>
				<div className={cx('space-between')}>
					<div className={cx('block', '--magin-0')}>
						<div className={cx('space-between')}>
							<div className={cx('block', '--magin-0')}>
								<div className={cx('label')}>
									Vị trí {schedule.type_coach?.toLowerCase()}:
								</div>
								<div className={cx('input')}>
									{schedule.vehicle_number}
								</div>
							</div>
							<div className={cx('block', '--magin-0')}>
								<div className={cx('label')}>Giá vé:</div>
								<div className={cx('input')}>
									{price
									 ? price?.toLocaleString('vi-VN')
									 : schedule.price?.toLocaleString(
											'vi-VN',
										)}{' '}
									đồng
								</div>
							</div>
							<div className={cx('block', '--magin-0')}>
								<div className={cx('label')}>Chiếc khấu:</div>
								<div className={cx('input')}>
									{schedule.discount}%
								</div>
							</div>
						</div>
						<div className={cx('space-between')}>
							<div className={cx('block', '--magin-0')}>
								<div className={cx('label')}>Loại vé:</div>
								<div className={cx('input')}>Đi</div>
							</div>
							<div className={cx('block', '--magin-0')}>
								<div className={cx('label')}>Vé khứ hồi:</div>
								<div className={cx('input', 'checkbox')}>
									<input
										type="checkbox"
										defaultChecked
									/>
									<span className={cx('check-mask')}>
										&#x1F5F8;
									</span>
								</div>
							</div>
							<div className={cx('block', '--magin-0')}>
								<div className={cx('label')}>Thanh toán:</div>
								<div className={cx('input', 'checkbox')}>
									<input
										type="checkbox"
										defaultChecked
									/>
									<span className={cx('check-mask')}>
										&#x1F5F8;
									</span>
								</div>
							</div>
							<div className={cx('block', '--magin-0')}>
								<div className={cx('label')}>Xe tr. chuyển:</div>
								<div className={cx('input', 'checkbox')}>
									<input
										type="checkbox"
										defaultChecked
									/>
									<span className={cx('check-mask')}>
										&#x1F5F8;
									</span>
								</div>
							</div>
						</div>
					</div>
					<div className={cx('block', 'qr-code')}>
						<QRCodeSVG
							value={ticketId.toString()}
						/>
					</div>
				</div>
			</div>
			<div className={cx('footer')}></div>
		</div>
	);
}

export default Ticket;
