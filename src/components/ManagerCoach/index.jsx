import { useEffect, useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import classNames from 'classnames/bind';
import axios from 'axios';

import styles from './ManagerCoach.module.scss';
import Notification from '../Notification';

const cx = classNames.bind(styles);

const ManagerCoach = ({ type }) => {
	const [isShowNotification, setIsShowNotification] = useState(false);
	const [message, setMessage] = useState('');
	const [notificationType, setNotificationType] = useState('error');
	const [coaches, setCoaches] = useState([]);
	const [garages, setGarages] = useState([]);
	const [sortDirection, setSortDirection] = useState('asc');
	const [selectedCoach, setSelectedCoach] = useState('');
	const [selectedCoachKey, setSelectedCoachKey] = useState('');

	const dispatch = useDispatch();

	const vehicleNumberRef = useRef(null);
	const licensePlatesRef = useRef(null);
	const manufacturerRef = useRef(null);
	const garageRef = useRef(null);
	const typeRef = useRef(null);
	const newCoachValue = useRef(null);
	const removeCoachReason = useRef(null);

	const onChangeManagerState = (newState) => {
		dispatch({ type: 'MANAGER/CHANGE_STATE', payload: newState });
	};

	useEffect(() => {
		if (type === 'view') {
			axios.get('http://localhost:3000/manager-coach').then((res) => {
				if (res?.data) {
					setCoaches(res.data);
				}
			});
		} else if (type === 'add' || type === 'edit') {
			axios.get('http://localhost:3000/manager-garage').then((res) => {
				if (res?.data) {
					setGarages(res.data);
				}
			});
		}
	}, [type]);

	const sortHandler = (by) => {
		if (by === 'vehicle_number' || by === 'number_seat') {
			const sortedCoaches = [...coaches].sort((a, b) => {
				if (sortDirection === 'asc') {
					return a[by] - b[by];
				} else if (sortDirection === 'desc') {
					return b[by] - a[by];
				}
			});

			setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
			setCoaches([...sortedCoaches]);
		} else {
			const sortedCoaches = [...coaches].sort((a, b) => {
				if (sortDirection === 'asc') {
					return a[by].localeCompare(b[by]);
				} else if (sortDirection === 'desc') {
					return b[by].localeCompare(a[by]);
				}
			});

			setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
			setCoaches([...sortedCoaches]);
		}
	};

	const clearData = () => {
		vehicleNumberRef.current.value = '';
		licensePlatesRef.current.value = '';
		manufacturerRef.current.value = '';
		garageRef.current.value = 1;
		typeRef.current.value = 2;
	};

	const addCoachHandler = () => {
		if (vehicleNumberRef.current.value === '') {
			setMessage('Số xe không được để trống.');
			setIsShowNotification(true);
			setNotificationType('error');

			setTimeout(() => {
				setIsShowNotification(false);
			}, 7300);

			return;
		}

		if (licensePlatesRef.current.value === '') {
			setMessage('Biển số xe không được để trống.');
			setIsShowNotification(true);
			setNotificationType('error');

			setTimeout(() => {
				setIsShowNotification(false);
			}, 7300);

			return;
		}

		if (manufacturerRef.current.value === '') {
			setMessage('Hãng xe không được để trống.');
			setIsShowNotification(true);
			setNotificationType('error');

			setTimeout(() => {
				setIsShowNotification(false);
			}, 7300);

			return;
		}

		axios
			.post('http://localhost:3000/manager-coach', {
				vehicleNumber: parseInt(vehicleNumberRef.current.value.trim()),
				licensePlate: licensePlatesRef.current.value.trim(),
				manufacturer: manufacturerRef.current.value.trim(),
				garageId: garageRef.current.value,
				typeId: typeRef.current.value,
			})
			.then((res) => {
				if (res?.data?.message === 'success') {
					setMessage('Thêm xe thành công.');
					setIsShowNotification(true);
					setNotificationType('success');

					setTimeout(() => {
						setIsShowNotification(false);
					}, 7300);

					onChangeManagerState('manager-coach/view');

					return;
				}

				setMessage('Thêm xe thất bại.');
				setIsShowNotification(true);
				setNotificationType('error');

				setTimeout(() => {
					setIsShowNotification(false);
				}, 7300);
			});
	};

	const editGarageHandler = () => {
		if (selectedCoach === '' || selectedCoachKey === '') return;

		if (newCoachValue.current.value === '') {
			setMessage('Giá trị mới không được để trống.');
			setIsShowNotification(true);
			setNotificationType('error');

			setTimeout(() => {
				setIsShowNotification(false);
			}, 7300);

			return;
		}

		axios
			.patch('http://localhost:3000/manager-coach', {
				id: parseInt(selectedCoach),
				key: selectedCoachKey,
				value: newCoachValue.current.value.trim(),
			})
			.then((res) => {
				if (res?.data?.message === 'success') {
					setMessage('Sửa nhà xe thành công.');
					setIsShowNotification(true);
					setNotificationType('success');

					setTimeout(() => {
						setIsShowNotification(false);
					}, 7300);

					onChangeManagerState('manager-coach/view');
					setSelectedCoach('');
					setSelectedCoachKey('');

					return;
				}
			})
			.catch((err) => console.log(err));
	};

	const removeCoachHandler = () => {
		if (selectedCoach === '') return;

		if (removeCoachReason.current.value === '') {
			setMessage('Lý do xóa không được để trống.');
			setIsShowNotification(true);
			setNotificationType('error');

			setTimeout(() => {
				setIsShowNotification(false);
			}, 7300);

			return;
		}

		axios
			.delete('http://localhost:3000/manager-coach', {
				data: {
					id: parseInt(selectedCoach),
					reason: removeCoachReason.current.value.trim(),
				},
			})
			.then((res) => {
				if (res?.data?.message === 'success') {
					setMessage('Xóa nhà xe thành công.');
					setIsShowNotification(true);
					setNotificationType('success');

					setTimeout(() => {
						setIsShowNotification(false);
					}, 7300);

					onChangeManagerState('manager-coach/view');
					setSelectedCoach('');

					return;
				}
			})
			.catch((err) => console.log(err));
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
							onChangeManagerState('manager-coach/view')
						}
					>
						Xem xe
					</button>
					<button
						style={{
							backgroundColor:
								type === 'add'
									? 'var(--primary-color)'
									: '#39a7ff',
						}}
						onClick={() =>
							onChangeManagerState('manager-coach/add')
						}
					>
						Thêm xe
					</button>
					<button
						style={{
							backgroundColor:
								type === 'edit'
									? 'var(--primary-color)'
									: '#39a7ff',
						}}
						onClick={() =>
							onChangeManagerState('manager-coach/edit')
						}
					>
						Sửa xe
					</button>
					<button
						style={{
							backgroundColor:
								type === 'remove'
									? 'var(--primary-color)'
									: '#39a7ff',
						}}
						onClick={() =>
							onChangeManagerState('manager-coach/remove')
						}
					>
						Xóa xe
					</button>
				</div>
				<div className={cx('content')}>
					{type === 'view' && (
						<table>
							<thead>
								<tr>
									<th
										className={cx('clicked')}
										onClick={() =>
											sortHandler('vehicle_number')
										}
									>
										Số xe
									</th>
									<th
										className={cx('clicked')}
										onClick={() =>
											sortHandler('license_plates')
										}
									>
										Biển số
									</th>
									<th
										className={cx('clicked')}
										onClick={() =>
											sortHandler('manufacturer')
										}
									>
										Hãng
									</th>
									<th
										className={cx('clicked')}
										onClick={() => sortHandler('garage')}
									>
										Nhà xe
									</th>
									<th
										className={cx('clicked')}
										onClick={() => sortHandler('type')}
									>
										Loại xe
									</th>
									<th
										className={cx('clicked')}
										onClick={() =>
											sortHandler('number_seat')
										}
									>
										Số chỗ
									</th>
								</tr>
							</thead>
							<tbody>
								{coaches.length !== 0 &&
									coaches.map((coach, index) => (
										<tr key={index}>
											<td>{coach.vehicle_number}</td>
											<td>{coach.license_plates}</td>
											<td>{coach.manufacturer}</td>
											<td>{coach.garage}</td>
											<td>{coach.type}</td>
											<td>{coach.number_seat}</td>
										</tr>
									))}
							</tbody>
						</table>
					)}
					{type === 'add' && (
						<>
							<div className={cx('form')}>
								<label htmlFor='vehicle-number'>
									Nhập số xe
								</label>
								<input
									type='text'
									id='vehicle-number'
									placeholder='Ex: 100'
									ref={vehicleNumberRef}
								/>
								<label htmlFor='license-plates'>
									Nhập biển số xe
								</label>
								<input
									type='text'
									id='license-plates'
									placeholder='Ex: 51A-12345'
									ref={licensePlatesRef}
								/>
								<label htmlFor='manufacturer'>
									Nhập hãng xe
								</label>
								<input
									type='text'
									id='manufacturer'
									placeholder='Ex: Hyundai'
									ref={manufacturerRef}
								/>
								<label htmlFor='garage'>Chọn nhà xe</label>
								<select
									name='garage'
									id='garage'
									ref={garageRef}
								>
									{garages.length !== 0 &&
										garages.map((garage, index) => (
											<option
												key={index}
												value={garage.id}
											>
												{garage.name}
											</option>
										))}
								</select>
								<label htmlFor='garage'>Chọn loại xe</label>
								<select
									name='type'
									id='type'
									ref={typeRef}
								>
									<option value={2}>Ghế</option>
									<option value={3}>Giường</option>
								</select>
							</div>
							<div className={cx('btn')}>
								<button onClick={clearData}>Xóa dữ liệu</button>
								<button onClick={addCoachHandler}>Lưu</button>
							</div>
						</>
					)}
					{type === 'edit' && (
						<>
							<div className={cx('selection')}>
								<select
									onChange={(e) =>
										setSelectedCoach(e.target.value)
									}
								>
									<option value=''>Chọn biển số xe</option>
									{coaches.length !== 0 &&
										coaches.map((coach) => (
											<option
												key={coach.id}
												value={coach.id}
											>
												{coach.license_plates}
											</option>
										))}
								</select>
								<select
									onChange={(e) =>
										setSelectedCoachKey(e.target.value)
									}
								>
									<option value=''>Chỉnh sửa gì?</option>
									{coaches.length !== 0 &&
										Object.keys(coaches[0]).map(
											(key) =>
												key !== 'id' &&
												key !== 'number_seat' &&
												key !== 'type' && (
													<option
														key={key}
														value={key}
													>
														{key}
													</option>
												)
										)}
								</select>
								<button onClick={editGarageHandler}>
									Cập nhật
								</button>
							</div>
							<div className={cx('partition')}>
								<div className={cx('old')}>
									<div className={cx('title')}>
										Giá trị cũ
									</div>
									<div className={cx('value')}>
										{selectedCoachKey !== '' &&
											coaches.length !== 0 &&
											coaches.find(
												(coach) =>
													coach.id ===
													parseInt(selectedCoach)
											)[selectedCoachKey]}
									</div>
								</div>
								<div className={cx('new')}>
									<div className={cx('title')}>
										Giá trị mới
									</div>
									{(selectedCoachKey === 'vehicle_number' ||
										selectedCoachKey === 'license_plates' ||
										selectedCoachKey ===
											'manufacturer') && (
										<input
											type='text'
											ref={newCoachValue}
										/>
									)}
									{selectedCoachKey === 'garage' && (
										<select ref={newCoachValue}>
											{garages.length !== 0 &&
												garages.map((garage, index) => (
													<option
														key={index}
														value={garage.id}
													>
														{garage.name}
													</option>
												))}
										</select>
									)}
									{selectedCoachKey === 'type' && (
										<select ref={newCoachValue}>
											{/* <option value={1}>Du lịch</option> */}
											<option value={2}>Ghế</option>
											<option value={3}>Giường</option>
											{/* <option value={4}>Limousine</option> */}
										</select>
									)}
								</div>
							</div>
						</>
					)}
					{type === 'remove' && (
						<>
							<div className={cx('selection')}>
								<select
									onChange={(e) =>
										setSelectedCoach(e.target.value)
									}
								>
									<option value=''>Chọn biển số xe</option>
									{coaches.length !== 0 &&
										coaches.map((coach) => (
											<option
												key={coach.id}
												value={coach.id}
											>
												{coach.license_plates}
											</option>
										))}
								</select>
								<button onClick={removeCoachHandler}>
									Xóa
								</button>
							</div>
							<input
								type='text'
								ref={removeCoachReason}
								placeholder='Lý do xóa'
							/>
						</>
					)}
				</div>
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

export default ManagerCoach;
