import { useEffect, useState, useRef } from 'react';
import classNames from 'classnames/bind';
import { useDispatch, useSelector } from 'react-redux';
import QRCode from 'react-qr-code';
import axios from 'axios';

import styles from './Bill.module.scss';

import Ticket from '../Ticket';
import Overlay from '../Overlay';
import Notification from '../Notification';

const cx = classNames.bind(styles);

function Bill({ scheduleId, seat, onclick, setClose }) {
	const [isOnlinePay, setIsOnlinePay] = useState(false);
	const [isShowNotification, setIsShowNotification] = useState(false);
	const [message, setMessage] = useState('');
	const [code, setCode] = useState('');
	const [countdown, setCountdown] = useState('');
	const [intervalId, setIntervalId] = useState(null);
	const [countForATimes, setCountForATimes] = useState(0);
	const [countForManyTimes, setCountForManyTimes] = useState(0);

	const dispatch = useDispatch();
	const user = useSelector((state) => state.users);
	const codeInputRef = useRef(null);

	const closeBill = () => {
		setClose(true);
	};

	const generateCode = () => {
		if (intervalId) {
			clearInterval(intervalId);
		}

		if (setCountForATimes !== 0) {
			setCountForManyTimes((pre) => pre + 1);
			setCountForATimes(0);
		}

		setCode(Math.random().toString().substring(2, 8));

		// Reset the countdown and start a new interval
		setCountdown(59);
		const newInterval = setInterval(() => {
			setCountdown((pre) => pre - 1);
		}, 1000);

		setIntervalId(newInterval);
	};

	useEffect(() => {
		if (isOnlinePay) {
			dispatch({
				type: 'SCHEDULE/SET_DISCOUNT',
				payload: 5,
			});

			generateCode();
		} else {
			dispatch({
				type: 'SCHEDULE/SET_DISCOUNT',
				payload: 0,
			});
		}
	}, [isOnlinePay]);

	useEffect(() => {
		if (!isOnlinePay) return;

		if (countdown === '' && code !== '') {
			setCountdown(59);
		}

		if (countdown === 0) {
			setCountdown('(Mã đã hết hạn)');
			clearInterval(intervalId);
		}
	}, [countdown, intervalId]);

	const submit = () => {
		if (user.id === 0) {
			setMessage('Vui lòng đăng nhập tài khoản để tiến hành thanh toán');
			setIsShowNotification(true);

			setTimeout(() => {
				setIsShowNotification(false);
			}, 7300);

			return;
		} else {
			if (isOnlinePay) {
				setCountForATimes((pre) => pre + 1);

				if (countForManyTimes > 2) {
					setMessage(
						'Vì chính sách bảo mật, bạn chỉ có thể nhận mã 3 lần'
					);
					setIsShowNotification(true);

					setTimeout(() => {
						setIsShowNotification(false);
					}, 7300);

					return;
				}

				if (codeInputRef && codeInputRef.current.value !== code) {
					if (countForATimes > 2) {
						setMessage(
							'Bạn đã nhập sai mã quá 3 lần, vui lòng nhận mã mới để tiếp tục'
						);
						setIsShowNotification(true);

						setTimeout(() => {
							setIsShowNotification(false);
						}, 7300);

						return;
					}

					setMessage('Mã xác nhận không đúng');
					setIsShowNotification(true);

					setTimeout(() => {
						setIsShowNotification(false);
					}, 7300);

					return;
				}
			}

			const payment = isOnlinePay ? 'online' : 'offline';

			axios
				.post('http://localhost:3000/booking', {
					userId: user.id,
					scheduleId: scheduleId,
					seats: seat,
					payment: payment,
				})
				.catch((err) => {
					console.log(err);
				});

			setClose(true);
			window.location.reload();
		}
	};

	return (
		<>
			<div className={cx('wrap')}>
				<Ticket
					scheduleId={scheduleId}
					seat={seat}
					onclick={onclick}
				/>
				<div className={cx('pay-option')}>
					<div className={cx('item')}>
						<input
							type='radio'
							name='pay'
							id='offline'
							defaultChecked={true}
							onChange={() => setIsOnlinePay(false)}
						/>
						<label htmlFor='offline'>Thanh toán khi nhận vé</label>
					</div>
					<div className={cx('item')}>
						<input
							type='radio'
							name='pay'
							id='online'
							onChange={() => setIsOnlinePay(true)}
						/>
						<label htmlFor='online'>
							Thanh toán online: giảm 5% tổng tiền vé (sắp có)
						</label>
					</div>
				</div>
				{isOnlinePay && (
					<div className={cx('qr-code-wrap')}>
						<div className={cx('form')}>
							<div className={cx('title')}>
								Quét mã QR để xác nhận thanh toán
							</div>
							<input
								type='text'
								placeholder={
									typeof countdown === 'number'
										? `Nhập mã xác nhận ${countdown}s`
										: `Nhập mã xác nhận ${countdown}`
								}
								ref={codeInputRef}
							/>
							<button
								className={cx('renew-code')}
								onClick={generateCode}
							>
								Nhận mã mới
							</button>
						</div>
						<div className={cx('qr-code')}>
							<QRCode
								size={128}
								style={{
									height: 'auto',
									maxWidth: '100%',
									width: '100%',
								}}
								value={code}
								viewBox={`0 0 128 128`}
							/>
							{(countdown === '(Mã đã hết hạn)' ||
								countForATimes > 3) && (
								<div className={cx('expired')}>Đã hết hạn</div>
							)}
						</div>
					</div>
				)}
				<div className={cx('button')}>
					<button
						className={cx('primary')}
						onClick={closeBill}
					>
						Đóng
					</button>
					<button onClick={submit}>Thanh toán</button>
				</div>
			</div>
			<Overlay />
			{isShowNotification && (
				<Notification
					type='error'
					message={message}
					timeout={7000}
				/>
			)}
		</>
	);
}

export default Bill;
