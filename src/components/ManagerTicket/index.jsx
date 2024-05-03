import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames/bind';
import axios from 'axios';

import styles from './ManagerTicket.module.scss';
import {
	convertYYYYMMDDToDDMMYYYY,
	isVietnamesePhoneNumber,
} from '../../store/actions';
import Seat from '../Seat';
import Ticket from '../Ticket';
import QuickRegisterForm from '../QuickRegisterForm';
import ToastContainerComponent from '../../components/ToastContainerComponent';
import ToastComponent from '../../components/ToastComponent';

const cx = classNames.bind(styles);
const BE_BASE_URL = import.meta.env.VITE_BE_BASE_URL;

const ManagerTicket = ({ type }) => {
	const [toastList, setToastList] = useState([]);
	const [user, setUser] = useState({});
	const [startPlaces, setStartPlaces] = useState([]);
	const [endPlaces, setEndPlaces] = useState([]);
	const [startPlaceId, setStartPlaceId] = useState(0);
	const [endPlaceId, setEndPlaceId] = useState(0);
	const [startDate, setStartDate] = useState('');
	const [typeCoach, setTypeCoach] = useState('');
	const [schedules, setSchedules] = useState([]);
	const [scheduleSelected, setScheduleSelected] = useState({});
	const [garages, setGarages] = useState([]);
	const [garageSelected, setGarageSelected] = useState('');
	const [seatSelected, setSeatSelected] = useState([]);
	const [isSelectSeat, setIsSelectSeat] = useState(true);
	const [autoSelectSeat, setAutoSelectSeat] = useState(true);
	const [seats, setSeats] = useState([]);
	const [price, setPrice] = useState(0);
	const [nameField, setNameField] = useState('');
	const [phoneField, setPhoneField] = useState('');
	const [errorField, setErrorField] = useState('');
	const [isPaidSelected, setIsPaidSelected] = useState(false);
	const [ticket, setTicket] = useState({});
	const [isShowShuttleBusForm, setIsShowShuttleBusForm] = useState(false);

	const dispatch = useDispatch();
	const search = useSelector((state) => state.search);

	const contentRef = useRef(null);
	const shuttle_bus_name_ref = useRef(null);
	const shuttle_bus_phone_ref = useRef(null);
	const shuttle_bus_address_ref = useRef(null);

	const onChangeManagerState = (newState) => {
		dispatch({ type: 'MANAGER/CHANGE_STATE', payload: newState });
	};

	const onStartPlaceInput = (e) => {
		const getData = setTimeout(() => {
			const placeFound = startPlaces.find(
				(place) => place.name === e.target.value
			);

			if (placeFound) {
				setStartPlaceId(placeFound.id);
			}
		}, 500);

		return () => {
			clearTimeout(getData);
		};
	};

	const onEndPlaceInput = (e) => {
		const getData = setTimeout(() => {
			const placeFound = startPlaces.find(
				(place) => place.name === e.target.value
			);

			if (placeFound) {
				setEndPlaceId(placeFound.id);
			}
		}, 500);

		return () => {
			clearTimeout(getData);
		};
	};

	useEffect(() => {
		if (type === 'add') {
			if (search.id !== 0 && search.type === 'customer') {
				axios
					.get(`${BE_BASE_URL}/profile`, {
						params: {
							userId: search.id,
						},
					})
					.then((res) => {
						if (res?.data) {
							setUser(res.data);
						}
					})
					.catch((error) => console.error(error));
			}

			axios
				.get(`${BE_BASE_URL}/start-point`)
				.then((res) => {
					if (res?.data) {
						setStartPlaces(res.data);
					}
				})
				.catch((err) => console.log(err));

			axios
				.get(`${BE_BASE_URL}/garage`)
				.then((res) => {
					if (res?.data) {
						setGarages([...res.data]);
					}
				})
				.catch((err) => {
					console.error(err);
				});
		} else if (type === 'view') {
			axios
				.get(`${BE_BASE_URL}/manager-ticket`, {
					params: {
						ticketId: search.id,
					},
				})
				.then((res) => {
					if (res?.data) {
						setTicket({ ...res.data[0] });
					}
				})
				.catch((err) => console.error(err));
		}
	}, [type]);

	useEffect(() => {
		if (startPlaceId !== 0) {
			axios
				.get(`${BE_BASE_URL}/end-by-start`, {
					params: {
						start_id: startPlaceId,
					},
				})
				.then((res) => {
					if (res?.data) {
						setEndPlaces(res.data);
					}
				})
				.catch((err) => console.log(err));
		}
	}, [startPlaceId]);

	const findSchedule = () => {
		axios
			.get(`${BE_BASE_URL}/schedule`, {
				params: {
					startPlace: startPlaceId,
					endPlace: endPlaceId,
					startDate: convertYYYYMMDDToDDMMYYYY(startDate),
				},
			})
			.then((res) => {
				if (res?.data?.length) {
					setSchedules(res.data);
				}
			})
			.catch((error) => console.log(error));
	};

	const createImgSrc = (typeCoach, numberSeat, garageName) => {
		const path = '/images/coach/background/';
		const str1 = typeCoach.toLowerCase();
		const str2 = numberSeat;
		const str3 = garageName.toLowerCase().replace(/\s/g, '-');

		return path + str1 + '-' + str2 + '-' + str3 + '.png';
	};

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

	const calculateHour = (duration) => {
		const hour = Math.floor(duration / 60);
		const minute = duration % 60;

		return hour + 'h' + minute + 'm';
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

	const clearData = () => {
		setSchedules([]);
		setScheduleSelected({});
	};

	useEffect(() => {
		if (JSON.stringify(scheduleSelected) !== '{}') {
			axios
				.get(`${BE_BASE_URL}/seat`, {
					params: {
						scheduleId: scheduleSelected.schedule_id,
					},
				})
				.then((res) => {
					if (res?.data) {
						setSeats([...res.data]);
					}
				})
				.catch((err) => console.error(err));

			contentRef.current.scrollTo({
				top: contentRef.current.scrollHeight + 200,
				left: 0,
				behavior: 'smooth',
			});
		}
	}, [scheduleSelected]);

	useEffect(() => {
		setPrice(scheduleSelected.price * seatSelected.length);
	}, [seatSelected]);

	const bookingHandler = () => {
		if (search.id !== 0 && search.type === 'customer') {
			axios
				.post(`${BE_BASE_URL}/booking`, {
					userId: search.id,
					scheduleId: scheduleSelected.schedule_id,
					seats: seatSelected,
					payment: 'offline',
					price,
					isPaid: isPaidSelected,
					discount: 0,
				})
				.then((res) => {
					if (res?.data?.message === 'Ticket booked') {
						clearData();
						setToastList([
							...toastList,
							<ToastComponent
								type='success'
								content={'Đặt vé thành công'}
							/>,
						]);
					}
				})
				.catch((err) => {
					console.log(err);
					setToastList([
						...toastList,
						<ToastComponent
							type='error'
							content={'Đặt vé thất bại'}
						/>,
					]);
				});
		} else {
			setErrorField('');

			if (!nameField.trim()) {
				setErrorField('name');

				contentRef.current.scrollTo({
					top: 0,
					left: 0,
					behavior: 'smooth',
				});

				return;
			} else if (!isVietnamesePhoneNumber(phoneField.trim())) {
				setErrorField('phone');

				contentRef.current.scrollTo({
					top: 0,
					left: 0,
					behavior: 'smooth',
				});

				return;
			}

			axios
				.post(`${BE_BASE_URL}/guest-booking`, {
					name: nameField,
					phone: phoneField,
					scheduleId: scheduleSelected.schedule_id,
					seats: seatSelected,
					payment: 'offline',
					price,
					isPaid: isPaidSelected,
					discount: 0,
				})
				.then((res) => {
					if (res?.data?.message === 'Ticket booked') {
						clearData();
						setToastList([
							...toastList,
							<ToastComponent
								type='success'
								content={'Đặt vé thành công'}
							/>,
						]);
					}
				})
				.catch((err) => {
					console.log(err);
					setToastList([
						...toastList,
						<ToastComponent
							type='error'
							content={'Đặt vé thất bại'}
						/>,
					]);
				});
		}
	};

	const paymentConfirmHandler = () => {
		axios
			.post(`${BE_BASE_URL}/payment-confirm`, {
				ticketId: search.id,
			})
			.then((res) => {
				if (res?.data?.message === 'success') {
					console.log('success');
				}
			})
			.catch((err) => console.error(err));
	};

	const updateTicketHandler = () => {
		const name = shuttle_bus_name_ref.current.innerText.trim();
		const phoneNumber = shuttle_bus_phone_ref.current.innerText.trim();
		const address = shuttle_bus_address_ref.current.innerText.trim();

		if (name === '') {
			setToastList([
				...toastList,
				<ToastComponent
					type='error'
					content={'Tên khách hàng không được bỏ trống'}
				/>,
			]);

			return;
		} else if (phoneNumber === '') {
			setToastList([
				...toastList,
				<ToastComponent
					type='error'
					content={'Số điện thoại khách hàng không được bỏ trống'}
				/>,
			]);

			return;
		} else if (address === '') {
			setToastList([
				...toastList,
				<ToastComponent
					type='error'
					content={'Địa chỉ khách hàng không được bỏ trống'}
				/>,
			]);

			return;
		}

		if (isShowShuttleBusForm) {
			axios
				.post(`${BE_BASE_URL}/shuttle-bus`, {
					ticketId: search.id,
					name,
					phoneNumber,
					address,
				})
				.then((res) => {
					if (res?.data?.message === 'success') {
						setToastList([
							...toastList,
							<ToastComponent
								type='success'
								content={'Đăng ký xe trung chuyển thành công'}
							/>,
						]);
					}
				})
				.catch((err) => console.error(err));
		} else {
			axios
				.put(`${BE_BASE_URL}/shuttle-bus`, {
					ticketId: search.id,
					name,
					phoneNumber,
					address,
				})
				.then((res) => {
					if (res?.data?.message === 'success') {
						setToastList([
							...toastList,
							<ToastComponent
								type='success'
								content={'Cập nhật xe trung chuyển thành công'}
							/>,
						]);
					}
				})
				.catch((err) => console.error(err));
		}
	};

	return (
		<>
			<div className={cx('wrap')}>
				<div className={cx('navbar')}>
					{search.id !== 0 && search.type === 'ticket' && (
						<button
							style={{
								backgroundColor:
									type === 'view'
										? 'var(--primary-color)'
										: '#39a7ff',
							}}
							onClick={() =>
								onChangeManagerState('manager-ticket/view')
							}
						>
							Xem vé xe
						</button>
					)}
					<button
						style={{
							backgroundColor:
								type === 'add'
									? 'var(--primary-color)'
									: '#39a7ff',
						}}
						onClick={() =>
							onChangeManagerState('manager-ticket/add')
						}
					>
						Thêm vé xe
					</button>
				</div>
				{type === 'add' && (
					<div
						className={cx('content')}
						ref={contentRef}
					>
						<section>
							<div className={cx('heading')}>
								THÔNG TIN KHÁCH HÀNG
							</div>
							{search.id !== 0 && search.type === 'customer' && (
								<div className={cx('group-info')}>
									<div className={cx('info')}>
										Họ và tên: {user.name}
									</div>
									<div className={cx('info')}>
										Giới tính: {user.gender}
									</div>
									<div className={cx('info')}>
										Ngày sinh:{' '}
										{convertYYYYMMDDToDDMMYYYY(
											user.date_of_birth
										)}
									</div>
									<div className={cx('info')}>
										Địa chỉ:{' '}
										{user.district + ', ' + user.city}
									</div>
								</div>
							)}
							{search.id !== 0 && search.type === 'customer' && (
								<div className={cx('group-info')}>
									<div className={cx('info')}>
										CCCD: {user.citizen_identification}
									</div>
									<div className={cx('info')}>
										Số điện thoại: {user.phone}
									</div>
									<div className={cx('info')}>
										Email: {user.email}
									</div>
								</div>
							)}
							{(search.id === 0 ||
								search.type !== 'customer') && (
								<QuickRegisterForm
									setName={setNameField}
									setPhone={setPhoneField}
									isError={errorField}
								/>
							)}
						</section>
						<section>
							<div className={cx('heading')}>
								THÔNG TIN LỊCH TRÌNH
							</div>
							<div className={cx('group-info', '--start')}>
								<div className={cx('info')}>
									<label htmlFor='start-place-input'>
										Nơi xuất phát:
									</label>
									<input
										type='text'
										list='start-place-list'
										id='start-place-input'
										onChange={(e) => onStartPlaceInput(e)}
									/>
									<datalist id='start-place-list'>
										{startPlaces.length > 0 &&
											startPlaces.map((place, index) => (
												<option
													key={index}
													value={place.name}
												/>
											))}
									</datalist>
								</div>
								<div className={cx('info')}>
									<label htmlFor='start-place-input'>
										Nơi đến:
									</label>
									<input
										type='text'
										list='end-place-list'
										id='end-place-input'
										onChange={(e) => onEndPlaceInput(e)}
									/>
									<datalist id='end-place-list'>
										{endPlaces.length > 0 &&
											endPlaces.map((place, index) => (
												<option
													key={index}
													value={place.name}
												/>
											))}
									</datalist>
								</div>
							</div>
							<div className={cx('group-info')}>
								<div className={cx('info')}>
									<label htmlFor='start-date-input'>
										Ngày xuất phát:
									</label>
									<input
										type='date'
										name=''
										id='start-date-input'
										onChange={(e) =>
											setStartDate(e.target.value)
										}
									/>
								</div>
								<div className={cx('info')}>
									<label htmlFor='type-coach-input'>
										Loại xe:
									</label>
									<select
										id='type-coach-input'
										onChange={(e) =>
											setTypeCoach(e.target.value)
										}
									>
										<option value=''>Tất cả</option>
										<option value='Giường'>Giường</option>
										<option value='Ghế'>Ghế</option>
									</select>
								</div>
								<div className={cx('info')}>
									<label htmlFor='garage-input'>
										Nhà xe:
									</label>
									<select
										id='garage-input'
										onChange={(e) =>
											setGarageSelected(e.target.value)
										}
									>
										<option value=''>Tất cả</option>
										{garages.length > 0 &&
											garages.map((garage, index) => (
												<option
													key={index}
													value={garage.name}
												>
													{garage.name.replace(
														/^NHÀ XE\s*/,
														''
													)}
												</option>
											))}
									</select>
								</div>
								<div className={cx('info')}>
									<button onClick={findSchedule}>
										Tìm chuyến
									</button>
								</div>
								<div className={cx('info')}>
									<button onClick={clearData}>Xoá</button>
								</div>
							</div>
						</section>
						<section>
							{schedules.map(
								(route, index) =>
									(typeCoach === route.type_coach ||
										typeCoach === '') &&
									(garageSelected === route.garage_name ||
										garageSelected === '') && (
										<div
											className={cx(
												'item',
												scheduleSelected ===
													route.schedule_id &&
													'active'
											)}
											key={index}
											onClick={() =>
												setScheduleSelected(route)
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
											<div
												className={cx(
													'schedule-content'
												)}
											>
												<div className={cx('title')}>
													Nhà xe {route.garage_name}
												</div>
												<div
													className={cx('type-coach')}
												>
													{route.type_coach +
														' ' +
														route.number_seat +
														' chỗ'}
												</div>
												<div
													className={cx(
														'time-and-place'
													)}
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
															className={cx(
																'start'
															)}
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
																{
																	route.start_place
																}
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
														<div
															className={cx(
																'end'
															)}
														>
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
																{
																	route.end_place
																}
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
												<div
													className={cx('empty-seat')}
												>
													{`Còn ${route.empty_seats} chỗ trống`}
												</div>
												<button
													className={cx('choose-btn')}
												>
													Chọn chuyến
												</button>
											</div>
										</div>
									)
							)}
						</section>
						{JSON.stringify(scheduleSelected) !== '{}' && (
							<section className={cx('--child-center')}>
								<Seat
									type={scheduleSelected.type_coach}
									list={seats}
									setSeat={setSeatSelected}
									isSelectSeat={isSelectSeat}
									autoSelectSeat={autoSelectSeat}
								/>
							</section>
						)}
						{JSON.stringify(scheduleSelected) !== '{}' && (
							<section>
								<Ticket
									scheduleId={scheduleSelected.schedule_id}
									seat={seatSelected}
									onclick={false}
									price={price}
								/>
							</section>
						)}
						{JSON.stringify(scheduleSelected) !== '{}' && (
							<section className={cx('--popup')}>
								<button
									className={cx(
										!isPaidSelected
											? '--primary-border'
											: '--blue-border'
									)}
									onClick={() =>
										setIsPaidSelected((prev) => !prev)
									}
								>
									{isPaidSelected
										? 'Đã thanh toán'
										: 'Chưa thanh toán'}
								</button>
								<button onClick={bookingHandler}>Đặt vé</button>
							</section>
						)}
					</div>
				)}
				{type === 'view' &&
					search.id !== 0 &&
					search.type === 'ticket' &&
					JSON.stringify(ticket) !== '{}' && (
						<div className={cx('content')}>
							<section>
								<div className={cx('heading')}>
									THÔNG TIN KHÁCH HÀNG
								</div>
								<div className={cx('group-info', '--start')}>
									<div className={cx('info')}>
										Họ và Tên: {ticket.name}
									</div>
									<div className={cx('info')}>
										Số điện thoại: {ticket.phone}
									</div>
								</div>
							</section>
							<section>
								<div className={cx('heading')}>
									THÔNG TIN LỊCH TRÌNH
								</div>
								<div className={cx('group-info', '--start')}>
									<div className={cx('info')}>
										Nơi xuất phát: {ticket.start}
									</div>
									<div className={cx('info')}>
										Nơi đến: {ticket.end}
									</div>
									<div className={cx('info')}>
										Khoảng cách: {ticket.distance}km
									</div>
								</div>
								<div className={cx('group-info', '--start')}>
									<div className={cx('info')}>
										Ngày khởi hành:{' '}
										{formatDate(ticket.date_start)}
									</div>
									<div className={cx('info')}>
										Thời gian khởi hành:{' '}
										{formatTime(ticket.time_start)}
									</div>
									<div className={cx('info')}>
										Thời gian dự kiến đến:{' '}
										{calculateTime(
											ticket.time_start,
											ticket.duration
										)}
									</div>
								</div>
							</section>
							<section>
								<div className={cx('heading')}>
									THÔNG TIN XE
								</div>
								<div className={cx('group-info', '--start')}>
									<div className={cx('info')}>
										Tên nhà xe: {ticket.garage_name}
									</div>
									<div className={cx('info')}>
										Loại xe: {ticket.type_coach} -{' '}
										{ticket.number_seat} chỗ
									</div>
								</div>
								<div className={cx('group-info', '--start')}>
									<div className={cx('info')}>
										Biển số xe: {ticket.license_plates}
									</div>
									<div className={cx('info')}>
										Số xe: {ticket.vehicle_number}
									</div>
									<div className={cx('info')}>
										Hãng xe: {ticket.manufacturer}
									</div>
								</div>
							</section>
							<section>
								<div className={cx('heading')}>
									THÔNG TIN VÉ XE
								</div>
								<div className={cx('group-info', '--start')}>
									<div className={cx('info')}>
										Ngày đặt vé:{' '}
										{formatDate(ticket.ticket_date)}
									</div>
									<div className={cx('info')}>
										Thời gian đặt vé:{' '}
										{formatTime(ticket.ticket_time)}
									</div>
									<div className={cx('info')}>
										Vị trí {ticket.type_coach.toLowerCase()}{' '}
										đã đặt: {ticket.type_coach} số{' '}
										{ticket.seat}
									</div>
									<div className={cx('info')}>
										Khứ hồi:{' '}
										{!!ticket.round_trip ? 'Có' : 'Không'}
									</div>
								</div>
								<div className={cx('group-info', '--start')}>
									<div className={cx('info')}>
										Giá vé niêm yết:{' '}
										{ticket.original_price.toLocaleString(
											'vi-VN'
										)}{' '}
										đồng
									</div>
									<div className={cx('info')}>
										Chiếc khấu: {ticket.discount}%
									</div>
									<div className={cx('info')}>
										Giá vé phải trả:{' '}
										{ticket.price.toLocaleString('vi-VN')}{' '}
										đồng
									</div>
								</div>
								<div className={cx('group-info', '--start')}>
									<div className={cx('info')}>
										Hình thức thanh toán:{' '}
										{ticket.payment === 'online'
											? 'Chuyển khoản'
											: 'Thanh toán tại quầy'}
									</div>
									<div className={cx('info')}>
										Trạng thái thanh toán:{' '}
										{!!ticket.isPaid
											? 'Đã thanh toán'
											: 'Chưa thanh toán'}
									</div>
								</div>
							</section>
							<section>
								<div className={cx('heading')}>
									ĐĂNG KÝ XE TRUNG CHUYỂN
								</div>
								{!!!ticket.shuttle_bus_address &&
									!isShowShuttleBusForm && (
										<button
											className={cx('--text')}
											onClick={() =>
												setIsShowShuttleBusForm(true)
											}
										>
											Đăng ký tại đây
										</button>
									)}
								{(!!ticket.shuttle_bus_address ||
									isShowShuttleBusForm) && (
									<div
										className={cx(
											'group-info',
											'--start',
											'--no-gap'
										)}
									>
										<div
											className={cx('info')}
											onClick={() =>
												shuttle_bus_name_ref?.current?.focus()
											}
										>
											Tên khách hàng:
											<span
												className={cx('value')}
												contentEditable
												ref={shuttle_bus_name_ref}
												suppressContentEditableWarning={
													true
												}
											>
												{ticket.shuttle_bus_name}
											</span>
										</div>
										<div
											className={cx('info')}
											onClick={() =>
												shuttle_bus_phone_ref?.current?.focus()
											}
										>
											Số điện thoại khách hàng:
											<span
												className={cx('value')}
												contentEditable
												ref={shuttle_bus_phone_ref}
												suppressContentEditableWarning={
													true
												}
											>
												{ticket.shuttle_bus_phone}
											</span>
										</div>
									</div>
								)}
								{(!!ticket.shuttle_bus_address ||
									isShowShuttleBusForm) && (
									<div
										className={cx('group-info', '--start')}
									>
										<div
											className={cx('info')}
											onClick={() =>
												shuttle_bus_address_ref?.current?.focus()
											}
										>
											Địa chỉ:
											<span
												className={cx('value')}
												contentEditable
												ref={shuttle_bus_address_ref}
												suppressContentEditableWarning={
													true
												}
											>
												{ticket.shuttle_bus_address}
											</span>
										</div>
									</div>
								)}
							</section>
							<section className={cx('--popup')}>
								{!!!ticket.isPaid && (
									<button
										className={cx('--blue-border')}
										onClick={paymentConfirmHandler}
									>
										Xác nhận đã thanh toán
									</button>
								)}
								<button onClick={updateTicketHandler}>
									Cập nhật lại vé xe
								</button>
							</section>
						</div>
					)}
			</div>
			<ToastContainerComponent
				toastList={toastList}
				setToastList={setToastList}
			/>
		</>
	);
};

export default ManagerTicket;
