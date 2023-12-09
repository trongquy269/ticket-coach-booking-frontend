import { useEffect, useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import classNames from 'classnames/bind';
import axios from 'axios';

import styles from './ManagerUser.module.scss';
import Notification from '../Notification';

const cx = classNames.bind(styles);

const ManagerUser = ({ type }) => {
	const [isShowNotification, setIsShowNotification] = useState(false);
	const [message, setMessage] = useState('');
	const [notificationType, setNotificationType] = useState('error');
	const [users, setUsers] = useState([]);
	const [hoverWidth, setHoverWidth] = useState('');
	const [sortDirection, setSortDirection] = useState('asc');
	const [cities, setCities] = useState([]);
	const [districts, setDistricts] = useState([]);
	const [selectedCity, setSelectedCity] = useState('');
	const [selectedDistrict, setSelectedDistrict] = useState(0);
	const [originalPassword, setOriginalPassword] = useState('');
	const [name, setName] = useState('');
	const [dateOfBirth, setDateOfBirth] = useState('');
	const [gender, setGender] = useState('Nam');
	const [phone, setPhone] = useState('');
	const [email, setEmail] = useState('');
	const [citizenIdentification, setCitizenIdentification] = useState('');
	const [selectedUser, setSelectedUser] = useState('');
	const [selectedUserKey, setSelectedUserKey] = useState('');
	const [editUserGender, setEditUserGender] = useState('');

	const newUserValue = useRef(null);
	const removeUserReason = useRef(null);

	const dispatch = useDispatch();

	const onChangeManagerState = (newState) => {
		dispatch({ type: 'MANAGER/CHANGE_STATE', payload: newState });
	};

	const convertDate = (date) => {
		if (!date) return '';

		const dateObject = new Date(date);
		return dateObject.toLocaleDateString('vi-VN');
	};

	const generatePassword = () => {
		const length = 8;
		const charset =
			'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
		let retVal = '';

		for (let i = 0, n = charset.length; i < length; ++i) {
			retVal += charset.charAt(Math.floor(Math.random() * n));
		}

		return retVal;
	};

	useEffect(() => {
		if (type === 'view' || type === 'edit' || type === 'remove') {
			axios.get('http://localhost:3000/manager-user').then((res) => {
				if (res?.data) {
					if (type === 'edit' || type === 'remove') {
						const sortedUsers = [...res.data].sort((a, b) => {
							if (a.phone === null) return 1;
							return a.phone.localeCompare(b.phone);
						});

						setUsers([...sortedUsers]);
					} else {
						setUsers(res.data);
					}
				}
			});
		}

		if (type === 'add' || type === 'edit') {
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

			const password = generatePassword();
			setOriginalPassword(password);
		}

		setSelectedUser('');
		setSelectedUserKey('');
	}, [type]);

	useEffect(() => {
		if (selectedCity !== '') {
			if (type === 'add') {
				axios
					.get('http://localhost:3000/district', {
						params: {
							city: selectedCity,
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
		}

		if (type === 'edit' && selectedUser !== '') {
			const userNeedEdited =
				users.length !== 0
					? users.find((user) => user.phone === selectedUser)
					: null;
			axios
				.get('http://localhost:3000/district', {
					params: {
						city: userNeedEdited.city,
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

			setSelectedCity('');
			setSelectedDistrict(0);
		}
	}, [type, selectedCity]);

	const sortHandler = (by) => {
		if (by === 'date_of_birth' || by === 'creation_date') {
			const sortedUsers = [...users].sort((a, b) => {
				if (sortDirection === 'asc') {
					return new Date(a[by]) - new Date(b[by]);
				} else if (sortDirection === 'desc') {
					return new Date(b[by]) - new Date(a[by]);
				}
			});
			setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');

			setUsers([...sortedUsers]);
		} else if (by === 'point') {
			const sortedUsers = [...users].sort((a, b) => {
				if (sortDirection === 'asc') {
					if (a[by] === null) return -1;
					return a[by] - b[by];
				} else if (sortDirection === 'desc') {
					if (b[by] === null) return -1;
					return b[by] - a[by];
				}
			});
			setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');

			setUsers([...sortedUsers]);
		} else {
			const sortedUsers = [...users].sort((a, b) => {
				if (sortDirection === 'asc') {
					if (a[by] === null) return 1;
					return a[by].localeCompare(b[by]);
				} else if (sortDirection === 'desc') {
					if (b[by] === null) return 1;
					return b[by].localeCompare(a[by]);
				}
			});
			setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');

			setUsers([...sortedUsers]);
		}
	};

	const clearData = () => {
		setName('');
		setDateOfBirth('');
		setGender('Nam');
		setPhone('');
		setEmail('');
		setCitizenIdentification('');
		setSelectedCity('');
		setSelectedDistrict(0);
	};

	const checkPhoneFormat = (phone) => {
		const regex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/g;
		return regex.test(phone);
	};

	const checkGmailFormat = (email) => {
		const regex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
		return regex.test(email);
	};

	const addHandler = () => {
		if (
			name === '' ||
			dateOfBirth === '' ||
			phone === '' ||
			email === '' ||
			citizenIdentification === '' ||
			selectedCity === '' ||
			selectedDistrict === 0
		) {
			setMessage('Vui lòng điền đầy đủ thông tin');
			setIsShowNotification(true);
			setNotificationType('error');

			setTimeout(() => {
				setIsShowNotification(false);
			}, 7300);
			return;
		} else if (!checkPhoneFormat(phone)) {
			setMessage('Số điện thoại không hợp lệ');
			setIsShowNotification(true);
			setNotificationType('error');

			setTimeout(() => {
				setIsShowNotification(false);
			}, 7300);
			return;
		} else if (!checkGmailFormat(email)) {
			setMessage('Email không hợp lệ');
			setIsShowNotification(true);
			setNotificationType('error');

			setTimeout(() => {
				setIsShowNotification(false);
			}, 7300);
			return;
		}

		axios
			.post('http://localhost:3000/manager-user', {
				name,
				dateOfBirth,
				gender,
				phone,
				email,
				citizenIdentification,
				city: selectedCity,
				district: selectedDistrict,
				password: originalPassword,
			})
			.then((res) => {
				if (res?.data?.message === 'success') {
					setMessage('Thêm thành công');
					setIsShowNotification(true);
					setNotificationType('success');

					setTimeout(() => {
						setIsShowNotification(false);
					}, 7300);

					onChangeManagerState('manager-user/view');
					return;
				}
			})
			.catch((err) => {
				console.log(err);
			});
	};

	const editUserHandler = () => {
		if (selectedUser === '' || selectedUserKey === '') return;

		if (
			newUserValue?.current?.value === '' ||
			(selectedUserKey === 'gender' && editUserGender === '')
		) {
			setMessage('Giá trị mới không được để trống.');
			setIsShowNotification(true);
			setNotificationType('error');

			setTimeout(() => {
				setIsShowNotification(false);
			}, 7300);

			return;
		}

		const value =
			selectedUserKey === 'gender'
				? editUserGender
				: newUserValue.current.value;

		axios
			.patch('http://localhost:3000/manager-user', {
				phone: selectedUser,
				key: selectedUserKey,
				value,
			})
			.then((res) => {
				if (res?.data?.message === 'success') {
					setMessage('Cập nhật thành công.');
					setIsShowNotification(true);
					setNotificationType('success');

					setTimeout(() => {
						setIsShowNotification(false);
					}, 7300);

					onChangeManagerState('manager-user/view');

					return;
				}
			})
			.catch((err) => {
				console.log(err);
			});
	};

	const removeUserHandler = () => {
		if (selectedUser === '') return;

		if (removeUserReason?.current?.value === '') {
			setMessage('Lý do xóa không được để trống.');
			setIsShowNotification(true);
			setNotificationType('error');

			setTimeout(() => {
				setIsShowNotification(false);
			}, 7300);

			return;
		}

		axios
			.delete('http://localhost:3000/manager-user', {
				data: {
					id: parseInt(selectedUser),
					reason: removeUserReason.current.value,
				},
			})
			.then((res) => {
				if (res?.data?.message === 'success') {
					setMessage('Xóa khách hàng thành công.');
					setIsShowNotification(true);
					setNotificationType('success');

					setTimeout(() => {
						setIsShowNotification(false);
					}, 7300);

					onChangeManagerState('manager-user/view');

					return;
				}
			})
			.catch((err) => {
				console.log(err);
			});
	};

	return (
		<>
			<div className={cx('wrap')}>
				<div className={cx('navbar')}>
					<button
						style={{
							backgroundColor:
								type === 'view'
									? 'var(--primary-color)'
									: '#39a7ff',
						}}
						onClick={() =>
							onChangeManagerState('manager-user/view')
						}
					>
						Xem khách hàng
					</button>
					<button
						style={{
							backgroundColor:
								type === 'add'
									? 'var(--primary-color)'
									: '#39a7ff',
						}}
						onClick={() => onChangeManagerState('manager-user/add')}
					>
						Thêm khách hàng
					</button>
					<button
						style={{
							backgroundColor:
								type === 'edit'
									? 'var(--primary-color)'
									: '#39a7ff',
						}}
						onClick={() =>
							onChangeManagerState('manager-user/edit')
						}
					>
						Sửa khách hàng
					</button>
					<button
						style={{
							backgroundColor:
								type === 'remove'
									? 'var(--primary-color)'
									: '#39a7ff',
						}}
						onClick={() =>
							onChangeManagerState('manager-user/remove')
						}
					>
						Xóa khách hàng
					</button>
				</div>
				{type === 'view' && (
					<div className={cx('content')}>
						<table>
							<thead>
								<tr>
									<th
										className={
											hoverWidth === 'name'
												? cx('w-25')
												: cx('w-20')
										}
										onMouseOver={() =>
											setHoverWidth('name')
										}
										onMouseLeave={() => setHoverWidth('')}
										onClick={() => sortHandler('name')}
									>
										Họ và Tên
									</th>
									<th
										className={
											hoverWidth === 'date_of_birth'
												? cx('w-10')
												: cx('w-8')
										}
										onMouseOver={() =>
											setHoverWidth('date_of_birth')
										}
										onMouseLeave={() => setHoverWidth('')}
										onClick={() =>
											sortHandler('date_of_birth')
										}
									>
										Ngày sinh
									</th>
									<th
										className={
											hoverWidth === 'gender'
												? cx('w-10')
												: ''
										}
										onMouseOver={() =>
											setHoverWidth('gender')
										}
										onMouseLeave={() => setHoverWidth('')}
										onClick={() => sortHandler('gender')}
									>
										Giới tính
									</th>
									<th
										className={
											hoverWidth === 'phone'
												? cx('w-15')
												: cx('w-8')
										}
										onMouseOver={() =>
											setHoverWidth('phone')
										}
										onMouseLeave={() => setHoverWidth('')}
										onClick={() => sortHandler('phone')}
									>
										Số điện thoại
									</th>
									<th
										className={
											hoverWidth === 'email'
												? cx('w-30')
												: cx('w-10')
										}
										onMouseOver={() =>
											setHoverWidth('email')
										}
										onMouseLeave={() => setHoverWidth('')}
										onClick={() => sortHandler('email')}
									>
										Email
									</th>
									<th
										className={
											hoverWidth === 'district'
												? cx('w-20')
												: ''
										}
										onMouseOver={() =>
											setHoverWidth('district')
										}
										onMouseLeave={() => setHoverWidth('')}
										onClick={() => sortHandler('district')}
									>
										Quận, Huyện
									</th>
									<th
										className={
											hoverWidth === 'city'
												? cx('w-20')
												: ''
										}
										onMouseOver={() =>
											setHoverWidth('city')
										}
										onMouseLeave={() => setHoverWidth('')}
										onClick={() => sortHandler('city')}
									>
										Tỉnh
									</th>
									<th
										className={
											hoverWidth === 'id'
												? cx('w-15')
												: ''
										}
										onMouseOver={() => setHoverWidth('id')}
										onMouseLeave={() => setHoverWidth('')}
										onClick={() =>
											sortHandler(
												'citizen_identification'
											)
										}
									>
										CCCD / CMND
									</th>
									<th
										className={
											hoverWidth === 'username'
												? cx('w-30')
												: ''
										}
										onMouseOver={() =>
											setHoverWidth('username')
										}
										onMouseLeave={() => setHoverWidth('')}
										onClick={() => sortHandler('username')}
									>
										Tên đăng nhập
									</th>
									<th
										className={
											hoverWidth === 'role'
												? cx('w-10')
												: ''
										}
										onMouseOver={() =>
											setHoverWidth('role')
										}
										onMouseLeave={() => setHoverWidth('')}
										onClick={() => sortHandler('role')}
									>
										Quyền
									</th>
									<th
										className={
											hoverWidth === 'creation-date'
												? cx('w-10')
												: ''
										}
										onMouseOver={() =>
											setHoverWidth('creation-date')
										}
										onMouseLeave={() => setHoverWidth('')}
										onClick={() =>
											sortHandler('creation_date')
										}
									>
										Ngày tạo
									</th>
									<th onClick={() => sortHandler('point')}>
										Điểm
									</th>
								</tr>
							</thead>
							<tbody>
								{users.length !== 0 &&
									users.map((user, index) => (
										<tr key={index}>
											<td
												onMouseOver={() =>
													setHoverWidth('name')
												}
												onMouseLeave={() =>
													setHoverWidth('')
												}
											>
												{user.name}
											</td>
											<td
												onMouseOver={() =>
													setHoverWidth(
														'date_of_birth'
													)
												}
												onMouseLeave={() =>
													setHoverWidth('')
												}
											>
												{convertDate(
													user.date_of_birth
												)}
											</td>
											<td
												onMouseOver={() =>
													setHoverWidth('gender')
												}
												onMouseLeave={() =>
													setHoverWidth('')
												}
											>
												{user.gender}
											</td>
											<td
												onMouseOver={() =>
													setHoverWidth('phone')
												}
												onMouseLeave={() =>
													setHoverWidth('')
												}
											>
												{user.phone}
											</td>
											<td
												onMouseOver={() =>
													setHoverWidth('email')
												}
												onMouseLeave={() =>
													setHoverWidth('')
												}
											>
												{user.email}
											</td>
											<td
												onMouseOver={() =>
													setHoverWidth('district')
												}
												onMouseLeave={() =>
													setHoverWidth('')
												}
											>
												{user.district}
											</td>
											<td
												onMouseOver={() =>
													setHoverWidth('city')
												}
												onMouseLeave={() =>
													setHoverWidth('')
												}
											>
												{user.city}
											</td>
											<td
												onMouseOver={() =>
													setHoverWidth('id')
												}
												onMouseLeave={() =>
													setHoverWidth('')
												}
											>
												{user.citizen_identification}
											</td>
											<td
												onMouseOver={() =>
													setHoverWidth('username')
												}
												onMouseLeave={() =>
													setHoverWidth('')
												}
											>
												{user.username}
											</td>
											<td
												onMouseOver={() =>
													setHoverWidth('role')
												}
												onMouseLeave={() =>
													setHoverWidth('')
												}
											>
												{user.role}
											</td>
											<td
												onMouseOver={() =>
													setHoverWidth(
														'creation-date'
													)
												}
												onMouseLeave={() =>
													setHoverWidth('')
												}
											>
												{convertDate(
													user.creation_date
												)}
											</td>
											<td>{user.point}</td>
										</tr>
									))}
							</tbody>
						</table>
					</div>
				)}
				{type === 'add' && (
					<div className={cx('content', 'grid')}>
						<label htmlFor='name'>Họ và tên:</label>
						<input
							type='text'
							id='name'
							placeholder='Ex: Nguyễn Văn A'
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
						<label htmlFor='date_of_birth'>Ngày sinh:</label>
						<input
							type='date'
							id='date_of_birth'
							onChange={(e) => setDateOfBirth(e.target.value)}
							onInput={(e) => setDateOfBirth(e.target.value)}
							value={dateOfBirth}
						/>
						<label htmlFor='gender'>Giới tính:</label>
						<div className={cx('form')}>
							<label htmlFor='gender-male'>Nam</label>
							<input
								type='radio'
								id='gender-male'
								name='gender'
								defaultChecked
								onChange={() => setGender('Nam')}
							/>
							<label htmlFor='gender-female'>Nữ</label>
							<input
								type='radio'
								id='gender-female'
								name='gender'
								onChange={() => setGender('Nữ')}
							/>
						</div>
						<label htmlFor='phone'>Số điện thoại:</label>
						<input
							type='text'
							id='phone'
							placeholder='Ex: 0123456789'
							onChange={(e) => setPhone(e.target.value)}
							value={phone}
						/>
						<label htmlFor='email'>Email:</label>
						<input
							type='email'
							id='email'
							placeholder='Ex:nguyenvana@gmail.com'
							onChange={(e) => setEmail(e.target.value)}
							value={email}
						/>
						<label htmlFor='citizen-identification'>
							Số CMND/CCCD:
						</label>
						<input
							type='text'
							id='citizen-identification'
							placeholder='Ex: 123456789'
							onChange={(e) =>
								setCitizenIdentification(e.target.value)
							}
							value={citizenIdentification}
						/>
						<label htmlFor='accommodation'>Địa chỉ:</label>
						<div className={cx('select')}>
							<select
								onChange={(e) =>
									setSelectedCity(e.target.value)
								}
								value={selectedCity}
							>
								<option value=''>Tỉnh / Thành phố</option>
								{cities.length !== 0 &&
									cities.map((city) => (
										<option
											key={city.id}
											value={city.name}
										>
											{city.name}
										</option>
									))}
							</select>
							<select
								onChange={(e) =>
									setSelectedDistrict(e.target.value)
								}
								value={selectedDistrict}
							>
								<option value={0}>
									Quận / Huyện / Thành phố
								</option>
								{districts.length !== 0 &&
									districts.map((district) => (
										<option
											key={district.id}
											value={district.id}
										>
											{district.name}
										</option>
									))}
							</select>
						</div>
						{/* breck */}
						<span></span>
						<span></span>
						{/* breck */}
						<span>Tên đăng nhập:</span>
						<span>{phone || 'empty'}</span>
						<span>Mật khẩu:</span>
						<span>{originalPassword}</span>
						{/* breck */}
						<span></span>
						<span></span>
						{/* breck */}
						<button
							style={{ backgroundColor: '#ffc436' }}
							onClick={clearData}
						>
							Xóa dữ liệu
						</button>
						<button onClick={addHandler}>Thêm</button>
					</div>
				)}
				{type === 'edit' && (
					<div className={cx('content')}>
						<div className={cx('selection')}>
							<select
								onChange={(e) =>
									setSelectedUser(e.target.value)
								}
							>
								<option value=''>Chọn SĐT khách hàng</option>
								{users.length !== 0 &&
									users.map(
										(user) =>
											user.phone !== '' && (
												<option
													key={user.id}
													value={user.phone}
												>
													{user.phone}
												</option>
											)
									)}
							</select>
							<select
								onChange={(e) =>
									setSelectedUserKey(e.target.value)
								}
							>
								<option value=''>Chỉnh sửa gì?</option>
								{users.length !== 0 &&
									Object.keys(users[0]).map(
										(key) =>
											key !== 'id' &&
											key !== 'role' &&
											key !== 'creation_date' && (
												<option
													key={key}
													value={key}
												>
													{key}
												</option>
											)
									)}
							</select>
							<button onClick={editUserHandler}>Cập nhật</button>
						</div>
						<div className={cx('partition')}>
							<div className={cx('old')}>
								<div className={cx('title')}>Giá trị cũ</div>
								<div className={cx('value')}>
									{selectedUserKey !== '' &&
										users.length !== 0 &&
										users.find(
											(user) =>
												user.phone === selectedUser
										)[selectedUserKey]}
								</div>
							</div>
							<div className={cx('new')}>
								<div className={cx('title')}>Giá trị mới</div>
								{selectedUserKey === 'date_of_birth' ? (
									<input
										type='date'
										ref={newUserValue}
									/>
								) : selectedUserKey === 'gender' ? (
									<div className={cx('edit-input-wrap')}>
										<label htmlFor='male'>Nam</label>
										<input
											type='radio'
											name='gender'
											id='male'
											defaultChecked={
												selectedUserKey !== '' &&
												users.length !== 0 &&
												users.find(
													(user) =>
														user.phone ===
														selectedUser
												)[selectedUserKey] === 'Nam'
											}
											onChange={() =>
												setEditUserGender('Nam')
											}
										/>
										<label htmlFor='female'>Nữ</label>
										<input
											type='radio'
											name='gender'
											id='female'
											defaultChecked={
												selectedUserKey !== '' &&
												users.length !== 0 &&
												users.find(
													(user) =>
														user.phone ===
														selectedUser
												)[selectedUserKey] === 'Nữ'
											}
											onChange={() =>
												setEditUserGender('Nữ')
											}
										/>
									</div>
								) : selectedUserKey === 'city' ? (
									<select ref={newUserValue}>
										<option value=''>
											Tỉnh / Thành phố
										</option>
										{cities.length !== 0 &&
											cities.map((city) => (
												<option
													key={city.id}
													value={city.name}
												>
													{city.name}
												</option>
											))}
									</select>
								) : selectedUserKey === 'district' ? (
									<select ref={newUserValue}>
										<option value=''>
											Quận / Huyện / Thành phố
										</option>
										{districts.length !== 0 &&
											districts.map((district) => (
												<option
													key={district.id}
													value={district.id}
												>
													{district.name}
												</option>
											))}
									</select>
								) : (
									<input
										type='text'
										ref={newUserValue}
									/>
								)}
							</div>
						</div>
					</div>
				)}
				{type === 'remove' && (
					<div className={cx('content')}>
						<div className={cx('selection')}>
							<select
								onChange={(e) =>
									setSelectedUser(e.target.value)
								}
							>
								<option value=''>
									Chọn SĐT / email khách hàng
								</option>
								{users.length !== 0 &&
									users.map((user) =>
										user.phone === '' ? (
											<option
												key={user.id}
												value={user.id}
											>
												{user.email}
											</option>
										) : (
											<option
												key={user.id}
												value={user.id}
											>
												{user.phone}
											</option>
										)
									)}
							</select>
							<button onClick={removeUserHandler}>Xóa</button>
						</div>
						<input
							type='text'
							ref={removeUserReason}
							placeholder='Lý do xóa'
						/>
					</div>
				)}
			</div>
			{isShowNotification && (
				<Notification
					type={notificationType}
					message={message}
					timeout={7000}
				/>
			)}
		</>
	);
};

export default ManagerUser;
