import { useState, useRef, useEffect } from 'react';
import classNames from 'classnames/bind';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import jwt from 'jwt-decode';

import styles from './ForgotPassword.module.scss';
import googleIcon from '/images/Google-icon.png';
import VerifyCode from '../../components/VerifyCode';
import Loader from '../../components/Loader';

const cx = classNames.bind(styles);

const ForgotPassword = ({ fadeStyle, setForm }) => {
	const [isLoad, setIsLoad] = useState(false);
	const [google, setGoogle] = useState([]);
	const [profile, setProfile] = useState([]);
	const [user, setUser] = useState({});
	const [message, setMessage] = useState('');
	const [showMessage, setShowMessage] = useState({
		username: false,
		verify: false,
		password: false,
		rePassword: false,
	});
	const [hideStep, setHideStep] = useState(0);
	const [verifyCode, setVerifyCode] = useState('');
	const [verifyCodeTime, setVerifyCodeTime] = useState(59);

	const usernameRef = useRef(null);
	const continueBtnRef = useRef(null);
	const verifyBtnRef = useRef(null);
	const passwordRef = useRef(null);
	const rePasswordRef = useRef(null);
	const resetBtnRef = useRef(null);
	const dispatch = useDispatch();

	const checkUsernameType = (username) => {
		// Regular expression for matching an email address
		const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

		// Regular expression for matching a phone number (simple example)
		const phoneRegex = /^\d{10}$/;

		if (emailRegex.test(username)) {
			return 'email';
		} else if (phoneRegex.test(username)) {
			return 'phone';
		} else {
			return 'unknown';
		}
	};

	const login = useGoogleLogin({
		onSuccess: (res) => {
			setGoogle(res);
		},
		onError: (err) => {
			console.error('Login Failed:', err);
		},
	});

	useEffect(() => {
		if (google && google.access_token) {
			axios
				.get(
					`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${google.access_token}`,
					{
						headers: {
							Authorization: `Bearer ${google.access_token}`,
							Accept: 'application/json',
						},
					}
				)
				.then((res) => {
					setProfile(res?.data);
				})
				.catch((err) => {
					console.error(err);
				});
		}
	}, [google]);

	useEffect(() => {
		if (profile.length !== 0) {
			const name = profile.name;
			const email = profile?.email || '';

			if (email === '') return;

			axios
				.get('http://localhost:3000/user', { params: { email } })
				.then((res) => {
					if (res?.data?.token) {
						const token = jwt(res.data.token);
						document.cookie = `token=${res.data.token}`;

						setUser({
							id: token.id,
							name: token.name,
							role: token.role,
							token,
						});
					}
				})
				.catch((err) => {
					console.log(err);
				});

			setUser({
				id: 0,
				name,
				email,
				role: 'customer',
				token: '',
			});

			dispatch({ type: 'LOGIN', payload: profile.data });
		}
	}, [profile]);

	const handleSubmitStep1 = async () => {
		const username = usernameRef.current.value.trim();

		const usernameRegex = /^[a-zA-Z0-9@._-]+$/;

		if (username === '') {
			setMessage('Tên đăng nhập không được để trống');
			setShowMessage({
				username: true,
				verify: false,
				password: false,
				rePassword: false,
			});
			return;
		}

		if (!usernameRegex.test(username)) {
			setMessage(
				'Tên đăng nhập không được chứa ký tự đặc biệt như " !"#$%&\'()*+,/:;<=>?[]^`{|}~'
			);
			setShowMessage({
				username: true,
				verify: false,
				password: false,
				rePassword: false,
			});
			return;
		}

		if (checkUsernameType(username) === 'unknown') {
			setMessage(
				'Tên đăng nhập phải là địa chỉ email hoặc số điện thoại'
			);
			setShowMessage({
				username: true,
				verify: false,
				password: false,
				rePassword: false,
			});
			return;
		}

		setIsLoad(true);

		await axios
			.get('http://localhost:3000/verify', {
				params: {
					username,
				},
			})
			.then((res) => {
				if (res?.data?.message === 'Email sent') {
					setHideStep(1);

					const interval = setInterval(() => {
						setVerifyCodeTime((prev) => {
							if (prev === 0) {
								clearInterval(interval);
								return 0;
							}

							return prev - 1;
						});
					}, 1000);
				} else if (res?.data?.message !== 'Email sent') {
					setMessage(res?.data?.message);
					setShowMessage({
						username: true,
						verify: false,
						password: false,
						rePassword: false,
					});
				}
			})
			.catch((err) => console.log(err));

		setIsLoad(false);
	};

	const handleSubmitStep2 = async () => {
		if (verifyCode.length !== 6) {
			setMessage('Mã xác thực phải có 6 ký tự');
			setShowMessage({
				username: false,
				verify: true,
				password: false,
				rePassword: false,
			});
			return;
		}

		setIsLoad(true);

		await axios
			.post('http://localhost:3000/verify', {
				verifyCode,
			})
			.then((res) => {
				if (res?.data?.message === 'Verified') {
					setHideStep(2);
				} else {
					setMessage(res?.data?.message);
					setShowMessage({
						username: false,
						verify: true,
						password: false,
						rePassword: false,
					});
				}
			})
			.catch((err) => console.log(err));

		setIsLoad(false);
	};

	const handleSubmitStep3 = async () => {
		const username = usernameRef.current.value.trim();
		const password = passwordRef.current.value.trim();
		const rePassword = rePasswordRef.current.value.trim();

		const passwordRegex = /^[a-zA-Z0-9]{8,16}$/;

		if (password === '') {
			setMessage('Mật khẩu không được để trống');
			setShowMessage({
				username: false,
				verify: false,
				password: true,
				rePassword: false,
			});
			return;
		}

		if (!passwordRegex.test(password)) {
			setMessage(
				'Mật khẩu phải từ 8 - 16 ký tự và không chứa ký tự đặc biệt như " !"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~'
			);
			setShowMessage({
				username: false,
				verify: false,
				password: true,
				rePassword: false,
			});
			return;
		}

		if (password !== rePassword) {
			setMessage('Mật khẩu không trùng khớp');
			setShowMessage({
				username: false,
				verify: false,
				password: false,
				rePassword: true,
			});
			return;
		}

		setIsLoad(true);

		await axios
			.post('http://localhost:3000/reset', {
				username,
				password,
			})
			.then((res) => {
				if (res?.data?.message === 'Password changed') {
					dispatch({ type: 'ACCOUNT_FORM/HIDE' });
				}
			})
			.catch((err) => console.log(err));

		setIsLoad(false);
	};

	const handleEnter = (e) => {
		if (e.key === 'Enter') {
			if (continueBtnRef.current.style.maxHeight !== '0px') {
				continueBtnRef.current.click();
			} else if (verifyBtnRef.current.style.maxHeight !== '0px') {
				verifyBtnRef.current.click();
			}
		}
	};

	const handleBack = () => {
		setForm('login');
		setHideStep(0);
		usernameRef.current.value = '';
	};

	const handleShowPassword = () => {
		const password = passwordRef.current;
		const rePassword = rePasswordRef.current;

		if (password.type === 'password') {
			password.type = 'text';
			rePassword.type = 'text';
		} else {
			password.type = 'password';
			rePassword.type = 'password';
		}
	};

	return (
		<div
			className={cx('item')}
			style={{
				left: fadeStyle.forgotPasswordLeft,
				transition: fadeStyle.forgotPasswordTransition,
			}}
		>
			<div
				className={cx('title')}
				style={{
					maxHeight: hideStep === 0 ? '60px' : '0',
					marginBottom: hideStep === 0 ? '20px' : '0',
				}}
			>
				QUÊN MẬT KHẨU?
			</div>
			<div
				className={cx('title')}
				style={{
					maxHeight: hideStep === 1 ? '60px' : '0',
					marginBottom: hideStep === 1 ? '20px' : '0',
				}}
			>
				NHẬP MÃ XÁC THỰC
			</div>
			<div
				className={cx('title')}
				style={{
					maxHeight: hideStep === 2 ? '60px' : '0',
					marginBottom: hideStep === 2 ? '20px' : '0',
				}}
			>
				ĐẶT LẠI MẬT KHẨU
			</div>
			<div
				className={cx('subtitle')}
				style={{
					maxHeight: hideStep === 0 ? '60px' : '0',
					marginBottom: hideStep === 0 ? '40px' : '0',
				}}
			>
				Vui lòng hãy cho chúng tôi biết Tên đăng nhập / Email / Số điện
				thoại của bạn
			</div>
			<div
				className={cx('subtitle')}
				style={{
					maxHeight: hideStep === 1 ? '60px' : '0',
					marginBottom: hideStep === 1 ? '40px' : '0',
				}}
			>
				Vui lòng hãy nhập mã xác thực đã được gửi đến Email của bạn
			</div>
			<div
				className={cx('subtitle')}
				style={{
					maxHeight: hideStep === 2 ? '60px' : '0',
					marginBottom: hideStep === 2 ? '40px' : '0',
				}}
			>
				Vui lòng hãy nhập mật khẩu mới của bạn
			</div>
			<div
				className={cx('group')}
				style={{
					maxHeight: hideStep === 0 ? '60px' : '0',
					marginTop: hideStep === 0 ? '12px' : '0',
					overflow: hideStep === 0 ? 'visible' : 'hidden',
				}}
			>
				<input
					type='text'
					className={cx('input')}
					ref={usernameRef}
					required
					onKeyDown={(e) => {
						handleEnter(e);
					}}
				/>
				<label>Email / Số điện thoại</label>
			</div>
			{showMessage.username && (
				<span className={cx('message')}>{message}</span>
			)}
			<div
				className={cx('verify')}
				style={{
					maxHeight: hideStep === 1 ? '60px' : '0',
				}}
			>
				<VerifyCode
					length={6}
					setVerifyCode={setVerifyCode}
					handleEnter={handleEnter}
				/>
			</div>
			{showMessage.verify && (
				<span className={cx('message')}>{message}</span>
			)}
			<div
				className={cx('subtitle')}
				style={{
					maxHeight: hideStep === 1 ? '60px' : '0',
					marginTop: hideStep === 1 ? '40px' : '0',
					marginBottom: 0,
				}}
			>
				Mã xác thực chỉ có hiệu lực trong 60 giây. Thời gian còn lại của
				bạn là: {verifyCodeTime} giây
			</div>
			<div
				className={cx('group')}
				style={{
					maxHeight: hideStep === 2 ? '60px' : '0',
					marginTop: hideStep === 2 ? '12px' : '0',
					overflow: hideStep === 2 ? 'visible' : 'hidden',
				}}
			>
				<input
					type='password'
					className={cx('input')}
					ref={passwordRef}
					required
					onKeyDown={(e) => {
						handleEnter(e);
					}}
				/>
				<label>Nhập mật khẩu mới</label>
			</div>
			{showMessage.password && (
				<span className={cx('message')}>{message}</span>
			)}
			<div
				className={cx('group')}
				style={{
					maxHeight: hideStep === 2 ? '60px' : '0',
					marginTop: hideStep === 2 ? '12px' : '0',
					overflow: hideStep === 2 ? 'visible' : 'hidden',
				}}
			>
				<input
					type='password'
					className={cx('input')}
					ref={rePasswordRef}
					required
					onKeyDown={(e) => {
						handleEnter(e);
					}}
				/>
				<label>Nhập lại mật khẩu mới</label>
			</div>
			{showMessage.rePassword && (
				<span className={cx('message')}>{message}</span>
			)}
			<div
				className={cx('show-password')}
				style={{
					maxHeight: hideStep === 2 ? '60px' : '0',
					marginTop: hideStep === 2 ? '16px' : '0',
					overflow: hideStep === 2 ? 'visible' : 'hidden',
				}}
			>
				<label htmlFor='reset__show-password'>Hiện mật khẩu</label>
				<input
					type='checkbox'
					id='reset__show-password'
					onClick={handleShowPassword}
				/>
			</div>
			<button
				className={cx('continue')}
				onClick={() => handleSubmitStep1()}
				ref={continueBtnRef}
				style={{
					maxHeight: hideStep === 0 ? '60px' : '0',
					marginTop: hideStep === 0 ? '30px' : '0',
					marginBottom: hideStep === 0 ? '40px' : '0',
					pointerEvents: hideStep === 0 ? 'all' : 'none',
				}}
			>
				Tiếp tục
			</button>
			<button
				className={cx('continue')}
				onClick={() => handleSubmitStep2()}
				ref={verifyBtnRef}
				style={{
					maxHeight: hideStep === 1 ? '60px' : '0',
					marginTop: hideStep === 1 ? '30px' : '0',
					marginBottom: hideStep === 1 ? '40px' : '0',
					pointerEvents: hideStep === 1 ? 'all' : 'none',
				}}
			>
				Xác thực
			</button>
			<button
				className={cx('continue')}
				onClick={() => handleSubmitStep3()}
				ref={resetBtnRef}
				style={{
					maxHeight: hideStep === 2 ? '60px' : '0',
					marginTop: hideStep === 2 ? '30px' : '0',
					marginBottom: hideStep === 2 ? '40px' : '0',
					pointerEvents: hideStep === 2 ? 'all' : 'none',
				}}
			>
				Đặt lại mật khẩu
			</button>
			<div className={cx('or')}>
				<span>Hoặc đăng nhập với</span>
			</div>
			<div
				className={cx('google')}
				onClick={() => login()}
			>
				<img
					src={googleIcon}
					alt='Google'
				/>
				<span>Đăng nhập với Google</span>
			</div>
			<div className={cx('register')}>
				<span>Nếu bạn chưa có tài khoản?</span>
				<button onClick={() => setForm('register')}>
					Đăng ký tại đây
				</button>
			</div>
			<button
				className={cx('back')}
				onClick={() => handleBack()}
			>
				Quay lại trang đăng nhập
			</button>
			<button
				className={cx('exit')}
				onClick={() => dispatch({ type: 'ACCOUNT_FORM/HIDE' })}
			>
				Thoát
			</button>

			{isLoad && <Loader />}
		</div>
	);
};

export default ForgotPassword;
