import { useEffect, useState, useRef } from 'react';
import classNames from 'classnames/bind';
import { useDispatch, useSelector } from 'react-redux';
import { QRCodeSVG } from 'qrcode.react';
import axios from 'axios';

import styles from './PayOnline.module.scss';
import {
	visaIcon,
	masterCardIcon,
	scanIcon,
	americaExpressIcon,
} from '../../store/icons';
import { formatVNPhoneNumber } from '../../store/actions';
import Overlay from '../Overlay';
import ToastContainerComponent from '../ToastContainerComponent';
import ToastComponent from '../ToastComponent';
import Loader from '../Loader';

const cx = classNames.bind(styles);
const BE_BASE_URL = import.meta.env.VITE_BE_BASE_URL;

function PayOnline({ price, phone = '0907032047', setIsPaid }) {
	const [toastList, setToastList] = useState([]);
	const [isShowToast, setIsShowToast] = useState(false);
	const [payment, setPayment] = useState('card');
	const [paymentLink, setPaymentLink] = useState('');
	const [priceUSD, setPriceUSD] = useState(0);

	const dispatch = useDispatch();
	const user = useSelector((state) => state.users);

	useEffect(() => {
		if (!!price) {
			const apiKey = import.meta.env.VITE_EXCHANGE_RATE_API_KEY;

			axios
				.get('https://api.exchangerate-api.com/v4/latest/VND', {
					params: {
						apiKey,
					},
				})
				.then((res) => {
					if (res?.data) {
						const exchangeRate = res.data.rates.USD;
						const amountUSD = price * exchangeRate;

						setPriceUSD(+amountUSD.toFixed(0));
					}
				})
				.catch((error) => console.error(error));
		}
	}, [price]);

	useEffect(() => {
		if (payment === 'qr') {
			const ws = new WebSocket('ws://localhost:3001');

			ws.onmessage = (event) => {
				const message = JSON.parse(event.data);
				if (message.success) {
					setIsPaid(true);
				}
			};

			axios
				.post(`${BE_BASE_URL}/createOnlinePayment`, {
					phone: formatVNPhoneNumber('0907032047'),
					price_USD: priceUSD,
				})
				.then((res) => {
					if (res?.data) {
						setPaymentLink(res.data.paymentLink);
					}
				})
				.catch((error) => console.log(error));

			return () => {
				ws.close();
			};
		} else {
			setPaymentLink('');
		}
	}, [payment]);

	return (
		<>
			<div className={cx('wrap')}>
				<div className={cx('payment-option')}>
					<div
						className={cx('item', payment === 'card' && 'active')}
						onClick={() => setPayment('card')}
					>
						<div className={cx('left')}>
							<span>{visaIcon}</span>
							<span>{masterCardIcon}</span>
							<span>{americaExpressIcon}</span>
						</div>
						<div className={cx('right')}></div>
					</div>
					<div
						className={cx('item', payment === 'qr' && 'active')}
						onClick={() => setPayment('qr')}
					>
						<div className={cx('left')}>
							<span>{scanIcon}</span>
							<span>QRPay</span>
						</div>
						<div className={cx('right')}></div>
					</div>
				</div>
				{payment === 'card' && (
					<div className={cx('card-form')}>
						<div className={cx('row-1-col')}>
							<label htmlFor='card-number'>
								Enter your card number
							</label>
							<input
								type='text'
								id='card-number'
								placeholder='Ex: 5451 1234 5678 9010'
							/>
						</div>
						<div className={cx('row-3-col')}>
							<input
								type='text'
								id='card-number'
								placeholder='MM/YY'
							/>
							<input
								type='text'
								id='card-number'
								placeholder='CVV'
							/>
							<input
								type='text'
								id='card-number'
								placeholder='ZIP'
							/>
						</div>
					</div>
				)}
				{payment === 'qr' && (
					<div className={cx('qr-code')}>
						<QRCodeSVG value={paymentLink} />
						{!!!paymentLink && (
							<div className={cx('overlay')}></div>
						)}
						{!!!paymentLink && <div className={cx('loader')}></div>}
					</div>
				)}
				<button className={cx('submit')}>Thanh toán</button>
			</div>
			{isShowToast && (
				<ToastContainerComponent
					toastList={toastList}
					setToastList={setToastList}
				/>
			)}
		</>
	);
}

export default PayOnline;
