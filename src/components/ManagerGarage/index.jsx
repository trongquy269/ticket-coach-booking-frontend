import { useEffect, useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import classNames from 'classnames/bind';
import axios from 'axios';

import styles from './ManagerGarage.module.scss';
import Notification from '../Notification';

const cx = classNames.bind(styles);

const ManagerGarage = ({ type }) => {
	const [isShowNotification, setIsShowNotification] = useState(false);
	const [message, setMessage] = useState('');
	const [notificationType, setNotificationType] = useState('error');
	const [garages, setGarages] = useState([]);
	const [sortDirection, setSortDirection] = useState('asc');
	const [selectedGarage, setSelectedGarage] = useState('');
	const [selectedGarageKey, setSelectedGarageKey] = useState('');

	const dispatch = useDispatch();

	const garageNameRef = useRef(null);
	const garageDescriptionRef = useRef(null);
	const newGarageValue = useRef(null);
	const removeGarageReason = useRef(null);

	const onChangeManagerState = (newState) => {
		dispatch({ type: 'MANAGER/CHANGE_STATE', payload: newState });
	};

	useEffect(() => {
		if (type === 'view') {
			axios.get('http://localhost:3000/manager-garage').then((res) => {
				if (res?.data) {
					setGarages(res.data);
				}
			});
		}

		setSelectedGarage('');
	}, [type]);

	const sortHandler = (by) => {
		if (by === 'name') {
			const sortedGarages = [...garages].sort((a, b) => {
				if (sortDirection === 'asc') {
					return a[by].localeCompare(b[by]);
				} else if (sortDirection === 'desc') {
					return b[by].localeCompare(a[by]);
				}
			});
			setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');

			setGarages([...sortedGarages]);
		}
	};

	const addGarageHandler = () => {
		if (garageNameRef.current.value === '') {
			setMessage('Tên nhà xe không được để trống.');
			setIsShowNotification(true);
			setNotificationType('error');

			setTimeout(() => {
				setIsShowNotification(false);
			}, 7300);

			return;
		}

		axios
			.post('http://localhost:3000/manager-garage', {
				name: garageNameRef.current.value.trim(),
				description: garageDescriptionRef.current.value.trim(),
			})
			.then((res) => {
				if (res?.data?.message === 'success') {
					setMessage('Thêm nhà xe thành công.');
					setIsShowNotification(true);
					setNotificationType('success');

					setTimeout(() => {
						setIsShowNotification(false);
					}, 7300);

					onChangeManagerState('manager-garage/view');

					return;
				} else if (res?.data?.message === 'Garage already exist') {
					setMessage('Nhà xe đã tồn tại.');
					setIsShowNotification(true);
					setNotificationType('error');

					setTimeout(() => {
						setIsShowNotification(false);
					}, 7300);

					return;
				}
			})
			.catch((err) => console.log(err));
	};

	const editGarageHandler = () => {
		if (selectedGarage === '' || selectedGarageKey === '') return;

		if (newGarageValue.current.value === '') {
			setMessage('Giá trị mới không được để trống.');
			setIsShowNotification(true);
			setNotificationType('error');

			setTimeout(() => {
				setIsShowNotification(false);
			}, 7300);

			return;
		}

		axios
			.patch('http://localhost:3000/manager-garage', {
				id: parseInt(selectedGarage),
				[selectedGarageKey]: newGarageValue.current.value.trim(),
			})
			.then((res) => {
				if (res?.data?.message === 'success') {
					setMessage('Sửa nhà xe thành công.');
					setIsShowNotification(true);
					setNotificationType('success');

					setTimeout(() => {
						setIsShowNotification(false);
					}, 7300);

					onChangeManagerState('manager-garage/view');
					setSelectedGarage('');
					setSelectedGarageKey('');

					return;
				}
			})
			.catch((err) => console.log(err));
	};

	const removeGarageHandler = () => {
		if (selectedGarage === '') return;

		if (removeGarageReason.current.value === '') {
			setMessage('Lý do xóa không được để trống.');
			setIsShowNotification(true);
			setNotificationType('error');

			setTimeout(() => {
				setIsShowNotification(false);
			}, 7300);

			return;
		}

		axios
			.delete('http://localhost:3000/manager-garage', {
				data: {
					id: parseInt(selectedGarage),
					reason: removeGarageReason.current.value.trim(),
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

					onChangeManagerState('manager-garage/view');

					return;
				}
			})
			.catch((err) => console.log(err));
	};

	const contextMenuHandler = (e) => {
		e.preventDefault();
		console.log(1);
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
							onChangeManagerState('manager-garage/view')
						}
					>
						Xem nhà xe
					</button>
					<button
						style={{
							backgroundColor:
								type === 'add'
									? 'var(--primary-color)'
									: '#39a7ff',
						}}
						onClick={() =>
							onChangeManagerState('manager-garage/add')
						}
					>
						Thêm nhà xe
					</button>
					<button
						style={{
							backgroundColor:
								type === 'edit'
									? 'var(--primary-color)'
									: '#39a7ff',
						}}
						onClick={() =>
							onChangeManagerState('manager-garage/edit')
						}
					>
						Sửa nhà xe
					</button>
					<button
						style={{
							backgroundColor:
								type === 'remove'
									? 'var(--primary-color)'
									: '#39a7ff',
						}}
						onClick={() =>
							onChangeManagerState('manager-garage/remove')
						}
					>
						Xóa nhà xe
					</button>
				</div>
				{/* View garage */}
				{type === 'view' && (
					<div className={cx('content')}>
						<table>
							<thead>
								<tr>
									<th
										className={cx('clicked')}
										onClick={() => sortHandler('name')}
									>
										Tên nhà xe
									</th>
									<th>Mô tả</th>
								</tr>
							</thead>
							<tbody>
								{garages.length !== 0 &&
									garages.map((garage) => (
										<tr
											key={garage.id}
											onContextMenu={contextMenuHandler}
										>
											<td>{garage.name}</td>
											<td>{garage.description}</td>
										</tr>
									))}
							</tbody>
						</table>
					</div>
				)}
				{/* Adding garage */}
				{type === 'add' && (
					<div className={cx('content')}>
						<div>
							<label htmlFor='name'>Tên nhà xe</label>
							<input
								type='text'
								ref={garageNameRef}
							/>
							<button onClick={addGarageHandler}>Lưu</button>
						</div>
						<div>
							<label htmlFor='description'>Mô tả</label>
							<textarea ref={garageDescriptionRef} />
						</div>
					</div>
				)}
				{/* Edit garage */}
				{type === 'edit' && (
					<div className={cx('content')}>
						<div className={cx('selection')}>
							<select
								onChange={(e) =>
									setSelectedGarage(e.target.value)
								}
							>
								<option value=''>Chọn nhà xe</option>
								{garages.length !== 0 &&
									garages.map((garage) => (
										<option
											key={garage.id}
											value={garage.id}
										>
											{garage.name}
										</option>
									))}
							</select>
							<select
								onChange={(e) =>
									setSelectedGarageKey(e.target.value)
								}
							>
								<option value=''>Chỉnh sửa gì?</option>
								{garages.length !== 0 &&
									Object.keys(garages[0]).map(
										(key) =>
											key !== 'id' && (
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
								<div className={cx('title')}>Giá trị cũ</div>
								<div className={cx('value')}>
									{selectedGarageKey !== '' &&
										garages.length !== 0 &&
										garages.find(
											(garage) =>
												garage.id ===
												parseInt(selectedGarage)
										)[selectedGarageKey]}
								</div>
							</div>
							<div className={cx('new')}>
								<div className={cx('title')}>Giá trị mới</div>
								{selectedGarageKey === 'name' && (
									<input
										type='text'
										ref={newGarageValue}
									/>
								)}
								{selectedGarageKey === 'description' && (
									<textarea ref={newGarageValue}></textarea>
								)}
							</div>
						</div>
					</div>
				)}
				{/* Remove garage */}
				{type === 'remove' && (
					<div className={cx('content')}>
						<div className={cx('selection')}>
							<select
								onChange={(e) =>
									setSelectedGarage(e.target.value)
								}
							>
								<option value=''>Chọn nhà xe</option>
								{garages.length !== 0 &&
									garages.map((garage) => (
										<option
											key={garage.id}
											value={garage.id}
										>
											{garage.name}
										</option>
									))}
							</select>
							<button onClick={removeGarageHandler}>Xóa</button>
						</div>
						<input
							type='text'
							ref={removeGarageReason}
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

export default ManagerGarage;
