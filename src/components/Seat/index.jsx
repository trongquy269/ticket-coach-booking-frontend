import { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

import styles from './Seat.module.scss';

const cx = classNames.bind(styles);
const BE_BASE_URL = import.meta.env.VITE_BE_BASE_URL;

const Seat = ({
	typeCoachGo,
	typeCoachBack,
	startDateGo,
	startDateBack,
	isSelectSeatGo,
	isSelectSeatBack,
	goSeatPaid,
	backSeatPaid,
	isEditSeat,
}) => {
	const [goSeats, setGoSeats] = useState([]);
	const [backSeats, setBackSeats] = useState([]);
	const [goSeatsSelected, setGoSeatsSelected] = useState([]);
	const [backSeatsSelected, setBackSeatsSelected] = useState([]);

	const dispatch = useDispatch();
	const searchURL = useLocation().search;
	const scheduleId = +new URLSearchParams(searchURL).get('from');
	const scheduleBackId = +new URLSearchParams(searchURL).get('to');
	const isRoundTrip = useSelector((state) => state.isRoundTrip);
	const rootGoSeatPaid = useSelector((state) => state.seats);
	const rootBackSeatPaid = useSelector((state) => state.seatsBack);

	useEffect(() => {
		if (goSeatPaid.length > 0) {
			setGoSeatsSelected(goSeatPaid);
			setBackSeatsSelected(backSeatPaid);
		}
	}, [goSeatPaid]);

	useEffect(() => {
		if (!isEditSeat) {
			setGoSeatsSelected(goSeatPaid);
			setBackSeatsSelected(backSeatPaid);

			// Remove the 'active' class
			if (goSeatPaid.length > 0) {
				const activeElements = document.querySelectorAll(
					`.${cx('active')}`
				);

				activeElements.forEach((el) => {
					if (
						!goSeatPaid.includes(el.textContent) ||
						!backSeatPaid.includes(el.textContent)
					) {
						el.classList.remove(cx('active'));
					}
				});
			}
		}
	}, [isEditSeat]);

	function chooseSeat(e, seat, typeSchedule) {
		if (e?.target?.className === cx('disable')) return;

		if (e?.target?.className === '') {
			if (typeSchedule === 'go') {
				if (!isSelectSeatGo) return;

				if (isEditSeat) {
					setGoSeatsSelected((prev) => {
						const updatedSeats =
							prev.length === goSeatPaid.length
								? prev.slice(1)
								: prev;

						return [...updatedSeats, seat];
					});
				} else {
					setGoSeatsSelected((prev) => [...prev, seat]);
				}
			} else {
				if (!isSelectSeatBack) return;

				if (isEditSeat) {
					setBackSeatsSelected((prev) => {
						const updatedSeats =
							prev.length === backSeatPaid.length
								? prev.slice(1)
								: prev;

						return [...updatedSeats, seat];
					});
				} else {
					setBackSeatsSelected((prev) => [...prev, seat]);
				}
			}

			e.target.className = cx('active');
		} else {
			if (typeSchedule === 'go') {
				if (!isSelectSeatGo) return;

				setGoSeatsSelected((prev) =>
					prev.filter((item) => item !== seat)
				);
			} else {
				if (!isSelectSeatBack) return;

				setBackSeatsSelected((prev) =>
					prev.filter((item) => item !== seat)
				);
			}
			e.target.className = '';
		}
	}

	useEffect(() => {
		dispatch({ type: 'SEATS_GO/CHANGE', payload: goSeatsSelected });
	}, [goSeatsSelected]);

	useEffect(() => {
		dispatch({ type: 'SEATS_BACK/CHANGE', payload: backSeatsSelected });
	}, [backSeatsSelected]);

	useEffect(() => {
		if (!!scheduleId) {
			axios
				.get(`${BE_BASE_URL}/seat`, {
					params: {
						scheduleId,
					},
				})
				.then((res) => {
					if (res?.data) {
						setGoSeats(res?.data);
					}
				})
				.catch((err) => console.log(err));
		}

		if (!!scheduleBackId) {
			axios
				.get(`${BE_BASE_URL}/seat`, {
					params: {
						scheduleId: scheduleBackId,
					},
				})
				.then((res) => {
					if (res?.data) {
						setBackSeats(res?.data);
					}
				})
				.catch((err) => console.log(err));
		}
	}, []);

	function renderSeat(start, typeSchedule) {
		const result = [];
		const list = typeSchedule === 'go' ? goSeats : backSeats;
		const seats = !isEditSeat
			? typeSchedule === 'go'
				? goSeatsSelected
				: backSeatsSelected
			: typeSchedule === 'go'
			? goSeatPaid
			: backSeatPaid;
		const seatPaid = typeSchedule === 'go' ? goSeatPaid : backSeatPaid;

		for (let i = start; i < list.length / 2 + start - 1; i += 3) {
			const child = [];

			for (let j = 0; j < 3; j++) {
				const index = i + j;
				const indexList = index > 16 ? index - 1 : index;

				// Hide 16th chair
				child.push(
					index === 16 + start ? (
						<div
							className={cx('disable')}
							key={`disable-${index}`}
						></div>
					) : index > 16 + start ? (
						<div
							key={list[indexList]?.number}
							className={
								list[indexList]?.state === 'full'
									? !isEditSeat && seatPaid.length > 0
										? seatPaid.includes(
												list[indexList]?.number
										  )
											? cx('paid')
											: cx('disable')
										: seats.includes(
												list[indexList]?.number
										  )
										? cx('active')
										: cx('disable')
									: ''
							}
							onClick={(e) =>
								chooseSeat(
									e,
									list[indexList]?.number,
									typeSchedule
								)
							}
							style={{
								cursor: (
									typeSchedule === 'go'
										? isSelectSeatGo
										: isSelectSeatBack
								)
									? 'pointer'
									: 'not-allowed',
							}}
						>
							{list[indexList]?.number}
						</div>
					) : (
						<div
							key={list[index]?.number}
							className={
								list[indexList]?.state === 'full'
									? !isEditSeat && seatPaid.length > 0
										? seatPaid.includes(
												list[indexList]?.number
										  )
											? cx('paid')
											: cx('disable')
										: seats.includes(
												list[indexList]?.number
										  )
										? cx('active')
										: cx('disable')
									: ''
							}
							onClick={(e) =>
								chooseSeat(e, list[index]?.number, typeSchedule)
							}
							style={{
								cursor: (
									typeSchedule === 'go'
										? isSelectSeatGo
										: isSelectSeatBack
								)
									? 'pointer'
									: 'not-allowed',
							}}
						>
							{list[index]?.number}
						</div>
					)
				);

				if (
					start === 20 &&
					(index === 18 + start || index === 19 + start)
				) {
					child.push(
						<div
							className={cx('disable')}
							key={`disable-${index}`}
						></div>
					);
				}
			}

			result.push(
				<div
					className={cx('seat', `${i}`)}
					key={i}
				>
					{child}
				</div>
			);
		}

		return result;
	}

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
	console.log(scheduleBackId);

	return (
		<div className={cx('wrap')}>
			<div className={cx('main', !!scheduleBackId && '--line')}>
				<div className={cx('content')}>
					<div className={cx('title')}>
						<span>CHỌN {typeCoachGo?.toUpperCase()}</span>
						<button>Thông tin xe</button>
					</div>
					<div className={cx('subtitle')}>
						Chuyến đi - {renderDate(startDateGo)}
					</div>
					{typeCoachGo === 'Ghế' && goSeats.length === 45 && (
						<div className={cx('type-1')}>
							<div className={cx('seat')}>
								<div className={cx('block', '--driver')}>
									Lái xe
								</div>
								<div className={cx('block', '--driver')}>
									Cửa xe
								</div>
							</div>
							{Array.from(
								{ length: goSeats.length / 4 },
								(_, blockIndex) => (
									<div
										key={blockIndex}
										className={cx('seat')}
									>
										<div className={cx('block')}>
											{goSeats
												.slice(
													blockIndex * 4,
													blockIndex * 4 + 2
												)
												.map((seat, seatIndex) => (
													<div
														key={seat.number}
														className={
															seat.state ===
															'full'
																? !isEditSeat &&
																  goSeatPaid.length >
																		0
																	? goSeatPaid.includes(
																			seat.number
																	  )
																		? cx(
																				'paid'
																		  )
																		: cx(
																				'disable'
																		  )
																	: goSeatsSelected.includes(
																			seat.number
																	  )
																	? cx(
																			'active'
																	  )
																	: cx(
																			'disable'
																	  )
																: ''
														}
														onClick={(e) =>
															chooseSeat(
																e,
																seat.number,
																'go'
															)
														}
														style={{
															cursor: isSelectSeatGo
																? 'pointer'
																: 'not-allowed',
														}}
													>
														{`${seat.number}`}
													</div>
												))}
										</div>
										<div className={cx('block')}>
											{goSeats
												.slice(
													blockIndex * 4 + 2,
													blockIndex * 4 + 4
												)
												.map((seat, seatIndex) => (
													<div
														key={seat.number}
														className={
															seat.state ===
															'full'
																? !isEditSeat &&
																  goSeatPaid.length >
																		0
																	? goSeatPaid.includes(
																			seat.number
																	  )
																		? cx(
																				'paid'
																		  )
																		: cx(
																				'disable'
																		  )
																	: goSeatsSelected.includes(
																			seat.number
																	  )
																	? cx(
																			'active'
																	  )
																	: cx(
																			'disable'
																	  )
																: ''
														}
														onClick={(e) =>
															chooseSeat(
																e,
																seat.number,
																'go'
															)
														}
														style={{
															cursor: isSelectSeatGo
																? 'pointer'
																: 'not-allowed',
														}}
													>
														{`${seat.number}`}
													</div>
												))}
										</div>
										{blockIndex === 10 && (
											<div className={cx('block')}>
												<div
													className={
														goSeats[44].state ===
														'full'
															? !isEditSeat &&
															  goSeatPaid.length >
																	0
																? goSeatPaid.includes(
																		goSeats[44]
																  )
																	? cx('paid')
																	: cx(
																			'disable'
																	  )
																: goSeatsSelected.includes(
																		goSeats[44]
																  )
																? cx('active')
																: cx('disable')
															: ''
													}
													onClick={(e) =>
														chooseSeat(
															e,
															goSeats[44].number,
															'go'
														)
													}
													style={{
														cursor: isSelectSeatGo
															? 'pointer'
															: 'not-allowed',
													}}
												>
													{`${goSeats[44].number}`}
												</div>
											</div>
										)}
									</div>
								)
							)}
						</div>
					)}
					{typeCoachGo === 'Giường' && goSeats.length === 40 && (
						<div className={cx('type-2')}>
							<div className={cx('item')}>
								<div className={cx('seat', '--driver')}>
									Lái xe
								</div>
								{renderSeat(0, 'go')}
							</div>
							<div className={cx('item')}>
								<div className={cx('seat')}></div>
								{renderSeat(20, 'go')}
							</div>
							<div className={cx('title')}>Tầng dưới</div>
							<div className={cx('title')}>Tầng trên</div>
						</div>
					)}
				</div>
				{!!scheduleBackId && (
					<div className={cx('content')}>
						<div className={cx('title')}>
							<span>CHỌN {typeCoachBack?.toUpperCase()}</span>
							<button>Thông tin xe</button>
						</div>
						<div className={cx('subtitle')}>
							Chuyến về - {renderDate(startDateBack)}
						</div>
						{typeCoachBack === 'Ghế' && backSeats.length === 45 && (
							<div className={cx('type-1')}>
								<div className={cx('seat')}>
									<div className={cx('block', '--driver')}>
										Lái xe
									</div>
									<div className={cx('block', '--driver')}>
										Cửa xe
									</div>
								</div>
								{Array.from(
									{ length: backSeats.length / 4 },
									(_, blockIndex) => (
										<div
											key={blockIndex}
											className={cx('seat')}
										>
											<div className={cx('block')}>
												{backSeats
													.slice(
														blockIndex * 4,
														blockIndex * 4 + 2
													)
													.map((seat, seatIndex) => (
														<div
															key={seat.number}
															className={
																seat.state ===
																'full'
																	? !isEditSeat &&
																	  backSeatPaid.length >
																			0
																		? backSeatPaid.includes(
																				seat.number
																		  )
																			? cx(
																					'paid'
																			  )
																			: cx(
																					'disable'
																			  )
																		: backSeatsSelected.includes(
																				seat.number
																		  )
																		? cx(
																				'active'
																		  )
																		: cx(
																				'disable'
																		  )
																	: ''
															}
															onClick={(e) =>
																chooseSeat(
																	e,
																	seat.number,
																	'back'
																)
															}
															style={{
																cursor: isSelectSeatBack
																	? 'pointer'
																	: 'not-allowed',
															}}
														>
															{`${seat.number}`}
														</div>
													))}
											</div>
											<div className={cx('block')}>
												{backSeats
													.slice(
														blockIndex * 4 + 2,
														blockIndex * 4 + 4
													)
													.map((seat, seatIndex) => (
														<div
															key={seat.number}
															className={
																seat.state ===
																'full'
																	? !isEditSeat &&
																	  backSeatPaid.length >
																			0
																		? backSeatPaid.includes(
																				seat.number
																		  )
																			? cx(
																					'paid'
																			  )
																			: cx(
																					'disable'
																			  )
																		: backSeatsSelected.includes(
																				seat.number
																		  )
																		? cx(
																				'active'
																		  )
																		: cx(
																				'disable'
																		  )
																	: ''
															}
															onClick={(e) =>
																chooseSeat(
																	e,
																	seat.number,
																	'back'
																)
															}
															style={{
																cursor: isSelectSeatBack
																	? 'pointer'
																	: 'not-allowed',
															}}
														>
															{`${seat.number}`}
														</div>
													))}
											</div>
											{blockIndex === 10 && (
												<div className={cx('block')}>
													<div
														className={
															backSeats[44]
																.state ===
															'full'
																? !isEditSeat &&
																  backSeatPaid.length >
																		0
																	? backSeatPaid.includes(
																			backSeats[44]
																	  )
																		? cx(
																				'paid'
																		  )
																		: cx(
																				'disable'
																		  )
																	: backSeatsSelected.includes(
																			backSeats[44]
																	  )
																	? cx(
																			'active'
																	  )
																	: cx(
																			'disable'
																	  )
																: ''
														}
														onClick={(e) =>
															chooseSeat(
																e,
																backSeats[44]
																	.number,
																'back'
															)
														}
														style={{
															cursor: isSelectSeatBack
																? 'pointer'
																: 'not-allowed',
														}}
													>
														{`${backSeats[44].number}`}
													</div>
												</div>
											)}
										</div>
									)
								)}
							</div>
						)}
						{typeCoachBack === 'Giường' &&
							backSeats.length === 40 && (
								<div className={cx('type-2')}>
									<div className={cx('item')}>
										<div className={cx('seat', '--driver')}>
											Lái xe
										</div>
										{renderSeat(0, 'back')}
									</div>
									<div className={cx('item')}>
										<div className={cx('seat')}></div>
										{renderSeat(20, 'back')}
									</div>
									<div className={cx('title')}>Tầng dưới</div>
									<div className={cx('title')}>Tầng trên</div>
								</div>
							)}
					</div>
				)}
			</div>
			<div className={cx('note')}>
				<div className={cx('title')}>Chú thích</div>
				<div className={cx('item')}>
					<div className={cx('white')}></div>
					<div className={cx('label')}>Chỗ trống</div>
				</div>
				<div className={cx('item')}>
					<div className={cx('gray')}></div>
					<div className={cx('label')}>Chỗ không bán</div>
				</div>
				<div className={cx('item')}>
					<div className={cx('blue')}></div>
					<div className={cx('label')}>Chỗ đang chọn</div>
				</div>
				<div className={cx('item')}>
					<div className={cx('red')}></div>
					<div className={cx('label')}>Chỗ đã mua</div>
				</div>
			</div>
			<div className={cx('attentive')}>
				Lưu ý: Quý khách có thể thay đổi vị trí ngồi/nằm trước thời gian
				xuất bến 4 giờ.
			</div>
		</div>
	);
};

export default Seat;
