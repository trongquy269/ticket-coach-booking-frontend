import { useState, useRef, useEffect } from 'react';
import classNames from 'classnames/bind';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import jwt from 'jwt-decode';

import styles from './FillInfoForm.module.scss';
import Loader from '../../components/Loader';

const cx = classNames.bind(styles);

const FillInfoForm = ({ fadeStyle, setForm }) => {
	const [message, setMessage] = useState('');
	const [showMessage, setShowMessage] = useState({
		name: false,
		birth: false,
		gender: false,
		email: false,
		phone: false,
		id: false,
		city: false,
		district: false,
	});
	const [cities, setCities] = useState([]);
	const [districts, setDistricts] = useState([]);
	const [isLoad, setIsLoad] = useState(false);

	const [name, setName] = useState('');
	const [birth, setBirth] = useState('');
	const [gender, setGender] = useState('');
	const [email, setEmail] = useState('');
	const [phone, setPhone] = useState('');
	const [id, setId] = useState('');
	const [city, setCity] = useState('');
	const [district, setDistrict] = useState('');

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

	const parseValidDate = (date) => {
		const datePattern = /^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/;
		const match = date.replace(/ /g, '').match(datePattern);

		if (!match) {
			return null;
		}

		const day = parseInt(match[1], 10);
		const month = parseInt(match[2], 10);
		const year = parseInt(match[3], 10);

		const dateFormatted = new Date(Date.UTC(year, month - 1, day));

		if (
			dateFormatted.getFullYear() !== year ||
			dateFormatted.getMonth() + 1 !== month ||
			dateFormatted.getDate() !== day
		) {
			return null;
		} else {
			return dateFormatted;
		}
	};

	const handleBack = () => {
		setForm('login');
	};

	const handleSubmit = async () => {
		const show = {
			name: false,
			birth: false,
			gender: false,
			email: false,
			phone: false,
			id: false,
			city: false,
			district: false,
		};

		if (name === '') {
			setMessage('Vui lòng nhập họ và tên');
			setShowMessage({ ...show, name: true });
			return;
		}
		if (birth === '') {
			setMessage('Vui lòng nhập ngày sinh');
			setShowMessage({ ...show, birth: true });
			return;
		}
		if (gender === '') {
			setMessage('Vui lòng chọn giới tính');
			setShowMessage({ ...show, gender: true });
			return;
		}
		if (email === '') {
			setMessage('Vui lòng nhập email');
			setShowMessage({ ...show, email: true });
			return;
		}
		if (phone === '') {
			setMessage('Vui lòng nhập số điện thoại');
			setShowMessage({ ...show, phone: true });
			return;
		}
		if (id === '') {
			setMessage('Vui lòng nhập CMND / CCCD');
			setShowMessage({ ...show, id: true });
			return;
		}
		if (city === '') {
			setMessage('Vui lòng chọn tỉnh / thành phố');
			setShowMessage({ ...show, city: true });
			return;
		}
		if (district === '') {
			setMessage('Vui lòng chọn quận / huyện');
			setShowMessage({ ...show, district: true });
			return;
		}
		if (checkUsernameType(email) === 'unknown') {
			setMessage('Email không hợp lệ');
			setShowMessage({ ...show, email: true });
			return;
		}
		if (checkUsernameType(phone) === 'unknown') {
			setMessage('Số điện thoại không hợp lệ');
			setShowMessage({ ...show, phone: true });
			return;
		}

		const validDate = parseValidDate(birth);

		if (!validDate) {
			setMessage('Ngày sinh không hợp lệ');
			setShowMessage({ ...show, birth: true });
			return;
		}

		setIsLoad(true);

		await axios
			.post('http://localhost:3000/complete-register', {
				name,
				dateOfBirth: validDate,
				gender,
				email,
				phone,
				citizenIdentification: id,
				city,
				district,
			})
			.then((res) => {
				if (res?.data?.message?.email) {
					setMessage(res.data.message.email);
					setShowMessage({ ...show, email: true });
				} else if (res?.data?.message?.phone) {
					setMessage(res.data.message.phone);
					setShowMessage({ ...show, phone: true });
				} else if (res?.data?.token !== '') {
					const token = jwt(res.data.token);
					document.cookie = `token=${res.data.token}`;

					const user = {
						id: token.id,
						name: token.name,
						role: token.role,
						token: res.data.token,
					};

					dispatch({ type: 'LOGIN', payload: user });
					dispatch({ type: 'ACCOUNT_FORM/HIDE' });
				}
			})
			.catch((err) => {
				console.log(err);
			});

		setIsLoad(false);
	};

	useEffect(() => {
		axios
			.get('http://localhost:3000/city')
			.then((res) => {
				if (res?.data) {
					setCities(res.data);
				}
			})
			.catch((err) => {
				console.log(err);
			});
	}, []);

	useEffect(() => {
		if (city !== '') {
			axios
				.get('http://localhost:3000/district', {
					params: {
						city,
					},
				})
				.then((res) => {
					if (res?.data) {
						setDistricts(res.data);
					}
				})
				.catch((err) => {
					console.log(err);
				});
		}
	}, [city]);

	return (
		<div
			className={cx('item')}
			style={{
				left: fadeStyle.fillInfoLeft,
				transition: fadeStyle.fillInfoTransition,
			}}
		>
			<div className={cx('title')}>ĐIỀN THÔNG TIN CỦA BẠN</div>
			<div className={cx('subtitle')}>
				Hãy cho chúng tôi biết một vài điều về bạn
			</div>
			<div className={cx('group')}>
				<input
					type='text'
					className={cx('input')}
					onInput={(e) => setName(e.target.value)}
					required
				/>
				<label>Họ và Tên</label>
			</div>
			{showMessage.name && (
				<span className={cx('message')}>{message}</span>
			)}
			<div className={cx('birth-gender')}>
				<div className={cx('birth')}>
					<span>Ngày sinh:</span>
					<div className={cx('group')}>
						<input
							type='text'
							className={cx('input')}
							required
							onInput={(e) => setBirth(e.target.value)}
						/>
						<label>Ngày / Tháng / Năm</label>
					</div>
				</div>

				<select
					className={cx('gender')}
					onChange={(e) => setGender(e.target.value)}
				>
					<option value=''>Giới tính</option>
					<option value='Nam'>Nam</option>
					<option value='Nữ'>Nữ</option>
					<option value='Khác'>Khác</option>
				</select>
			</div>
			{showMessage.birth && (
				<span className={cx('message')}>{message}</span>
			)}
			{showMessage.gender && (
				<span className={cx('message')}>{message}</span>
			)}
			<div className={cx('group')}>
				<input
					type='text'
					className={cx('input')}
					required
					onInput={(e) => setEmail(e.target.value)}
				/>
				<label>Email</label>
			</div>
			{showMessage.email && (
				<span className={cx('message')}>{message}</span>
			)}
			<div className={cx('phone-id')}>
				<div className={cx('group')}>
					<input
						type='text'
						className={cx('input')}
						required
						onInput={(e) => setPhone(e.target.value)}
					/>
					<label>Số điện thoại</label>
				</div>
				<div className={cx('group')}>
					<input
						type='text'
						className={cx('input')}
						required
						onInput={(e) => setId(e.target.value)}
					/>
					<label>CMND / CCCD</label>
				</div>
			</div>
			{showMessage.phone && (
				<span className={cx('message')}>{message}</span>
			)}
			{showMessage.id && <span className={cx('message')}>{message}</span>}
			<div className={cx('place')}>
				<select
					className={cx('cities')}
					onChange={(e) => setCity(e.target.value)}
				>
					<option value=''>Tỉnh / Thành phố</option>
					{cities.length > 0 &&
						cities.map((city) => {
							return (
								<option
									key={city.id}
									value={city.name}
								>
									{city.name}
								</option>
							);
						})}
				</select>
				<select
					className={cx('districts')}
					onChange={(e) => setDistrict(e.target.value)}
				>
					<option value=''>Quận / Huyện</option>
					{districts.length > 0 &&
						districts.map((district) => {
							return (
								<option
									key={district.id}
									value={district.id}
								>
									{district.name}
								</option>
							);
						})}
				</select>
			</div>
			{showMessage.city && (
				<span className={cx('message')}>{message}</span>
			)}
			{showMessage.district && (
				<span className={cx('message')}>{message}</span>
			)}
			<button
				className={cx('update')}
				onClick={handleSubmit}
			>
				Cập nhật
			</button>
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

export default FillInfoForm;
