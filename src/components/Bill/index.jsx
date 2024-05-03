import { useEffect, useState, useRef } from 'react';
import classNames from 'classnames/bind';
import { useDispatch, useSelector } from 'react-redux';
import QRCode from 'react-qr-code';
import axios from 'axios';

import styles from './Bill.module.scss';

import Ticket from '../Ticket';
import Overlay from '../Overlay';
import Notification from '../Notification';
import ToastContainerComponent from '../../components/ToastContainerComponent';
import ToastComponent from '../../components/ToastComponent';

const cx = classNames.bind(styles);
const BE_BASE_URL = import.meta.env.VITE_BE_BASE_URL;

function Bill({ scheduleId, seat, onclick, setClose, defaultPrice }) {
	const [toastList, setToastList] = useState([]);
	const [isOnlinePay, setIsOnlinePay] = useState(false);
	const [code, setCode] = useState('');
	const [countdown, setCountdown] = useState('');
	const [intervalId, setIntervalId] = useState(null);
	const [countForATimes, setCountForATimes] = useState(0);
	const [countForManyTimes, setCountForManyTimes] = useState(0);
	const [isUseShuttleBus, setIsUseShuttleBus] = useState(false);
	const [name, setName] = useState('');
	const [phoneNumber, setPhoneNumber] = useState('');
	const [address, setAddress] = useState('');
	const [price, setPrice] = useState(0);
	const [roundTrip, setRoundTrip] = useState(false);

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
		const totalPrice = defaultPrice * seat.length;

		if (isOnlinePay) {
			setPrice(totalPrice - (defaultPrice * 5) / 100);

			generateCode();
		} else {
			setPrice(totalPrice);
		}
	}, [isOnlinePay]);

	useEffect(() => {
		if (!isOnlinePay) {
			clearInterval(intervalId);
			return;
		}

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
			setToastList([
				...toastList,
				<ToastComponent
					type='error'
					content={
						'Vui lòng đăng nhập tài khoản để tiến hành thanh toán'
					}
				/>,
			]);

			return;
		} else {
			if (isOnlinePay) {
				setCountForATimes((pre) => pre + 1);

				if (countForManyTimes > 2) {
					setToastList([
						...toastList,
						<ToastComponent
							type='error'
							content={
								'Vì chính sách bảo mật, bạn chỉ có thể nhận mã 3 lần'
							}
						/>,
					]);

					return;
				}

				if (codeInputRef && codeInputRef.current.value !== code) {
					if (countForATimes > 2) {
						setToastList([
							...toastList,
							<ToastComponent
								type='warning'
								content={
									'Bạn đã nhập sai mã quá 3 lần, vui lòng nhận mã mới để tiếp tục'
								}
							/>,
						]);

						return;
					}

					setToastList([
						...toastList,
						<ToastComponent
							type='error'
							content={'Mã xác nhận không đúng'}
						/>,
					]);

					return;
				}
			}

			const payment = isOnlinePay ? 'online' : 'offline';

			if (isUseShuttleBus) {
				axios
					.post(`${BE_BASE_URL}/booking-with-shuttle-bus`, {
						userId: user.id,
						scheduleId: scheduleId,
						seats: seat,
						payment: payment,
						price,
						isPaid: payment === 'online' ? 1 : 0,
						discount: 0,
						roundTrip: roundTrip ? 1 : 0,
						shuttleBusName: name,
						shuttleBusPhone: phoneNumber,
						shuttleBusAddress: address,
					})
					.catch((err) => {
						console.log(err);
					});
			} else {
				axios
					.post(`${BE_BASE_URL}/booking`, {
						userId: user.id,
						scheduleId: scheduleId,
						seats: seat,
						payment: payment,
						price,
						isPaid: payment === 'online' ? 1 : 0,
						discount: 0,
						roundTrip: roundTrip ? 1 : 0,
					})
					.catch((err) => {
						console.log(err);
					});
			}

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
					price={price}
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
				<section>
					<div className={cx('option')}>
						<input
							type='checkbox'
							name='shuttle-bus'
							id='shuttle-bus'
							onChange={() => setIsUseShuttleBus((prev) => !prev)}
						/>
						<label htmlFor='shuttle-bus'>
							Đăng ký xe trung chuyển
						</label>
					</div>
					<div className={cx('form')}>
						<div className={cx('block')}>
							<label htmlFor='name'>Tên</label>
							<input
								type='text'
								id='name'
								placeholder=''
								onInput={(e) => setName(e.target.value)}
							/>
						</div>
						<div className={cx('block')}>
							<label htmlFor='phone-number'>Số điện thoại</label>
							<input
								type='text'
								id='phone-number'
								placeholder=''
								onInput={(e) => setPhoneNumber(e.target.value)}
							/>
						</div>
						<div className={cx('block')}>
							<label htmlFor='address'>Địa chỉ</label>
							<input
								type='text'
								id='address'
								placeholder=''
								onInput={(e) => setAddress(e.target.value)}
							/>
						</div>
					</div>
				</section>
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
			<ToastContainerComponent
				toastList={toastList}
				setToastList={setToastList}
			/>
		</>
	);
}

export default Bill;
