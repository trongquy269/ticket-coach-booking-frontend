import { useState, useEffect, useRef } from 'react';
import classNames from 'classnames/bind';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';

import styles from './Profile.module.scss';
import ToastContainerComponent from '../../components/ToastContainerComponent';
import ToastComponent from '../../components/ToastComponent';
import Header from '../../components/Header';
import {
	seo,
	convertYYYYMMDDToDDMMYYYY,
	sortScheduleNewDate,
} from '../../store/actions';
import { editIcon, closeIcon } from '../../store/icons';
import Ticket from '../../components/Ticket';
import Overlay from '../../components/Overlay';
import Loader from '../../components/Loader';
import VerifyCode from '../../components/VerifyCode';

const cx = classNames.bind(styles);
const BE_BASE_URL = import.meta.env.VITE_BE_BASE_URL;

const Profile = () => {
	const [toastList, setToastList] = useState([]);
	const [user, setUser] = useState({});
	const [mySchedule, setMySchedule] = useState([]);
	const [sliceLimit, setSliceLimit] = useState(3);
	const [key, setKey] = useState('');
	const [cities, setCities] = useState([]);
	const [districts, setDistricts] = useState([]);
	const [selectedCity, setSelectedCity] = useState('');
	const [selectedDistrict, setSelectedDistrict] = useState('');
	const [isShowPassword, setIsShowPassword] = useState(false);
	const [notice, setNotice] = useState('');
	const [isShowResetPasswordForm, setIsShowResetPasswordForm] =
		useState(false);
	const [isShowLoader, setIsShowLoader] = useState(false);
	const [verifyCodeTime, setVerifyCodeTime] = useState(59);
	const [verifyCode, setVerifyCode] = useState('');
	const [isResetTime, setIsResetTime] = useState(false);
	const [isShowForm, setIsShowForm] = useState(false);

	const userId = useSelector((state) => state.users.id);

	const formRef = useRef(null);
	const valueRef = useRef(null);
	const repeatPasswordRef = useRef(null);
	const submitRef = useRef(null);

	useEffect(() => {
		seo({
			title: 'Hồ sơ | Coach Booking',
			metaDescription: 'User information - Online Coach Ticket Booking',
		});

		axios
			.get(`${BE_BASE_URL}/profile`, {
				params: {
					userId: userId,
				},
			})
			.then((res) => {
				if (res?.data) {
					setUser(res.data);
				}
			})
			.catch((error) => console.error(error));

		axios
			.get(`${BE_BASE_URL}/my-schedule`, {
				params: {
					userId: userId,
				},
			})
			.then((res) => {
				if (res?.data) {
					setMySchedule(sortScheduleNewDate(res.data));
				}
			})
			.catch((error) => console.error(error));
	}, []);

	const generateVerifyCode = () => {
		axios
			.get(`${BE_BASE_URL}/verify`, {
				params: {
					userId,
				},
			})
			.then((res) => {
				if (res?.data?.message === 'Email sent') {
					setToastList([
						...toastList,
						<ToastComponent
							type='success'
							content={`Mã xác thực đã được gửi đến Email của bạn`}
						/>,
					]);
				}
			})
			.catch((err) => {
				console.log(err);
			});
	};

	useEffect(() => {
		if (valueRef.current) {
			valueRef.current.focus();
		}

		if (key !== '') {
			if (key === 'address') {
				axios
					.get(`${BE_BASE_URL}/city`)
					.then((res) => {
						if (res?.data) {
							setCities(res.data);
						}
					})
					.catch((err) => {
						console.log(err);
					});
			} else if (key === 'forgot-password') {
				setIsShowForm(true);
				generateVerifyCode();

				const interval = setInterval(() => {
					setVerifyCodeTime((prev) => {
						if (prev === 0) {
							clearInterval(interval);

							if (isShowForm) {
								setNotice('Mã xác thực đã hết hạn');
							}

							return 0;
						}

						return prev - 1;
					});
				}, 1000);

				return () => clearInterval(interval);
			}

			const handleClickOutside = (e) => {
				if (formRef.current && !formRef.current.contains(e.target)) {
					setKey('');
				}
			};

			document.addEventListener('mousedown', handleClickOutside);

			return () => {
				document.removeEventListener('mousedown', handleClickOutside);
			};
		} else {
			setIsShowPassword(false);
			setNotice('');
			setIsShowResetPasswordForm(false);
			setVerifyCodeTime(0);
			setIsShowForm(false);
		}
	}, [key]);

	useEffect(() => {
		if (user.city) {
			axios
				.get(`${BE_BASE_URL}/district`, {
					params: {
						city: selectedCity !== '' ? selectedCity : user.city,
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
	}, [selectedCity, user.city]);

	const clearData = () => {
		if (valueRef.current) {
			valueRef.current.value = '';
			valueRef.current.focus();
		}

		setSelectedCity('');
		setSelectedDistrict('');
		setNotice('');
	};

	const updateData = async () => {
		if (key !== 'address') {
			await axios
				.put(`${BE_BASE_URL}/profile`, {
					userId: userId,
					key: key,
					value: valueRef.current.value,
				})
				.then((res) => {
					if (res?.data?.message === 'success') {
						if (key === 'phone' || key === 'email') {
							const isOldValueContainAtSign =
								user.username.includes('@');
							const isNewValueContainAtSign =
								valueRef.current.value.includes('@');

							if (
								isOldValueContainAtSign ===
								isNewValueContainAtSign
							) {
								setUser((prev) => ({
									...prev,
									[key]: valueRef.current.value,
									username: valueRef.current.value,
								}));
							} else {
								setUser((prev) => ({
									...prev,
									[key]: valueRef.current.value,
								}));
							}
						} else {
							setUser((prev) => ({
								...prev,
								[key]: valueRef.current.value,
							}));
						}

						setToastList([
							...toastList,
							<ToastComponent
								type='success'
								content={`Thông tin đã được cập nhật thành công`}
							/>,
						]);
					} else {
						setToastList([
							...toastList,
							<ToastComponent
								type='danger'
								content={`Thông tin cập nhật không thành công`}
							/>,
						]);
					}
				})
				.catch((err) => {
					console.log(err);
				});
		} else {
			await axios
				.put(`${BE_BASE_URL}/profile`, {
					userId: userId,
					key: key,
					city: selectedCity,
					districtId: selectedDistrict,
				})
				.then((res) => {
					if (res?.data?.message === 'success') {
						setToastList([
							...toastList,
							<ToastComponent
								type='success'
								content={`Thông tin đã được cập nhật thành công`}
							/>,
						]);
					} else {
						setToastList([
							...toastList,
							<ToastComponent
								type='danger'
								content={`Thông tin cập nhật không thành công`}
							/>,
						]);
					}
				})
				.catch((err) => {
					console.log(err);
				});
		}

		setKey('');
	};

	const handleClickShowPassword = () => {
		setIsShowPassword((prev) => !prev);
		valueRef.current.type = isShowPassword ? 'password' : 'text';
		valueRef.current.focus();
	};

	useEffect(() => {
		if (isShowResetPasswordForm) {
			valueRef.current.focus();
		}
	}, [isShowResetPasswordForm]);

	useEffect(() => {
		if (key === 'forgot-password') {
			generateVerifyCode();

			const interval = setInterval(() => {
				setVerifyCodeTime((prev) => {
					if (prev === 0) {
						clearInterval(interval);

						if (isShowForm) {
							setNotice('Mã xác thực đã hết hạn');
						}

						return 0;
					}

					return prev - 1;
				});
			}, 1000);

			return () => clearInterval(interval);
		}
	}, [isResetTime]);

	useEffect(() => {
		if (isShowForm) {
			setVerifyCodeTime(59);
		}
	}, [isShowForm]);

	useEffect(() => {
		if (verifyCodeTime === 0 && key === 'forgot-password') {
			if (isShowForm) {
				setNotice('Mã xác thực đã hết hạn');
			}
		}
	}, [verifyCodeTime]);

	const checkPasswordHandler = () => {
		if (valueRef?.current?.value === '') {
			setNotice('Vui lòng nhập mật khẩu cũ');
		} else {
			axios
				.post(`${BE_BASE_URL}/check-password`, {
					userId: userId,
					password: valueRef.current.value,
				})
				.then((res) => {
					if (res?.data?.message === 'True') {
						setIsShowResetPasswordForm(true);
						setToastList([
							...toastList,
							<ToastComponent
								type='success'
								content={'Nhập mật khẩu mới'}
							/>,
						]);
					} else {
						setToastList([
							...toastList,
							<ToastComponent
								type='danger'
								content={'Mật khẩu cũ không chính xác'}
							/>,
						]);
					}
				})
				.catch((err) => {
					console.log(err);
				});
		}
	};

	const changePasswordHandler = async () => {
		const passwordRegex = /^[a-zA-Z0-9]{8,16}$/;
		const newPassword = valueRef.current.value.trim();
		const repeatNewPassword = repeatPasswordRef.current.value.trim();

		if (!passwordRegex.test(newPassword)) {
			setNotice(
				'Mật khẩu phải từ 8 - 16 ký tự và không chứa ký tự đặc biệt như " !"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~'
			);
			valueRef.current.focus();
			return;
		}

		if (newPassword !== repeatNewPassword) {
			setNotice('Xác nhận mật khẩu không trùng khớp');
			repeatPasswordRef.current.focus();
			return;
		}

		setIsShowLoader(true);

		await axios
			.post(`${BE_BASE_URL}/change-password`, {
				userId: userId,
				password: newPassword,
			})
			.then((res) => {
				if (res?.data?.message === 'success') {
					setToastList([
						...toastList,
						<ToastComponent
							type='success'
							content={'Đổi mật khẩu thành công'}
						/>,
					]);
					setKey('');
				} else {
					setToastList([
						...toastList,
						<ToastComponent
							type='danger'
							content={'Đổi mật khẩu không thành công'}
						/>,
					]);
				}
			})
			.catch((err) => console.error(err));

		setIsShowLoader(false);
	};

	const getNewVerifyCodeHandler = () => {
		setVerifyCodeTime(59);
		setIsResetTime((prev) => !prev);
		setNotice('');
	};

	const sendVerifyCodeHandler = () => {
		if (verifyCode.length < 6) {
			setToastList([
				...toastList,
				<ToastComponent
					type='danger'
					content={'Vui lòng nhập đủ 6 ký tự'}
				/>,
			]);
		} else {
			axios
				.post(`${BE_BASE_URL}/verify`, {
					verifyCode,
				})
				.then((res) => {
					if (res?.data?.message === 'Verified') {
						setIsShowResetPasswordForm(true);
						setToastList([
							...toastList,
							<ToastComponent
								type='success'
								content={'Xác thực thành công'}
							/>,
						]);
						setKey('change-password');
					} else {
						setToastList([
							...toastList,
							<ToastComponent
								type='danger'
								content={'Mã xác thực không chính xác'}
							/>,
						]);
					}
				})
				.catch((err) => console.error(err));
		}
	};

	return (
		<>
			<Header />
			<main className={cx('main', 'container-fluid', 'p-4', 'pb-5')}>
				<div className='row'>
					<div className={cx('col-lg-6', 'col-sm-12')}>
						<div className={cx('heading')}>THÔNG TIN CÁ NHÂN</div>
						<div className={cx('info-wrap')}>
							<div className={cx('info-item')}>
								<div className={cx('title')}>
									Họ và Tên: {user.name}
								</div>
								<div
									className={cx('icon')}
									onClick={() => setKey('name')}
								>
									{editIcon}
								</div>
							</div>
							<div className={cx('info-item')}>
								<div className={cx('title')}>
									Ngày sinh:{' '}
									{convertYYYYMMDDToDDMMYYYY(
										user.date_of_birth
									)}
								</div>
								<div
									className={cx('icon')}
									onClick={() => setKey('date_of_birth')}
								>
									{editIcon}
								</div>
							</div>
							<div className={cx('info-item')}>
								<div className={cx('title')}>
									Giới tính: {user.gender}
								</div>
								<div
									className={cx('icon')}
									onClick={() => setKey('gender')}
								>
									{editIcon}
								</div>
							</div>
							<div className={cx('info-item')}>
								<div className={cx('title')}>
									CCCD: {user.citizen_identification}
								</div>
								<div
									className={cx('icon')}
									onClick={() =>
										setKey('citizen_identification')
									}
								>
									{editIcon}
								</div>
							</div>
							<div className={cx('info-item')}>
								<div className={cx('title')}>
									Email: {user.email}
								</div>
								<div
									className={cx('icon')}
									onClick={() => setKey('email')}
								>
									{editIcon}
								</div>
							</div>
							<div className={cx('info-item')}>
								<div className={cx('title')}>
									Số điện thoại: {user.phone}
								</div>
								<div
									className={cx('icon')}
									onClick={() => setKey('phone')}
								>
									{editIcon}
								</div>
							</div>
							<div className={cx('info-item')}>
								<div className={cx('title')}>
									Địa chỉ: {user.district}, {user.city}
								</div>
								<div
									className={cx('icon')}
									onClick={() => setKey('address')}
								>
									{editIcon}
								</div>
							</div>
							<div className={cx('info-item')}>
								<div className={cx('title')}>
									Tên đăng nhập: {user.username}
								</div>
								<div
									className={cx('icon')}
									onClick={() => setKey('username')}
								>
									{editIcon}
								</div>
							</div>
							<div className={cx('info-item')}>
								<div className={cx('title', 'mt-2')}>
									Ngày tham gia:{' '}
									{convertYYYYMMDDToDDMMYYYY(
										user.creation_date
									)}
								</div>
							</div>
							<div className={cx('info-item')}>
								<div className={cx('title', 'mt-2')}>
									Điểm khách hàng thân thiết: {user.point}
								</div>
							</div>
							<div className={cx('button-wrap')}>
								<button
									onClick={() => setKey('change-password')}
								>
									Đổi mật khẩu
								</button>
								<button
									onClick={() => setKey('forgot-password')}
								>
									Quên mật khẩu
								</button>
								<button
									className={cx('primary')}
									onClick={() => setKey('delete-password')}
								>
									Xóa tài khoản
								</button>
							</div>
						</div>
					</div>
					<div
						className={cx(
							'd-none',
							'd-sm-block',
							'col-lg-6',
							'col-sm-12'
						)}
					>
						<div
							className={cx(
								'heading',
								'mt-md-4',
								'mt-sm-4',
								'mt-lg-0'
							)}
						>
							LỊCH TRÌNH ĐÃ ĐẶT
						</div>
						<div className={cx('d-flex', 'flex-column', 'gap-4')}>
							{mySchedule.length !== 0 &&
								mySchedule
									.slice(0, sliceLimit)
									.map((ticket, index) => (
										<Ticket
											key={index}
											scheduleId={ticket.schedule_id}
											seat={ticket.seat.split(',')}
											payments={ticket.payment}
											isPaid={ticket.isPaid}
											ticketId={ticket.id}
											onclick={true}
										/>
									))}
						</div>
						{mySchedule.length > sliceLimit && (
							<button
								className={cx(
									'w-100',
									'mt-4',
									'bg-body-secondary',
									'p-2',
									'rounded-3'
								)}
								onClick={() =>
									setSliceLimit((prev) => prev + 10)
								}
							>
								Hiện thêm
							</button>
						)}
					</div>
				</div>
			</main>
			{key === 'name' && (
				<>
					<div
						className={cx('form')}
						ref={formRef}
						data-attr={closeIcon}
					>
						<div className={cx('old-value')}>
							Họ và Tên: {user.name}
						</div>
						<div className={cx('input')}>
							<label htmlFor='name'>Nhập Họ và Tên mới:</label>
							<input
								type='text'
								id='name'
								ref={valueRef}
							/>
						</div>
						<div className={cx('button-wrap')}>
							<button
								className='bg-danger'
								onClick={clearData}
							>
								Nhập lại
							</button>
							<button
								className='bg-info'
								onClick={updateData}
							>
								Lưu
							</button>
						</div>
						<div
							className={cx('close-btn')}
							onClick={() => setKey('')}
						>
							{closeIcon}
						</div>
					</div>
					<Overlay />
				</>
			)}
			{key === 'date_of_birth' && (
				<>
					<div
						className={cx('form')}
						ref={formRef}
						data-attr={closeIcon}
					>
						<div className={cx('old-value')}>
							Ngày sinh:{' '}
							{convertYYYYMMDDToDDMMYYYY(user.date_of_birth)}
						</div>
						<div className={cx('input')}>
							<label htmlFor='date_of_birth'>
								Nhập ngày sinh mới:
							</label>
							<input
								type='date'
								id='date_of_birth'
								ref={valueRef}
							/>
						</div>
						<div className={cx('button-wrap')}>
							<button
								className='bg-danger'
								onClick={clearData}
							>
								Nhập lại
							</button>
							<button
								className='bg-info'
								onClick={updateData}
							>
								Lưu
							</button>
						</div>
						<div
							className={cx('close-btn')}
							onClick={() => setKey('')}
						>
							{closeIcon}
						</div>
					</div>
					<Overlay />
				</>
			)}
			{key === 'gender' && (
				<>
					<div
						className={cx('form')}
						ref={formRef}
						data-attr={closeIcon}
					>
						<div className={cx('old-value')}>
							Giới tính: {user.gender}
						</div>
						<div className={cx('input')}>
							<label htmlFor='gender'>Nhập giới tính mới:</label>
							<select
								id='gender'
								ref={valueRef}
								defaultValue={user.gender}
							>
								<option value=''>Chọn giới tính</option>
								<option value='Nam'>Nam</option>
								<option value='Nữ'>Nữ</option>
							</select>
						</div>
						<div className={cx('button-wrap')}>
							<button
								className='bg-danger'
								onClick={clearData}
							>
								Nhập lại
							</button>
							<button
								className='bg-info'
								onClick={updateData}
							>
								Lưu
							</button>
						</div>
						<div
							className={cx('close-btn')}
							onClick={() => setKey('')}
						>
							{closeIcon}
						</div>
					</div>
					<Overlay />
				</>
			)}
			{key === 'citizen_identification' && (
				<>
					<div
						className={cx('form')}
						ref={formRef}
						data-attr={closeIcon}
					>
						<div className={cx('old-value')}>
							CCCD: {user.citizen_identification}
						</div>
						<div className={cx('input')}>
							<label htmlFor='citizen_identification'>
								Nhập CCCD mới:
							</label>
							<input
								type='number'
								id='citizen_identification'
								ref={valueRef}
							/>
						</div>
						<div className={cx('button-wrap')}>
							<button
								className='bg-danger'
								onClick={clearData}
							>
								Nhập lại
							</button>
							<button
								className='bg-info'
								onClick={updateData}
							>
								Lưu
							</button>
						</div>
						<div
							className={cx('close-btn')}
							onClick={() => setKey('')}
						>
							{closeIcon}
						</div>
					</div>
					<Overlay />
				</>
			)}
			{key === 'email' && (
				<>
					<div
						className={cx('form')}
						ref={formRef}
						data-attr={closeIcon}
					>
						<div className={cx('old-value')}>
							Email: {user.email}
						</div>
						<div className={cx('input')}>
							<label htmlFor='email'>Nhập email mới:</label>
							<input
								type='text'
								id='email'
								ref={valueRef}
								placeholder='your_name@gmail.com'
							/>
						</div>
						<div className={cx('button-wrap')}>
							<button
								className='bg-danger'
								onClick={clearData}
							>
								Nhập lại
							</button>
							<button
								className='bg-info'
								onClick={updateData}
							>
								Lưu
							</button>
						</div>
						<div
							className={cx('close-btn')}
							onClick={() => setKey('')}
						>
							{closeIcon}
						</div>
					</div>
					<Overlay />
				</>
			)}
			{key === 'phone' && (
				<>
					<div
						className={cx('form')}
						ref={formRef}
						data-attr={closeIcon}
					>
						<div className={cx('old-value')}>
							Số điện thoại: {user.phone}
						</div>
						<div className={cx('input')}>
							<label htmlFor='phone'>
								Nhập số điện thoại mới:
							</label>
							<input
								type='number'
								id='phone'
								ref={valueRef}
							/>
						</div>
						<div className={cx('button-wrap')}>
							<button
								className='bg-danger'
								onClick={clearData}
							>
								Nhập lại
							</button>
							<button
								className='bg-info'
								onClick={updateData}
							>
								Lưu
							</button>
						</div>
						<div
							className={cx('close-btn')}
							onClick={() => setKey('')}
						>
							{closeIcon}
						</div>
					</div>
					<Overlay />
				</>
			)}
			{key === 'address' && (
				<>
					<div
						className={cx('form')}
						ref={formRef}
						data-attr={closeIcon}
					>
						<div className={cx('old-value')}>
							Địa chỉ: {user.district}, {user.city}
						</div>
						<div className={cx('input')}>
							<select
								defaultValue={user.city}
								onChange={(e) =>
									setSelectedCity(e.target.value)
								}
							>
								<option value=''>Chọn Tỉnh/Thành phố</option>
								{cities.map((city) => (
									<option
										key={city.id}
										value={city.name}
									>
										{city.name}
									</option>
								))}
							</select>
							<select
								defaultValue={user.district}
								onChange={(e) =>
									setSelectedDistrict(e.target.value)
								}
							>
								<option value=''>Chọn Quận/Huyện</option>
								{districts.map((district) => (
									<option
										key={district.id}
										value={district.id}
									>
										{district.name}
									</option>
								))}
							</select>
						</div>
						<div className={cx('button-wrap')}>
							<button
								className='bg-danger'
								onClick={clearData}
							>
								Nhập lại
							</button>
							<button
								className='bg-info'
								onClick={updateData}
							>
								Lưu
							</button>
						</div>
						<div
							className={cx('close-btn')}
							onClick={() => setKey('')}
						>
							{closeIcon}
						</div>
					</div>
					<Overlay />
				</>
			)}
			{key === 'username' && (
				<>
					<div
						className={cx('form')}
						ref={formRef}
						data-attr={closeIcon}
					>
						<div className={cx('old-value')}>
							Tên đăng nhập: {user.username}
						</div>
						<div className={cx('input')}>
							<label htmlFor='username'>
								Nhập Tên đăng nhập mới:
							</label>
							<select
								id='username'
								ref={valueRef}
								defaultValue={user.username}
							>
								<option value=''>Email hoặc SĐT</option>
								<option value={user.phone}>{user.phone}</option>
								<option value={user.email}>{user.email}</option>
							</select>
						</div>
						<div className={cx('button-wrap')}>
							<button
								className='bg-danger'
								onClick={clearData}
							>
								Nhập lại
							</button>
							<button
								className='bg-info'
								onClick={updateData}
							>
								Lưu
							</button>
						</div>
						<div
							className={cx('close-btn')}
							onClick={() => setKey('')}
						>
							{closeIcon}
						</div>
					</div>
					<Overlay />
				</>
			)}
			{key === 'change-password' && (
				<>
					<div
						className={cx('form')}
						ref={formRef}
					>
						<h2 className={cx('w-100', 'text-center', 'fw-bold')}>
							ĐỔI MẬT KHẨU
						</h2>
						{!isShowResetPasswordForm && (
							<div className={cx('modify-password--input')}>
								<input
									type='password'
									id='old-password'
									ref={valueRef}
									placeholder=''
								/>
								<label htmlFor='old-password'>
									Nhập mật khẩu cũ
								</label>
								<div className={cx('show-password')}>
									{isShowPassword && (
										<FontAwesomeIcon
											icon={faEye}
											onClick={handleClickShowPassword}
										/>
									)}
									{!isShowPassword && (
										<FontAwesomeIcon
											icon={faEyeSlash}
											onClick={handleClickShowPassword}
										/>
									)}
								</div>
							</div>
						)}
						{isShowResetPasswordForm && (
							<div className={cx('modify-password--input')}>
								<input
									type='password'
									id='new-password'
									ref={valueRef}
									placeholder=''
								/>
								<label htmlFor='new-password'>
									Nhập mật khẩu mới
								</label>
								<div className={cx('show-password')}>
									{isShowPassword && (
										<FontAwesomeIcon
											icon={faEye}
											onClick={handleClickShowPassword}
										/>
									)}
									{!isShowPassword && (
										<FontAwesomeIcon
											icon={faEyeSlash}
											onClick={handleClickShowPassword}
										/>
									)}
								</div>
							</div>
						)}
						{isShowResetPasswordForm && (
							<div className={cx('modify-password--input')}>
								<input
									type='password'
									id='repeat-new-password'
									ref={repeatPasswordRef}
									placeholder=''
								/>
								<label htmlFor='repeat-new-password'>
									Nhập lại mật khẩu mới
								</label>
								<div className={cx('show-password')}>
									{isShowPassword && (
										<FontAwesomeIcon
											icon={faEye}
											onClick={handleClickShowPassword}
										/>
									)}
									{!isShowPassword && (
										<FontAwesomeIcon
											icon={faEyeSlash}
											onClick={handleClickShowPassword}
										/>
									)}
								</div>
							</div>
						)}
						{notice !== '' && (
							<div className={cx('notice')}>{notice}</div>
						)}
						{!isShowResetPasswordForm && (
							<div className={cx('button-wrap')}>
								<button
									className='bg-danger'
									onClick={clearData}
								>
									Nhập lại
								</button>
								<button
									className='bg-info'
									onClick={checkPasswordHandler}
								>
									Tiếp theo
								</button>
							</div>
						)}
						{isShowResetPasswordForm && (
							<div className={cx('button-wrap')}>
								<button
									className='bg-danger'
									onClick={clearData}
								>
									Nhập lại
								</button>
								<button
									className='bg-info'
									onClick={changePasswordHandler}
								>
									Lưu
								</button>
							</div>
						)}
						<div
							className={cx('close-btn')}
							onClick={() => setKey('')}
						>
							{closeIcon}
						</div>
					</div>
					<Overlay />
				</>
			)}
			{key === 'forgot-password' && (
				<>
					<div
						className={cx('form')}
						ref={formRef}
					>
						<h2 className={cx('w-100', 'text-center', 'fw-bold')}>
							QUÊN MẬT KHẨU
						</h2>
						<h6 className='text-center'>
							Vui lòng hãy nhập mã xác thực đã được gửi đến Email
							của bạn.
						</h6>
						<h5 className='text-center mt-4'>
							Mã xác thực chỉ có hiệu lực trong 60 giây. Thời gian
							còn lại của bạn là:{' '}
							<span
								className={
									(verifyCodeTime === 0 && 'text-danger') ||
									(verifyCodeTime <= 5 && 'text-warning') ||
									'none'
								}
							>
								{verifyCodeTime}
							</span>{' '}
							giây
						</h5>
						<div className='w-100 d-flex align-items-center justify-content-center gap-2 mt-4'>
							<VerifyCode
								length={6}
								setVerifyCode={setVerifyCode}
								handleEnter={() => submitRef.current.click()}
							/>
						</div>
						{isShowResetPasswordForm && (
							<div className={cx('modify-password--input')}>
								<input
									type='password'
									id='new-password'
									ref={valueRef}
									placeholder=''
								/>
								<label htmlFor='new-password'>
									Nhập mật khẩu mới
								</label>
								<div className={cx('show-password')}>
									{isShowPassword && (
										<FontAwesomeIcon
											icon={faEye}
											onClick={handleClickShowPassword}
										/>
									)}
									{!isShowPassword && (
										<FontAwesomeIcon
											icon={faEyeSlash}
											onClick={handleClickShowPassword}
										/>
									)}
								</div>
							</div>
						)}
						{isShowResetPasswordForm && (
							<div className={cx('modify-password--input')}>
								<input
									type='password'
									id='repeat-new-password'
									ref={repeatPasswordRef}
									placeholder=''
								/>
								<label htmlFor='repeat-new-password'>
									Nhập lại mật khẩu mới
								</label>
								<div className={cx('show-password')}>
									{isShowPassword && (
										<FontAwesomeIcon
											icon={faEye}
											onClick={handleClickShowPassword}
										/>
									)}
									{!isShowPassword && (
										<FontAwesomeIcon
											icon={faEyeSlash}
											onClick={handleClickShowPassword}
										/>
									)}
								</div>
							</div>
						)}
						{notice !== '' && (
							<div className={cx('notice')}>{notice}</div>
						)}
						<div
							className={cx('close-btn')}
							onClick={() => setKey('')}
						>
							{closeIcon}
						</div>
						{!isShowResetPasswordForm && (
							<button
								className={cx('get-new-verify-code-btn')}
								onClick={getNewVerifyCodeHandler}
							>
								Tôi không nhận được mã
							</button>
						)}
						{!isShowResetPasswordForm && (
							<div className={cx('button-wrap')}>
								<button
									className='bg-danger'
									onClick={clearData}
								>
									Nhập lại
								</button>
								<button
									className='bg-info'
									onClick={sendVerifyCodeHandler}
									ref={submitRef}
								>
									Gửi
								</button>
							</div>
						)}
						{isShowResetPasswordForm && (
							<div className={cx('button-wrap')}>
								<button
									className='bg-danger'
									onClick={clearData}
								>
									Nhập lại
								</button>
								<button
									className='bg-info'
									onClick={changePasswordHandler}
								>
									Lưu
								</button>
							</div>
						)}
					</div>
					<Overlay />
				</>
			)}
			{key === 'delete-password' && (
				<>
					<div
						className={cx('form')}
						ref={formRef}
					>
						ccc
						<div
							className={cx('close-btn')}
							onClick={() => setKey('')}
						>
							{closeIcon}
						</div>
					</div>
					<Overlay />
				</>
			)}
			<ToastContainerComponent
				toastList={toastList}
				setToastList={setToastList}
			/>
			{isShowLoader && <Loader />}
		</>
	);
};

export default Profile;
