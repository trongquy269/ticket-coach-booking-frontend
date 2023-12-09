import { useState, useRef, useEffect } from 'react';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import jwt from 'jwt-decode';

import styles from './Register.module.scss';
import googleIcon from '/images/Google-icon.png';
import Loader from '../../components/Loader';

const cx = classNames.bind(styles);

const Register = ({ fadeStyle, setForm }) => {
	const [isShowPassword, setIsShowPassword] = useState(false);
	const [isShowRePassword, setIsShowRePassword] = useState(false);
	const [google, setGoogle] = useState([]);
	const [profile, setProfile] = useState([]);
	const [user, setUser] = useState({});
	const [message, setMessage] = useState('');
	const [showMessage, setShowMessage] = useState({
		username: false,
		password: false,
		rePassword: false,
	});
	const [isLoading, setIsLoading] = useState(false);

	const usernameRef = useRef(null);
	const passwordRef = useRef(null);
	const rePasswordRef = useRef(null);
	const dispatch = useDispatch();

	const handleShowPassword = () => {
		passwordRef.current.type === 'password'
			? (passwordRef.current.type = 'text')
			: (passwordRef.current.type = 'password');
		setIsShowPassword((prev) => !prev);
	};

	const handleShowRePassword = () => {
		rePasswordRef.current.type === 'password'
			? (rePasswordRef.current.type = 'text')
			: (rePasswordRef.current.type = 'password');
		setIsShowRePassword((prev) => !prev);
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

	const handleSubmit = async () => {
		const username = usernameRef.current.value.trim();
		const password = passwordRef.current.value.trim();
		const rePassword = rePasswordRef.current.value.trim();

		const usernameRegex = /^[a-zA-Z0-9@._-]+$/;
		const passwordRegex = /^[a-zA-Z0-9]{8,16}$/;

		const show = { username: false, password: false, rePassword: false };

		if (username === '') {
			setMessage('Tên đăng nhập không được để trống');
			setShowMessage({ ...show, username: true });
			return;
		}

		if (password === '') {
			setMessage('Mật khẩu không được để trống');
			setShowMessage({ ...show, password: true });
			return;
		}

		if (!usernameRegex.test(username)) {
			setMessage(
				'Tên đăng nhập không được chứa ký tự đặc biệt như " !"#$%&\'()*+,/:;<=>?[]^`{|}~'
			);
			setShowMessage({ ...show, username: true });
			return;
		}

		if (!passwordRegex.test(password)) {
			setMessage(
				'Mật khẩu phải từ 8 - 16 ký tự và không chứa ký tự đặc biệt như " !"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~'
			);
			setShowMessage({ ...show, password: true });
			return;
		}

		if (password !== rePassword) {
			setMessage('Mật khẩu không trùng khớp');
			setShowMessage({ ...show, rePassword: true });
			return;
		}

		if (checkUsernameType(username) === 'unknown') {
			setMessage(
				'Tên đăng nhập phải là địa chỉ email hoặc số điện thoại'
			);
			setShowMessage({ ...show, username: true });
			return;
		}

		setIsLoading(true);

		await axios
			.post('http://localhost:3000/register', {
				username,
				password,
			})
			.then((res) => {
				if (res?.data?.message?.email) {
					setMessage(res.data.message.email);
					setShowMessage({ ...show, username: true });
				} else if (res?.data?.message?.phone) {
					setMessage(res.data.message.phone);
					setShowMessage({ ...show, username: true });
				} else if (res?.data?.message === 'Registered') {
					setForm('fill-info');
				}
			})
			.catch((err) => console.log(err));

		setIsLoading(false);
	};

	return (
		<div
			className={cx('item')}
			style={{
				left: fadeStyle.registerLeft,
				transition: fadeStyle.registerTransition,
			}}
		>
			<div className={cx('title')}>ĐĂNG KÝ MIỄN PHÍ!</div>
			<div className={cx('subtitle')}>
				Hãy tạo một tài khoản để bắt đầu hành trình của bạn với chúng
				tôi
			</div>
			<div className={cx('group')}>
				<input
					type='text'
					className={cx('input')}
					ref={usernameRef}
					required
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
			<div className={cx('group')}>
				<input
					type='password'
					className={cx('input')}
					ref={rePasswordRef}
					required
				/>
				<label>Nhập lại mật khẩu</label>
				<span className={cx('show-password')}>
					{isShowRePassword ? (
						<FontAwesomeIcon
							icon={faEyeSlash}
							onClick={handleShowRePassword}
						/>
					) : (
						<FontAwesomeIcon
							icon={faEye}
							onClick={handleShowRePassword}
						/>
					)}
				</span>
			</div>
			{showMessage.rePassword && (
				<span className={cx('message')}>{message}</span>
			)}
			<div className={cx('policy')}>
				Đăng ký tài khoản đồng nghĩa với việc bạn đã đồng ý với
				<span> chính sách</span> và <span>qui định</span> của chúng tôi
			</div>
			<button
				className={cx('sign-in')}
				onClick={handleSubmit}
			>
				Đăng ký
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
			<div className={cx('login')}>
				<span>Nếu bạn đã có tài khoản?</span>
				<button onClick={() => setForm('login')}>
					Đăng nhập tại đây
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

export default Register;
