import { useState, useRef, useEffect } from 'react';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import jwt from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

import styles from './Login.module.scss';
import googleIcon from '/images/Google-icon.png';
import Loader from '../../components/Loader';

const cx = classNames.bind(styles);

const Login = ({ fadeStyle, setForm }) => {
	const [isShowPassword, setIsShowPassword] = useState(false);
	const [google, setGoogle] = useState([]);
	const [profile, setProfile] = useState([]);
	const [user, setUser] = useState({});
	const [message, setMessage] = useState('');
	const [showMessage, setShowMessage] = useState({
		username: false,
		password: false,
	});
	const [isLoading, setIsLoading] = useState(false);

	const usernameRef = useRef(null);
	const passwordRef = useRef(null);
	const loginBtnRef = useRef(null);

	const dispatch = useDispatch();
	const navigate = useNavigate();

	const handleShowPassword = () => {
		passwordRef.current.type === 'password'
			? (passwordRef.current.type = 'text')
			: (passwordRef.current.type = 'password');
		setIsShowPassword((prev) => !prev);
	};

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

	const handleEnter = (e) => {
		if (e.key === 'Enter') {
			loginBtnRef.current.click();
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
							token: res.data.token,
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
		}
	}, [profile]);

	useEffect(() => {
		if (user?.token) {
			document.cookie = `token=${user.token}`;
			dispatch({ type: 'LOGIN', payload: user });
			dispatch({ type: 'ACCOUNT_FORM/HIDE' });

			if (user.role !== 'customer') {
				navigate('/manager');
			}
		} else if (user.token === '') {
			setForm('fill-info');
		}
	}, [user]);

	const handleSubmit = async () => {
		const username = usernameRef.current.value.trim();
		const password = passwordRef.current.value.trim();

		const usernameRegex = /^[a-zA-Z0-9@._-]+$/;
		const passwordRegex = /^[a-zA-Z0-9]{8,16}$/;

		if (username === '') {
			setMessage('Tên đăng nhập không được để trống');
			setShowMessage({ username: true, password: false });
			return;
		}

		if (password === '') {
			setMessage('Mật khẩu không được để trống');
			setShowMessage({ username: false, password: true });
			return;
		}

		if (!usernameRegex.test(username)) {
			setMessage(
				'Tên đăng nhập không được chứa ký tự đặc biệt như " !"#$%&\'()*+,/:;<=>?[]^`{|}~'
			);
			setShowMessage({ username: true, password: false });
			return;
		}

		if (!passwordRegex.test(password)) {
			setMessage(
				'Mật khẩu phải từ 8 - 16 ký tự và không chứa ký tự đặc biệt như " !"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~'
			);
			setShowMessage({ username: false, password: true });
			return;
		}

		if (checkUsernameType(username) === 'unknown') {
			setMessage(
				'Tên đăng nhập phải là địa chỉ email hoặc số điện thoại'
			);
			setShowMessage({ username: true, password: false });
			return;
		}

		setIsLoading(true);

		await axios
			.post('http://localhost:3000/login', {
				username,
				password,
			})
			.then((res) => {
				if (res?.data?.token) {
					const token = jwt(res.data.token);
					document.cookie = `token=${res.data.token}`;

					setUser({
						id: token.id,
						name: token.name,
						role: token.role,
						token: res.data.token,
					});
				}
			})
			.catch((err) => console.log(err));

		setIsLoading(false);
	};

	return (
		<div
			className={cx('item')}
			style={{
				left: fadeStyle.loginLeft,
				transition: fadeStyle.loginTransition,
			}}
		>
			<div className={cx('title')}>CHÀO MỪNG BẠN TRỞ LẠI!</div>
			<div className={cx('subtitle')}>
				Đăng nhập vào tài khoản của bạn để tiếp tục với chúng tôi
			</div>
			<div className={cx('group')}>
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
			<div className={cx('group')}>
				<input
					type='password'
					className={cx('input')}
					ref={passwordRef}
					required
					onKeyDown={(e) => {
						handleEnter(e);
					}}
				/>
				<label>Mật khẩu</label>
				<span className={cx('show-password')}>
					{isShowPassword ? (
						<FontAwesomeIcon
							icon={faEyeSlash}
							onClick={handleShowPassword}
						/>
					) : (
						<FontAwesomeIcon
							icon={faEye}
							onClick={handleShowPassword}
						/>
					)}
				</span>
			</div>
			{showMessage.password && (
				<span className={cx('message')}>{message}</span>
			)}
			<button
				className={cx('recovery')}
				onClick={() => setForm('forgot-password')}
			>
				Quên mật khẩu?
			</button>
			<button
				className={cx('sign-in')}
				onClick={() => handleSubmit()}
				ref={loginBtnRef}
			>
				Đăng nhập
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
				className={cx('exit')}
				onClick={() => dispatch({ type: 'ACCOUNT_FORM/HIDE' })}
			>
				Thoát
			</button>

			{isLoading && <Loader />}
		</div>
	);
};

export default Login;
