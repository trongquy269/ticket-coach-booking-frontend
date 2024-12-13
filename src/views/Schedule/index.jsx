import { useEffect, useState, useRef } from 'react';
import classnames from 'classnames/bind';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

import styles from './Schedule.module.scss';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Seat from '../../components/Seat';
import PayOnline from '../../components/PayOnline';
import ShowFeedback from '../../components/ShowFeedback';
import QuickRegisterForm from '../../components/QuickRegisterForm';
import ToastContainerComponent from '../../components/ToastContainerComponent';
import ToastComponent from '../../components/ToastComponent';
import {
	isVietnamesePhoneNumber,
	cityShortener,
	scrollToElement,
	isMoreThanFourHours,
} from '../../store/actions';
import {
	infoCircleIcon,
	busIcon,
	arrowRightIcon,
	ticketPercentIcon,
} from '../../store/icons';

const cx = classnames.bind(styles);
const BE_BASE_URL = import.meta.env.VITE_BE_BASE_URL;

const Schedule = () => {
	const dispatch = useDispatch();
	const searchURL = useLocation().search;
	const scheduleId = +new URLSearchParams(searchURL).get('from');
	const user = useSelector((state) => state.users);
	const scheduleBackId = +new URLSearchParams(searchURL).get('to');
	const isRoundTrip = !!scheduleId && !!scheduleBackId;
	const goSeats = useSelector((state) => state.seats);
	const backSeats = useSelector((state) => state.seatsBack);

	const [toastList, setToastList] = useState([]);
	const [schedule, setSchedule] = useState({});
	const [scheduleBack, setScheduleBack] = useState({});
	const [hadBooked, setHadBooked] = useState(false);
	const [isSelectSeat, setIsSelectSeat] = useState(true);
	const [isSelectSeatBack, setIsSelectSeatBack] = useState(true);
	const [isShowFeedback, setIsShowFeedback] = useState(false);
	const [isShowFeedback2, setIsShowFeedback2] = useState(false);
	const [isScrollTo, setIsScrollTo] = useState(false);
	const [nameField, setNameField] = useState('');
	const [phoneField, setPhoneField] = useState('');
	const [errorField, setErrorField] = useState('');
	const [acceptPolicy, setAcceptPolicy] = useState(true);
	const [goSeatDefault, setGoSeatDefault] = useState('');
	const [backSeatDefault, setBackSeatDefault] = useState('');
	const [isPaid, setIsPaid] = useState(false);
	const [goShuttleBusName, setGoShuttleBusName] = useState(user.name);
	const [backShuttleBusName, setBackShuttleBusName] = useState(user.name);
	const [goShuttleBusPhone, setGoShuttleBusPhone] = useState(user.phone);
	const [backShuttleBusPhone, setBackShuttleBusPhone] = useState(user.phone);
	const [goShuttleBusAddress, setGoShuttleBusAddress] = useState('');
	const [backShuttleBusAddress, setBackShuttleBusAddress] = useState('');
	const [ticketId, setTicketId] = useState(0);
	const [goSeatPaid, setGoSeatPaid] = useState([]);
	const [backSeatPaid, setBackSeatPaid] = useState([]);
	const [isEditShuttleBus, setIsEditShuttleBus] = useState(false);
	const [shuttleBusInfo, setShuttleBusInfo] = useState({});
	const [isEditSeat, setIsEditSeat] = useState(false);
	const [ticketPrice, setTicketPrice] = useState(0);

	const shuttleBusRef = useRef(null);
	const registerFormRef = useRef(null);
	const paymentFormRef = useRef(null);

	const getScheduleInfo = () => {
		axios
			.post(`${BE_BASE_URL}/schedule`, {
				scheduleId,
			})
			.then((res) => {
				if (res?.data) {
					setSchedule({ ...res.data[0] });
				}
			})
			.catch((err) => {
				console.log(err);
			});

		if (isRoundTrip || scheduleBackId) {
			axios
				.post(`${BE_BASE_URL}/schedule`, {
					scheduleId: scheduleBackId,
				})
				.then((res) => {
					if (res?.data) {
						setScheduleBack({ ...res.data[0] });
					}
				})
				.catch((err) => {
					console.log(err);
				});
		}
	};

	useState(() => {
		// Check schedule is booked
		if (!!user.id) {
			axios
				.post(`${BE_BASE_URL}/check/is-booked`, {
					userId: user.id,
					scheduleId,
				})
				.then((res) => {
					if (res?.data?.message === 'Ticket booked') {
						setHadBooked(true);
						setTicketId(res.data.ticketId);
						setGoSeatPaid(res.data.goSeats);
						setBackSeatPaid(res.data.backSeats);
						setTicketPrice(res.data.price);
						setIsShowFeedback(true);
						setIsShowFeedback2(true);
					}
				})
				.catch((error) => {
					console.error(error);
				});
		}

		getScheduleInfo();
	}, []);

	useEffect(() => {
		if (goSeatPaid.length !== 0) {
			dispatch({
				type: 'SEATS_GO/CHANGE',
				payload: goSeatPaid,
			});
		}
	}, [goSeatPaid]);

	useEffect(() => {
		if (backSeatPaid?.length !== 0) {
			dispatch({
				type: 'SEATS_BACK/CHANGE',
				payload: backSeatPaid,
			});
		}
	}, [backSeatPaid]);

	const formatTime = (time) => {
		if (!time) {
			return;
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
		if (JSON.stringify(schedule) === '{}') {
			return;
		}

		// Seat/bed position can be changed 4 hours before departure time
		setIsSelectSeat(isMoreThanFourHours(schedule?.date, schedule?.time));

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
	}, [schedule]);

	useEffect(() => {
		if (isScrollTo) {
			window.scrollTo({ top: 1000, left: 0, behavior: 'smooth' });

			return () => {
				window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
			};
		}
	}, [isScrollTo, schedule]);

	useEffect(() => {
		if (goSeats.length === 0 && JSON.stringify(schedule) !== '{}') {
			// Default seat when user choose schedule
			const list = schedule.seats;
			for (let i = 0; i < list.length; i++) {
				if (list[i].state === 'empty') {
					setGoSeatDefault(list[i].number);
					break;
				}
			}
		} else if (goSeats.length !== 0) {
			setGoSeatDefault('');
		}

		if (backSeats.length === 0 && JSON.stringify(scheduleBack) !== '{}') {
			// Default seat when user choose scheduleBack
			const list = scheduleBack.seats;
			for (let i = 0; i < list.length; i++) {
				if (list[i].state === 'empty') {
					setBackSeatDefault(list[i].number);
					break;
				}
			}
		} else if (backSeats.length !== 0) {
			setBackSeatDefault('');
		}
	}, [goSeats, backSeats, schedule, scheduleBack]);

	const submit = () => {
		if (!!user.id) {
		} else {
			if (nameField === '') {
				setErrorField('name');
				scrollToElement(registerFormRef, -70);
			} else if (phoneField === '') {
				setErrorField('phone');
				scrollToElement(registerFormRef, -70);
			} else if (!isVietnamesePhoneNumber(phoneField)) {
				setErrorField('phone');
				scrollToElement(registerFormRef, -70);
			} else {
				setErrorField('');
			}
		}
	};

	const renderDate = (dateString) => {
		const date = new Date(dateString);
		const day = date.getDate();
		const month = date.getMonth() + 1;
		const weekdayLong = date
			.toLocaleDateString('vi-VN', {
				weekday: 'short',
				timeZone: 'Asia/Ho_Chi_Minh',
			})
			.replace('Th', 'Thứ')
			.replace('CN', 'Chủ nhật');
		const formattedDay = String(day).padStart(2, '0');
		const formattedMonth = String(month).padStart(2, '0');

		return `${weekdayLong}, ${formattedDay}/${formattedMonth}`;
	};

	const reduce15mTime = (timeString) => {
		if (!timeString) {
			return '';
		}

		const [hours, minutes] = timeString.split(':').map(Number);
		const date = new Date();

		date.setHours(hours);
		date.setMinutes(minutes);

		// Reduce 15 minutes
		date.setMinutes(date.getMinutes() - 15);

		return date.toTimeString().slice(0, 5);
	};

	const renderFullDatetime = (timeString, dateString) => {
		if (!!!timeString || !!!dateString) {
			return '';
		}

		const [hour, minute] = timeString.split(':');
		const date = new Date(dateString);

		const weekday = date
			.toLocaleDateString('vi-VN', {
				weekday: 'short',
				timeZone: 'Asia/Ho_Chi_Minh',
			})
			.replace('Th', 'Thứ')
			.replace('CN', 'Chủ nhật');

		return `${hour.padStart(2, '0')}:${minute.padStart(
			2,
			'0',
		)} - ${weekday}, ${date.getDate()}/${
			date.getMonth() + 1
		}/${date.getFullYear()}`;
	};

	// Pay handler
	useEffect(() => {
		if (isPaid) {
			if (!!user.id) {
				const goPrice =
					(
						goSeats.length === 0
						? schedule?.price
						: schedule?.price * goSeats.length
					) *
					(
						1 - schedule?.discount / 100
					);
				const backPrice = !!scheduleBackId
				                  ? (
					                    backSeats.length === 0
					                    ? scheduleBack?.price
					                    : scheduleBack?.price * backSeats.length
				                    ) *
				                    (
					                    1 - scheduleBack?.discount / 100
				                    )
				                  : 0;

				if (goShuttleBusAddress || backShuttleBusAddress) {
					axios
						.post(`${BE_BASE_URL}/booking-with-shuttle-bus`, {
							userId: user.id,
							scheduleId,
							scheduleBackId,
							seats:
								goSeats.length !== 0 ? goSeats : goSeatDefault,
							seatsBack:
								scheduleBackId &&
								(
									backSeats !== 0 ? backSeats : backSeatDefault
								),
							payment: 'online',
							price: goPrice + backPrice,
							isPaid,
							discount: 0,
							roundTrip: isRoundTrip,
							shuttleBusName: goShuttleBusName.trim(),
							shuttleBusPhone: goShuttleBusPhone.trim(),
							shuttleBusAddress: goShuttleBusAddress.trim(),
							backShuttleBusName:
								scheduleBackId && backShuttleBusName.trim(),
							backShuttleBusPhone:
								scheduleBackId && backShuttleBusPhone.trim(),
							backShuttleBusAddress:
								scheduleBackId && backShuttleBusAddress.trim(),
						})
						.then((res) => {
							if (res?.data?.message === 'Ticket booked') {
								window.location.reload();
							}
						})
						.catch((error) => {
							console.error(error);
						});
				} else {
					axios
						.post(`${BE_BASE_URL}/booking`, {
							userId: user.id,
							scheduleId,
							scheduleBackId,
							seats:
								goSeats.length !== 0 ? goSeats : goSeatDefault,
							seatsBack:
								scheduleBackId &&
								(
									backSeats !== 0 ? backSeats : backSeatDefault
								),
							payment: 'online',
							price: goPrice + backPrice,
							isPaid,
							discount: 0,
							roundTrip: isRoundTrip,
						})
						.then((res) => {
							if (res?.data?.message === 'Ticket booked') {
								window.location.reload();
							}
						})
						.catch((error) => {
							console.error(error);
						});
				}
			}

			setToastList([
				...toastList,
				<ToastComponent
					type="success"
					content={`Thanh toán thành công`}
				/>,
			]);
		}
	}, [isPaid]);

	// Get shuttle bus
	useEffect(() => {
		if (isPaid || hadBooked) {
			if (JSON.stringify(schedule) !== '{}') {
				if (!!ticketId) {
					axios
						.get(`${BE_BASE_URL}/shuttle-bus`, {
							params: {
								ticketId,
							},
						})
						.then((res) => {
							if (!res?.data?.message) {
								setShuttleBusInfo(res.data);
								setGoShuttleBusName(res.data.name);
								setGoShuttleBusPhone(res.data.phone_number);
								setGoShuttleBusAddress(res.data.address);
								setBackShuttleBusName(res.data.back_name);
								setBackShuttleBusPhone(
									res.data.back_phone_number,
								);
								setBackShuttleBusAddress(res.data.back_address);
							}
						})
						.catch((err) => console.log(err));
				}
			}
		}
	}, [isPaid, hadBooked]);

	const cancelEditShuttleBus = () => {
		setGoShuttleBusName(shuttleBusInfo.name);
		setGoShuttleBusPhone(shuttleBusInfo.phone_number);
		setGoShuttleBusAddress(shuttleBusInfo.address);
		setBackShuttleBusName(shuttleBusInfo.back_name);
		setBackShuttleBusPhone(shuttleBusInfo.back_phone_number);
		setBackShuttleBusAddress(shuttleBusInfo.back_address);
		setIsEditShuttleBus(false);
	};

	const submitEditShuttleBus = () => {
		if (isEditShuttleBus) {
			axios
				.put(`${BE_BASE_URL}/shuttle-bus`, {
					ticketId,
					name: goShuttleBusName,
					phoneNumber: goShuttleBusPhone,
					address: goShuttleBusAddress,
					back_name: backShuttleBusName,
					back_phoneNumber: backShuttleBusPhone,
					back_address: backShuttleBusAddress,
				})
				.then((res) => {
					if (res?.data?.message === 'success') {
						setToastList([
							...toastList,
							<ToastComponent
								type="success"
								content={`Thay đổi thông tin đăng ký xe trung chuyển thành công.`}
							/>,
						]);
					}
				})
				.catch((error) => {
					console.log(error);
					setToastList([
						...toastList,
						<ToastComponent
							type="error"
							content={
								'Thay đổi thông tin đăng ký xe trung chuyển thất bại.'
							}
						/>,
					]);
				});

			setIsEditShuttleBus(false);
		} else {
			setIsEditShuttleBus(true);
		}
	};

	const cancelEditSeat = () => {
		dispatch({ type: 'SEATS_GO/CHANGE', payload: goSeatPaid });
		dispatch({ type: 'SEATS_BACK/CHANGE', payload: backSeatPaid });
		setIsEditSeat(false);
	};

	const submitEditSeat = () => {
		if (isEditSeat) {
			if (goSeats.length !== goSeatPaid.length) {
				setToastList([
					...toastList,
					<ToastComponent
						type="warning"
						content={`Phải cập nhật số lượng vị trí bằng với lúc thanh toán.`}
					/>,
				]);
			} else {
				axios
					.put(`${BE_BASE_URL}/seat`, {
						ticketId,
						oldGoSeat: goSeatPaid,
						oldBackSeat: backSeatPaid,
						newGoSeat: goSeats,
						newBackSeat: backSeats,
					})
					.then((res) => {
						if (res?.data?.message === 'success') {
							setToastList([
								...toastList,
								<ToastComponent
									type="success"
									content={`Cập nhật vị trí trên xe thành công.`}
								/>,
							]);
							window.location.reload();
						}
					})
					.catch((error) => {
						console.log(error);
						setToastList([
							...toastList,
							<ToastComponent
								type="error"
								content={`Cập nhật vị trí trên xe thất bại.`}
							/>,
						]);
					});
			}

			setIsEditSeat(false);
		} else {
			setIsEditSeat(true);
		}
	};

	return (
		<>
			<div className={cx('wrap')}>
				<Header/>
				<div className={cx('content')}>
					<div className={cx('info-wrap')}>
						<div className={cx('main')}>
							{Object.keys(schedule).length > 0 && (
								<div className={cx('seat')}>
									<Seat
										typeCoachGo={schedule.type_coach}
										typeCoachBack={
											scheduleBack.type_coach || null
										}
										startDateGo={schedule.date}
										startDateBack={
											scheduleBack.date || null
										}
										isSelectSeatGo={
											hadBooked
											? isEditSeat
											: isSelectSeat
										}
										isSelectSeatBack={
											hadBooked
											? isEditSeat
											: isSelectSeatBack
										}
										goSeatPaid={goSeatPaid}
										backSeatPaid={backSeatPaid || []}
										isEditSeat={isEditSeat}
									/>
									{hadBooked && (
										<div className={cx('button')}>
											{isEditSeat && (
												<button
													onClick={cancelEditSeat}
												>
													Huỷ
												</button>
											)}
											<button onClick={submitEditSeat}>
												{isEditSeat
												 ? 'Xác nhận'
												 : 'Thay đổi'}
											</button>
										</div>
									)}
								</div>
							)}
							{!!!user.id && (
								<div
									className={cx('no-login')}
									ref={registerFormRef}
								>
									<div className={cx('quick-form')}>
										<div className={cx('customer-info')}>
											<h5>THÔNG TIN KHÁCH HÀNG</h5>
											<QuickRegisterForm
												setName={setNameField}
												setPhone={setPhoneField}
												isError={errorField}
											/>
										</div>
										<div className={cx('policy')}>
											<h5>ĐIỀU KHOẢN & LƯU Ý</h5>
											<p>
												(*) Quý khách vui lòng có mặt
												tại bến xuất phát của xe trước
												ít nhất 30 phút giờ xe khởi
												hành, mang theo thông báo đã
												thanh toán vé thành công có chứa
												mã vé được gửi từ hệ thống COACH
												BOOKING. Vui lòng liên hệ Trung
												tâm tổng đài 1900 6067 để được
												hỗ trợ.
											</p>
											<p>
												(*) Nếu quý khách có nhu cầu
												trung chuyển, vui lòng liên hệ
												Tổng đài trung chuyển 1900 6918
												trước khi đặt vé. Chúng tôi
												không đón/trung chuyển tại những
												điểm xe trung chuyển không thể
												tới được.
											</p>
										</div>
									</div>
									<div
										className={cx('policy-accept')}
										onClick={() =>
											setAcceptPolicy((prev) => !prev)
										}
									>
										<input
											type="checkbox"
											name=""
											id=""
											defaultChecked={acceptPolicy}
										/>
										<span>Chấp nhận điều khoản</span>
										<p>
											đặt vé & chính sách bảo mật thông
											tin của COACH BOOKING
										</p>
									</div>
								</div>
							)}
							<div className={cx('shuttle-bus-form')}>
								<div
									className={cx(
										'shuttle-bus',
										!!scheduleBackId && '--gutter-line',
									)}
									ref={shuttleBusRef}
								>
									<div className={cx('item')}>
										<div className={cx('title')}>
											<span>ĐĂNG KÝ XE TRUNG CHUYỂN</span>
											<span className={cx('info-icon')}>
												{infoCircleIcon}
											</span>
										</div>
										<div className={cx('subtitle')}>
											Chuyến đi -{' '}
											{renderDate(schedule?.date)}
										</div>
										<div className={cx('input')}>
											<label htmlFor="go-shuttle-bus-name">
												{!hadBooked || isEditShuttleBus
												 ? 'Nhập tên khách hàng'
												 : 'Tên khách hàng'}
											</label>
											{(
												 !hadBooked ||
												 isEditShuttleBus
											 ) && (
												 <input
													 type="text"
													 name="name"
													 id="go-shuttle-bus-name"
													 defaultValue={
														 goShuttleBusName
													 }
													 onChange={(e) =>
														 setGoShuttleBusName(
															 e.target.value,
														 )
													 }
												 />
											 )}
											{hadBooked && !isEditShuttleBus && (
												<div className={cx('fill')}>
													{goShuttleBusName}
												</div>
											)}
										</div>
										<div className={cx('input')}>
											<label htmlFor="go-shuttle-bus-phone">
												{!hadBooked || isEditShuttleBus
												 ? 'Nhập số điện thoại khách hàng'
												 : 'Số điện thoại khách hàng'}
											</label>
											{(
												 !hadBooked ||
												 isEditShuttleBus
											 ) && (
												 <input
													 type="text"
													 name="phone"
													 id="go-shuttle-bus-phone"
													 defaultValue={
														 goShuttleBusPhone
													 }
													 onChange={(e) =>
														 setGoShuttleBusPhone(
															 e.target.value,
														 )
													 }
												 />
											 )}
											{hadBooked && !isEditShuttleBus && (
												<div className={cx('fill')}>
													{goShuttleBusPhone}
												</div>
											)}
										</div>
										<div className={cx('input')}>
											<label htmlFor="go-shuttle-bus-address">
												{!hadBooked || isEditShuttleBus
												 ? 'Nhập thông tin địa chỉ'
												 : 'Thông tin địa chỉ'}
											</label>
											{(
												 !hadBooked ||
												 isEditShuttleBus
											 ) && (
												 <input
													 type="text"
													 name="address"
													 id="go-shuttle-bus-address"
													 defaultValue={
														 goShuttleBusAddress
													 }
													 onChange={(e) =>
														 setGoShuttleBusAddress(
															 e.target.value,
														 )
													 }
												 />
											 )}
											{hadBooked && !isEditShuttleBus && (
												<div className={cx('fill')}>
													{goShuttleBusAddress}
												</div>
											)}
										</div>
										<p className={cx('notice')}>
											Quý khách vui lòng có mặt tại Bến
											xe/Văn Phòng{' '}
											<span className={cx('--text-bold')}>
												{schedule?.start_place}
											</span>{' '}
											trước{' '}
											<span
												className={cx(
													'--text-bold-red',
												)}
											>
												{reduce15mTime(schedule?.time)}{' '}
												{formatDate(schedule?.date)}
											</span>{' '}
											để được trung chuyển hoặc kiểm tra
											thông tin trước khi lên xe.
										</p>
									</div>
									{!!scheduleBackId && (
										<div className={cx('item')}>
											<div className={cx('title')}>
												<span>
													ĐĂNG KÝ XE TRUNG CHUYỂN
												</span>
												<span
													className={cx('info-icon')}
												>
													{infoCircleIcon}
												</span>
											</div>
											<div className={cx('subtitle')}>
												Chuyến về -{' '}
												{renderDate(scheduleBack?.date)}
											</div>
											<div className={cx('input')}>
												<label htmlFor="back-shuttle-bus-name">
													{!hadBooked ||
													 isEditShuttleBus
													 ? 'Nhập tên khách hàng'
													 : 'Tên khách hàng'}
												</label>
												{(
													 !hadBooked ||
													 isEditShuttleBus
												 ) && (
													 <input
														 type="text"
														 name="name"
														 id="back-shuttle-bus-name"
														 defaultValue={
															 backShuttleBusName
														 }
														 onChange={(e) =>
															 setBackShuttleBusName(
																 e.target.value,
															 )
														 }
													 />
												 )}
												{hadBooked &&
												 !isEditShuttleBus && (
													 <div
														 className={cx(
															 'fill',
														 )}
													 >
														 {backShuttleBusName}
													 </div>
												 )}
											</div>
											<div className={cx('input')}>
												<label htmlFor="back-shuttle-bus-phone">
													{!hadBooked ||
													 isEditShuttleBus
													 ? 'Nhập số điện thoại khách hàng'
													 : 'Số điện thoại khách hàng'}
												</label>
												{(
													 !hadBooked ||
													 isEditShuttleBus
												 ) && (
													 <input
														 type="text"
														 name="phone"
														 id="back-shuttle-bus-phone"
														 defaultValue={
															 backShuttleBusPhone
														 }
														 onChange={(e) =>
															 setBackShuttleBusPhone(
																 e.target.value,
															 )
														 }
													 />
												 )}
												{hadBooked &&
												 !isEditShuttleBus && (
													 <div
														 className={cx(
															 'fill',
														 )}
													 >
														 {
															 backShuttleBusPhone
														 }
													 </div>
												 )}
											</div>
											<div className={cx('input')}>
												<label htmlFor="back-shuttle-bus-address">
													{!hadBooked ||
													 isEditShuttleBus
													 ? 'Nhập thông tin địa chỉ'
													 : 'Thông tin địa chỉ'}
												</label>
												{(
													 !hadBooked ||
													 isEditShuttleBus
												 ) && (
													 <input
														 type="text"
														 name="address"
														 id="back-shuttle-bus-address"
														 defaultValue={
															 backShuttleBusAddress
														 }
														 onChange={(e) =>
															 setBackShuttleBusAddress(
																 e.target.value,
															 )
														 }
													 />
												 )}
												{hadBooked &&
												 !isEditShuttleBus && (
													 <div
														 className={cx(
															 'fill',
														 )}
													 >
														 {
															 backShuttleBusAddress
														 }
													 </div>
												 )}
											</div>
											<p className={cx('notice')}>
												Quý khách vui lòng có mặt tại
												Bến xe/Văn Phòng{' '}
												<span
													className={cx(
														'--text-bold',
													)}
												>
													{scheduleBack?.start_place}
												</span>{' '}
												trước{' '}
												<span
													className={cx(
														'--text-bold-red',
													)}
												>
													{reduce15mTime(
														scheduleBack?.time,
													)}{' '}
													{formatDate(
														scheduleBack?.date,
													)}
												</span>{' '}
												để được trung chuyển hoặc kiểm
												tra thông tin trước khi lên xe.
											</p>
										</div>
									)}
								</div>
								{!hadBooked && (
									<div className={cx('button')}>
										{isEditShuttleBus && (
											<button
												onClick={cancelEditShuttleBus}
											>
												Huỷ
											</button>
										)}
										<button onClick={submitEditShuttleBus}>
											{isEditShuttleBus
											 ? 'Xác nhận'
											 : 'Thay đổi'}
										</button>
									</div>
								)}
							</div>
							<div
								className={cx('payment')}
								ref={paymentFormRef}
							>
								<div className={cx('bill')}>
									<div className={cx('title')}>
										THÔNG TIN THANH TOÁN
									</div>
									<div
										className={cx('header')}
										onClick={() =>
											window.scrollTo({
												top: 0,
												behavior: 'smooth',
											})
										}
									>
										<div className={cx('icon')}>
											{busIcon}
										</div>
										<div className={cx('content')}>
											<div className={cx('title')}>
												<span>
													{cityShortener(
														scheduleBack?.start_place,
													)}
												</span>
												{!!scheduleBackId ? (
													<span>&#8652;</span>
												) : (
													 <span>&#8594;</span>
												 )}
												<span>
													{cityShortener(
														scheduleBack?.end_place,
													)}
												</span>
											</div>
											<div className={cx('text')}>
												{renderFullDatetime(
													schedule?.time,
													schedule?.date,
												)}
											</div>
											<div className={cx('text')}>
												{!!scheduleBackId
												 ? renderFullDatetime(
														scheduleBack?.time,
														scheduleBack?.date,
													)
												 : `Nhà xe: ${schedule?.garage_name?.replace(
														'NHÀ XE',
														'',
													)}`}
											</div>
										</div>
										<div className={cx('icon')}>
											{arrowRightIcon}
										</div>
									</div>
									<div className={cx('text')}>
										<div className={cx('text-strong')}>
											<span>Tổng cộng</span>
											<span>
												{new Intl.NumberFormat(
													'vi-VN',
													{
														style: 'currency',
														currency: 'VND',
													},
												).format(
													hadBooked
													? ticketPrice
													: (
														  goSeats.length === 0
														  ? schedule?.price
														  : schedule?.price *
														    goSeats.length
													  ) *
													  (
														  1 -
														  schedule?.discount /
														  100
													  ) +
													  (
														  !!scheduleBackId &&
														  (
															  backSeats.length ===
															  0
															  ? scheduleBack?.price
															  : scheduleBack?.price *
															    backSeats.length
														  ) *
														  (
															  1 -
															  scheduleBack?.discount /
															  100
														  )
													  ),
												)}
											</span>
										</div>
									</div>
									<div className={cx('voucher')}>
										<div className={cx('left')}>
											<span>{ticketPercentIcon}</span>
											<span>Voucher</span>
										</div>
										<input
											className={cx('right')}
											type="text"
											placeholder="Nhập mã"
										/>
									</div>
									<div className={cx('text')}>
										<div className={cx('text-small')}>
											<span>Tổng cộng</span>
											<span>
												{new Intl.NumberFormat(
													'vi-VN',
													{
														style: 'currency',
														currency: 'VND',
													},
												).format(
													hadBooked
													? ticketPrice
													: (
														  goSeats.length === 0
														  ? schedule?.price
														  : schedule?.price *
														    goSeats.length
													  ) *
													  (
														  1 -
														  schedule?.discount /
														  100
													  ) +
													  (
														  !!scheduleBackId &&
														  (
															  backSeats.length ===
															  0
															  ? scheduleBack?.price
															  : scheduleBack?.price *
															    backSeats.length
														  ) *
														  (
															  1 -
															  scheduleBack?.discount /
															  100
														  )
													  ),
												)}
											</span>
										</div>
										<div className={cx('text-small')}>
											<span>Voucher</span>
											<span>
												{new Intl.NumberFormat(
													'vi-VN',
													{
														style: 'currency',
														currency: 'VND',
													},
												).format(0)}
											</span>
										</div>
										<div
											className={cx(
												'text-strong',
												'--gutter-line',
											)}
										>
											<span>Tổng thanh toán</span>
											<span>
												{new Intl.NumberFormat(
													'vi-VN',
													{
														style: 'currency',
														currency: 'VND',
													},
												).format(
													hadBooked
													? ticketPrice
													: (
														  goSeats.length === 0
														  ? schedule?.price
														  : schedule?.price *
														    goSeats.length
													  ) *
													  (
														  1 -
														  schedule?.discount /
														  100
													  ) +
													  (
														  !!scheduleBackId &&
														  (
															  backSeats.length ===
															  0
															  ? scheduleBack?.price
															  : scheduleBack?.price *
															    backSeats.length
														  ) *
														  (
															  1 -
															  scheduleBack?.discount /
															  100
														  )
													  ),
												)}
											</span>
										</div>
									</div>
								</div>
								<div className={cx('pay')}>
									<div className={cx('title')}>
										HÌNH THỨC THANH TOÁN
									</div>
									{!hadBooked ? (
										<PayOnline
											price={
												(
													goSeats.length === 0
													? schedule?.price
													: schedule?.price *
													  goSeats.length
												) *
												(
													1 -
													schedule?.discount /
													100
												) +
												(
													backSeats.length === 0
													? scheduleBack?.price
													: scheduleBack?.price *
													  backSeats.length
												) *
												(
													1 -
													scheduleBack?.discount /
													100
												)
											}
											phone={phoneField}
											setIsPaid={setIsPaid}
										/>
									) : (
										 <div className={cx('paid')}>
											 <svg
												 xmlns="http://www.w3.org/2000/svg"
												 viewBox="2.5 6 28 28"
												 id="online"
											 >
												 <g transform="translate(0 -1020.362)">
													 <path
														 fill="#e9eded"
														 stroke="#406b95"
														 strokeWidth=".97"
														 d="M4.696 1028.858h21.496l3.823 3.697v11.18c0 .634-.528 1.145-1.183 1.145H4.696c-.656 0-1.184-.51-1.184-1.145v-13.733c0-.634.528-1.144 1.184-1.144z"
													 ></path>
													 <path
														 fill="#406b95"
														 d="M2 1027.362h2.545v19.091H2z"
													 ></path>
													 <path
														 fill="#2dbca4"
														 fillRule="evenodd"
														 d="m19.244 1031.888-1.333 1.336-1.333 1.335-1.334 1.336-2.286-2.29c-1.017-1.022-2.546.509-1.525 1.527l3.05 3.053c.42.42 1.102.42 1.522 0l6.098-6.105c.705-.687.2-1.883-.783-1.854a1.1 1.1 0 0 0-.742.326l-.667.668m-12.482 9.272v.018a.34.34 0 0 0-.05 0 .34.34 0 0 0-.013 0 .34.34 0 0 0-.005 0 .34.34 0 0 0-.266.385v1.253a.34.34 0 0 0 0 .112v1.24a.34.34 0 0 0 .023.192.34.34 0 0 0 .002 0 .34.34 0 0 0 .015.029.34.34 0 0 0 .378.171h.6a.34.34 0 0 0 .074-.013 1.02 1.02 0 0 0 .937-1.009c0-.26-.102-.498-.266-.678.164-.182.266-.418.266-.679 0-.53-.415-.966-.935-1.01a.34.34 0 0 0-.077-.012h-.678a.34.34 0 0 0-.003 0 .34.34 0 0 0-.003 0zm11.537 0c-.528 0-.96.41-1.007.927a.34.34 0 0 0-.01.084v2.031a.34.34 0 0 0 .678 0v-1.076c.107.038.22.065.338.065.558 0 1.02-.461 1.02-1.02 0-.557-.462-1.016-1.02-1.016zm6.1 0a.34.34 0 0 0-.333.343v2.69a.34.34 0 0 0 .179.328.34.34 0 0 0 .002 0 .34.34 0 0 0 .072.025.34.34 0 0 0 .023 0 .34.34 0 0 0 .067.013h.678a.34.34 0 0 0 .1-.013c.887-.074 1.6-.79 1.6-1.68 0-.89-.709-1.607-1.593-1.684a.34.34 0 0 0-.102-.013H25.147a.34.34 0 0 0-.081-.013zm-3.754 0a.34.34 0 0 0-.288.219l-1.017 2.714a.34.34 0 1 0 .634.239l.172-.455h1.058l.17.455a.34.34 0 0 0 .636-.239l-1.017-2.714a.34.34 0 0 0-.316-.219.34.34 0 0 0-.032 0zm2.396 0a.34.34 0 0 0-.333.343v2.705a.34.34 0 0 0 .679 0v-2.705a.34.34 0 0 0-.346-.343zm-12.215.02a.34.34 0 0 0-.333.343v2.707a.34.34 0 0 0 0 .013.34.34 0 0 0 0 .015.34.34 0 0 0 .003.013.34.34 0 0 0 .343.301h1.347a.34.34 0 0 0 0-.679h-1.014v-2.369a.34.34 0 0 0-.346-.345zm-1.355 0a.34.34 0 0 0-.335.343v2.707a.34.34 0 0 0 .679 0v-2.707a.34.34 0 0 0-.344-.343zm4.067 0a.34.34 0 0 0-.333.343v2.68a.34.34 0 0 0 0 .06.34.34 0 0 0 .005.032.34.34 0 0 0 .008.029.34.34 0 0 0 .002.013.34.34 0 0 0 .01.025.34.34 0 0 0 .015.032.34.34 0 0 0 .003.013.34.34 0 0 0 .015.023.34.34 0 0 0 .037.044.34.34 0 0 0 .008.013.34.34 0 0 0 .002 0 .34.34 0 0 0 .025.018.34.34 0 0 0 .008.013.34.34 0 0 0 .022.018.34.34 0 0 0 .06.03.34.34 0 0 0 .1.02.34.34 0 0 0 .024 0h1.347a.34.34 0 0 0 0-.678h-1.011v-2.369a.34.34 0 0 0-.346-.345v-.013zm4.76.656c.192 0 .341.147.341.339 0 .19-.15.34-.34.34a.334.334 0 0 1-.339-.34c0-.192.147-.339.339-.339zm6.446 0h.296c.605 0 1.069.454 1.069 1.017s-.464 1.017-1.069 1.017h-.296v-2.034zm-17.636.013h.333c.193 0 .338.147.338.34a.33.33 0 0 1-.338.339h-.333v-.679zm13.567.612.273.733h-.546l.273-.733zm-13.567.75h.338a.34.34 0 0 0 .02 0c.18.014.313.15.313.336a.33.33 0 0 1-.338.338h-.334v-.673z"
														 color="#000"
														 fontFamily="sans-serif"
														 fontWeight="400"
														 overflow="visible"
														 style={{
															 lineHeight:
																 'normal',
															 textIndent: 0,
															 textAlign: 'start',
															 textDecorationLine:
																 'none',
															 textDecorationStyle:
																 'solid',
															 textDecorationColor:
																 '#000',
															 textTransform:
																 'none',
															 blockProgression:
																 'tb',
															 isolation: 'auto',
															 mixBlendMode:
																 'normal',
														 }}
													 ></path>
													 <path
														 fill="#406b95"
														 d="M30.167 1032.725h-2.814c-.78 0-1.407-.648-1.407-1.454v-2.909z"
													 ></path>
													 <rect
														 width="3.818"
														 height="1.273"
														 x="5.818"
														 y="1034.998"
														 fill="#8fb6d7"
														 rx="0"
														 ry="0"
													 ></rect>
													 <rect
														 width="6.364"
														 height="1.273"
														 x="21.091"
														 y="1034.998"
														 fill="#8fb6d7"
														 rx="0"
														 ry="0"
													 ></rect>
													 <rect
														 width="6.364"
														 height="1.273"
														 x="5.818"
														 y="1037.544"
														 fill="#8fb6d7"
														 rx="0"
														 ry="0"
													 ></rect>
													 <rect
														 width="8.909"
														 height="1.273"
														 x="18.545"
														 y="1037.544"
														 fill="#8fb6d7"
														 rx="0"
														 ry="0"
													 ></rect>
													 <path
														 fill="none"
														 stroke="#105286"
														 strokeLinecap="round"
														 strokeLinejoin="round"
														 strokeWidth=".5"
														 d="m19.244 1031.888-.333.334m-1 1.002-.667.667-.666.668-.667.668-.667.668-2.286-2.29c-1.017-1.023-2.546.509-1.525 1.527l3.05 3.053c.42.42 1.102.42 1.522 0l6.098-6.105c.705-.687.2-1.883-.783-1.854a1.1 1.1 0 0 0-.742.326l-.667.668"
														 color="#000"
														 fontFamily="sans-serif"
														 fontWeight="400"
														 overflow="visible"
														 style={{
															 lineHeight:
																 'normal',
															 textIndent: 0,
															 textAlign: 'start',
															 textDecorationLine:
																 'none',
															 textDecorationStyle:
																 'solid',
															 textDecorationColor:
																 '#000',
															 textTransform:
																 'none',
															 blockProgression:
																 'tb',
															 isolation: 'auto',
															 mixBlendMode:
																 'normal',
														 }}
													 ></path>
												 </g>
											 </svg>
											 <div className={cx('button')}>
												 ĐÃ THANH TOÁN
											 </div>
										 </div>
									 )}
								</div>
							</div>
						</div>
						<div className={cx('info')}>
							{/* Go info */}
							<div className={cx('item')}>
								<div className={cx('title')}>
									Thông tin lượt đi
								</div>
								<div className={cx('line')}>
									<div>Tuyến xe</div>
									<div>
										{cityShortener(schedule?.start_place)} -{' '}
										{cityShortener(schedule?.end_place)}
									</div>
								</div>
								<div className={cx('line')}>
									<div>Thời gian xuất bến</div>
									<div className={cx('--text-blue')}>
										{formatTime(schedule?.time)}{' '}
										{formatDate(schedule?.date)}
									</div>
								</div>
								<div className={cx('line')}>
									<div>
										Số lượng{' '}
										{schedule?.type_coach?.toLowerCase()}
									</div>
									<div>
										{hadBooked
										 ? goSeatPaid.length
										 : goSeats.length === 0
										   ? 1
										   : goSeats.length}{' '}
										{schedule?.type_coach?.toLowerCase()}
									</div>
								</div>
								<div className={cx('line')}>
									<div>
										Số {schedule?.type_coach?.toLowerCase()}
									</div>
									<div>
										{hadBooked
										 ? goSeatPaid.join(', ')
										 : goSeats.length === 0
										   ? `${goSeatDefault} (đề xuất)`
										   : goSeats.join(', ')}
									</div>
								</div>
								<div className={cx('line')}>
									<div>Tổng tiền lượt đi</div>
									<div className={cx('--text-blue')}>
										{new Intl.NumberFormat('vi-VN', {
											style: 'currency',
											currency: 'VND',
										}).format(
											(
												hadBooked
												? goSeatPaid.length
												: goSeats.length === 0
												  ? 1
												  : goSeats.length
											) *
											schedule?.price,
										)}
									</div>
								</div>
							</div>
							{/* Back info */}
							{!!scheduleBackId && (
								<div className={cx('item')}>
									<div className={cx('title')}>
										Thông tin lượt về
									</div>
									<div className={cx('line')}>
										<div>Tuyến xe</div>
										<div>
											{cityShortener(
												scheduleBack?.start_place,
											)}{' '}
											-{' '}
											{cityShortener(
												scheduleBack?.end_place,
											)}
										</div>
									</div>
									<div className={cx('line')}>
										<div>Thời gian xuất bến</div>
										<div className={cx('--text-blue')}>
											{formatTime(scheduleBack?.time)}{' '}
											{formatDate(scheduleBack?.date)}
										</div>
									</div>
									<div className={cx('line')}>
										<div>
											Số lượng{' '}
											{scheduleBack?.type_coach?.toLowerCase()}
										</div>
										<div>
											{hadBooked
											 ? backSeatPaid.length
											 : backSeats.length === 0
											   ? 1
											   : backSeats.length}{' '}
											{scheduleBack?.type_coach?.toLowerCase()}
										</div>
									</div>
									<div className={cx('line')}>
										<div>
											Số{' '}
											{scheduleBack?.type_coach?.toLowerCase()}
										</div>
										<div>
											{hadBooked
											 ? backSeatPaid.join(', ')
											 : backSeats.length === 0
											   ? `${backSeatDefault} (đề xuất)`
											   : backSeats.join(', ')}
										</div>
									</div>
									<div className={cx('line')}>
										<div>Tổng tiền lượt về</div>
										<div className={cx('--text-blue')}>
											{new Intl.NumberFormat('vi-VN', {
												style: 'currency',
												currency: 'VND',
											}).format(
												(
													hadBooked
													? backSeatPaid.length
													: backSeats.length === 0
													  ? 1
													  : backSeats.length
												) *
												scheduleBack?.price,
											)}
										</div>
									</div>
								</div>
							)}
							<div className={cx('item')}>
								<div className={cx('title')}>Chi tiết giá</div>
								<div className={cx('line')}>
									<div>Giá vé lượt đi</div>
									<div className={cx('--text-blue')}>
										{new Intl.NumberFormat('vi-VN', {
											style: 'currency',
											currency: 'VND',
										}).format(
											goSeats.length === 0
											? schedule?.price
											: schedule?.price *
											  goSeats.length,
										)}
									</div>
								</div>
								{!!scheduleBackId && (
									<div className={cx('line')}>
										<div>Giá vé lượt về</div>
										<div className={cx('--text-blue')}>
											{new Intl.NumberFormat('vi-VN', {
												style: 'currency',
												currency: 'VND',
											}).format(
												backSeats.length === 0
												? scheduleBack?.price
												: scheduleBack?.price *
												  backSeats.length,
											)}
										</div>
									</div>
								)}
								<div className={cx('line')}>
									<div>Chiếc khấu vé lượt đi</div>
									<div>{schedule?.discount}%</div>
								</div>
								{!!scheduleBackId && (
									<div className={cx('line')}>
										<div>Chiếc khấu vé lượt về</div>
										<div>{scheduleBack?.discount}%</div>
									</div>
								)}
								<div className={cx('line', '--summary')}>
									<div>Tổng tiền</div>
									<div className={cx('--red-color')}>
										{new Intl.NumberFormat('vi-VN', {
											style: 'currency',
											currency: 'VND',
										}).format(
											hadBooked
											? ticketPrice
											: (
												  goSeats.length === 0
												  ? schedule?.price
												  : schedule?.price *
												    goSeats.length
											  ) *
											  (
												  1 -
												  schedule?.discount /
												  100
											  ) +
											  (
												  !!scheduleBackId &&
												  (
													  backSeats.length ===
													  0
													  ? scheduleBack?.price
													  : scheduleBack?.price *
													    backSeats.length
												  ) *
												  (
													  1 -
													  scheduleBack?.discount /
													  100
												  )
											  ),
										)}
									</div>
								</div>
							</div>
							<div className={cx('button')}>
								<button
									onClick={() =>
										scrollToElement(shuttleBusRef, -94)
									}
								>
									Đăng ký xe trung chuyển
								</button>
								{!hadBooked && (
									<button
										onClick={() =>
											scrollToElement(
												paymentFormRef,
												-408,
											)
										}
									>
										Đặt vé
									</button>
								)}
							</div>
							{isShowFeedback && (
								<div className={cx('break-line')}></div>
							)}
							{isShowFeedback && (
								<div className={cx('heading')}>
									<div className={cx('title')}>
										{cityShortener(
											schedule?.start_place,
										).toUpperCase()}{' '}
										-{' '}
										{cityShortener(
											schedule?.end_place,
										).toUpperCase()}
									</div>
									<div className={cx('subtitle')}>
										{renderFullDatetime(
											schedule?.time,
											schedule?.date,
										)}
									</div>
								</div>
							)}
							{isShowFeedback && (
								<ShowFeedback scheduleId={scheduleId}/>
							)}
							{isShowFeedback2 && !!scheduleBackId && (
								<div className={cx('break-line')}></div>
							)}
							{isShowFeedback2 && !!scheduleBackId && (
								<div className={cx('heading')}>
									<div className={cx('title')}>
										{cityShortener(
											scheduleBack?.start_place,
										).toUpperCase()}{' '}
										-{' '}
										{cityShortener(
											scheduleBack?.end_place,
										).toUpperCase()}
									</div>
									<div className={cx('subtitle')}>
										{renderFullDatetime(
											scheduleBack?.time,
											scheduleBack?.date,
										)}
									</div>
								</div>
							)}
							{isShowFeedback2 && !!scheduleBackId && (
								<ShowFeedback scheduleId={scheduleBackId}/>
							)}
						</div>
					</div>
				</div>
				<Footer/>
			</div>
			<ToastContainerComponent
				toastList={toastList}
				setToastList={setToastList}
			/>
		</>
	);
};

export default Schedule;
