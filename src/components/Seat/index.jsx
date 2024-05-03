import { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import { useSelector } from 'react-redux';

import styles from './Seat.module.scss';
import axios from 'axios';

const cx = classNames.bind(styles);
const BE_BASE_URL = import.meta.env.VITE_BE_BASE_URL;

const Seat = ({ type, list, setSeat, isSelectSeat }) => {
	const [ticket, setTicket] = useState({});
	const [seats, setSeats] = useState([]);

	const scheduleId = useSelector((state) => state.scheduleID);
	const user = useSelector((state) => state.users);

	const chooseSeat = (e, seat) => {
		if (e?.target?.className === cx('disable')) return;
		if (!isSelectSeat) return;

		if (e?.target?.className === '') {
			setSeat((prev) => [...prev, seat]);
			e.target.className = cx('active');
		} else {
			e.target.className = '';
			setSeat((prev) => prev.filter((item) => item !== seat));
		}
	};

	useEffect(() => {
		// Check schedule had booked
		if (user.id !== 0) {
			axios
				.get(`${BE_BASE_URL}/booking`, {
					params: {
						scheduleId,
						userId: user.id,
					},
				})
				.then((res) => {
					if (!res?.data?.message) {
						setTicket(res.data[0]);
						setSeats(res.data[0].seat.split(','));
					}
				})
				.catch((err) => console.log(err));
		}
	}, []);

	const renderSeat = (start) => {
		const result = [];

		for (let i = start; i < list.length / 2 + start - 1; i += 3) {
			const child = [];

			for (let j = 0; j < 3; j++) {
				const index = i + j;

				child.push(
					index === 16 + start ? (
						<div
							className={cx('disable')}
							key={`disable-${index}`}
						></div>
					) : index > 16 + start ? (
						<div
							key={list[index - 1].number}
							className={
								list[index - 1].state === 'full'
									? seats.includes(list[index - 1].number)
										? cx('active')
										: cx('disable')
									: ''
							}
							onClick={(e) =>
								chooseSeat(e, list[index - 1].number)
							}
							style={{
								cursor: isSelectSeat
									? 'pointer'
									: 'not-allowed',
							}}
						>
							{list[index - 1].number}
						</div>
					) : (
						<div
							key={list[index].number}
							className={
								list[index].state === 'full'
									? seats.includes(list[index].number)
										? cx('active')
										: cx('disable')
									: ''
							}
							onClick={(e) => chooseSeat(e, list[index].number)}
							style={{
								cursor: isSelectSeat
									? 'pointer'
									: 'not-allowed',
							}}
						>
							{list[index].number}
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
	};

	return (
		<div className={cx('wrap')}>
			<div className={cx('note')}>
				<div className={cx('title')}>Chú thích</div>
				<div className={cx('item')}>
					<div className={cx('white')}></div>
					<div className={cx('label')}>Ghế trống</div>
				</div>
				<div className={cx('item')}>
					<div className={cx('gray')}></div>
					<div className={cx('label')}>Ghế không bán</div>
				</div>
				<div className={cx('item')}>
					<div className={cx('blue')}></div>
					<div className={cx('label')}>Ghế đã đặt</div>
				</div>
			</div>
			{type === 'Ghế' && list.length === 45 && (
				<div className={cx('type-1')}>
					<div className={cx('seat')}>
						<div className={cx('block')}>Lái xe</div>
						<div className={cx('block')}>Cửa xe</div>
					</div>
					{Array.from(
						{ length: list.length / 4 },
						(_, blockIndex) => (
							<div
								key={blockIndex}
								className={cx('seat')}
							>
								<div className={cx('block')}>
									{list
										.slice(
											blockIndex * 4,
											blockIndex * 4 + 2
										)
										.map((seat, seatIndex) => (
											<div
												key={seat.number}
												className={
													seat.state === 'full'
														? seats.includes(
																seat.number
														  )
															? cx('active')
															: cx('disable')
														: ''
												}
												onClick={(e) =>
													chooseSeat(e, seat.number)
												}
												style={{
													cursor: isSelectSeat
														? 'pointer'
														: 'not-allowed',
												}}
											>
												{`${seat.number}`}
											</div>
										))}
								</div>
								<div className={cx('block')}>
									{list
										.slice(
											blockIndex * 4 + 2,
											blockIndex * 4 + 4
										)
										.map((seat, seatIndex) => (
											<div
												key={seat.number}
												className={
													seat.state === 'full'
														? seats.includes(
																seat.number
														  )
															? cx('active')
															: cx('disable')
														: ''
												}
												onClick={(e) =>
													chooseSeat(e, seat.number)
												}
												style={{
													cursor: isSelectSeat
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
												list[44].state === 'full'
													? seats.includes(
															list[44].number
													  )
														? cx('active')
														: cx('disable')
													: ''
											}
											onClick={(e) =>
												chooseSeat(e, list[44].number)
											}
											style={{
												cursor: isSelectSeat
													? 'pointer'
													: 'not-allowed',
											}}
										>
											{`${list[44].number}`}
										</div>
									</div>
								)}
							</div>
						)
					)}
				</div>
			)}
			{type === 'Giường' && list.length === 40 && (
				<div className={cx('type-2')}>
					<div className={cx('title')}>Tầng 1</div>
					<div className={cx('title')}>Tầng 2</div>
					<div className={cx('item')}>
						<div className={cx('seat')}>Lái xe</div>
						{renderSeat(0)}
					</div>
					<div className={cx('item')}>
						<div className={cx('seat')}></div>
						{renderSeat(20)}
					</div>
				</div>
			)}
		</div>
	);
};

export default Seat;
