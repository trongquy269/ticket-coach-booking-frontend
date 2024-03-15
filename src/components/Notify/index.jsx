import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle, faBusSimple } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import styles from './Notify.module.scss';
import {
	sortDescNumeric,
	convertYYYYMMDDToDDMMYYYY,
	notificationTimeCalculator,
} from '../../store/actions';
import { trashIcon, eyeIcon, eyeSlashIcon, backIcon } from '../../store/icons';

const cx = classNames.bind(styles);
const BE_BASE_URL = import.meta.env.VITE_BE_BASE_URL;

const Notify = ({
	notifies,
	setNotifies,
	setToastContent,
	setToastType,
	setToastUndo,
	toastUndo,
	isHideNotify,
	setIsHideNotify,
}) => {
	const [dragState, setDragState] = useState({
		isDragging: false,
		startX: 0,
		currentIndex: 0,
	});
	const [slideDirection, setSlideDirection] = useState('right');
	const [isShowCheckBox, setIsShowCheckBox] = useState(false);
	const [listRemove, setListRemove] = useState([]);
	const [justAction, setJustAction] = useState('');
	const [listUndoRemove, setListUndoRemove] = useState([]);
	const [listUndoChangeState, setListUndoChangeState] = useState([]);

	const userId = useSelector((state) => state.users.id);
	const role = useSelector((state) => state.users.role);

	const dispatch = useDispatch();
	const navigate = useNavigate();

	useEffect(() => {
		setJustAction('');
		setListRemove([]);
	}, []);

	const handleMouseDown = (e, index) => {
		setDragState({
			...dragState,
			isDragging: true,
			startX: e.clientX,
			currentIndex: index,
		});
		setNotifies((prevNotifies) => {
			const updatedNotifies = [...prevNotifies];
			updatedNotifies[index].translateX = 0;
			return updatedNotifies;
		});
	};

	const handleMouseMove = (e) => {
		if (dragState.isDragging) {
			const diffX = e.clientX - dragState.startX;
			setNotifies((prevNotifies) => {
				const updatedNotifies = [...prevNotifies];
				updatedNotifies[dragState.currentIndex].translateX = diffX;
				return updatedNotifies;
			});
			const translateX = notifies[dragState.currentIndex].translateX;
			if (translateX > 0) {
				if (slideDirection !== 'right') {
					setSlideDirection('right');
				}
			} else {
				if (slideDirection !== 'left') {
					setSlideDirection('left');
				}
			}
		}
	};

	const handleRemove = async (id = undefined) => {
		if (!id) {
			notifies.forEach((notify) => {
				if (listRemove.includes(notify.id)) {
					setListUndoRemove((prev) => [...prev, notify]);
				}
			});
			setNotifies((prev) =>
				prev.filter((notify) => !listRemove.includes(notify.id))
			);
		} else {
			const notify = notifies.find((notify) => notify.id === id);
			delete notify.translateX;

			setListUndoRemove((prev) => [...prev, notify]);
			setNotifies((prev) => prev.filter((notify) => notify.id !== id));
		}

		await axios
			.delete(`${BE_BASE_URL}/notify`, {
				data: {
					userId,
					id: id || listRemove,
				},
			})
			.then((res) => {
				if (res?.data?.message === 'success') {
					if (!toastUndo) {
						setJustAction('remove');
						setToastContent('Xóa thành công.');
						setToastType('success');
					}
				}
			})
			.catch((err) => {
				console.log(err);
			});

		setIsShowCheckBox(false);
	};

	useEffect(() => {
		if (
			!dragState.isDragging &&
			Math.abs(notifies[dragState.currentIndex]?.translateX) === 400
		) {
			handleRemove(notifies[dragState.currentIndex].id);
		}
	}, [dragState.isDragging]);

	const notifyClickHandler = () => {
		if (isShowCheckBox) return;
	};

	const handleMouseUp = async () => {
		if (dragState.isDragging) {
			setDragState({
				...dragState,
				isDragging: false,
				startX: 0,
			});

			const diffX = notifies[dragState.currentIndex].translateX;
			if (Math.abs(diffX) < 5) {
				setNotifies((prevNotifies) => {
					const updatedNotifies = [...prevNotifies];
					updatedNotifies[dragState.currentIndex].translateX = 0;
					return updatedNotifies;
				});
				notifyClickHandler();
			} else if (diffX > 100) {
				setNotifies((prevNotifies) => {
					const updatedNotifies = [...prevNotifies];
					updatedNotifies[dragState.currentIndex].translateX = 400;
					return updatedNotifies;
				});
			} else if (diffX < -100) {
				setNotifies((prevNotifies) => {
					const updatedNotifies = [...prevNotifies];
					updatedNotifies[dragState.currentIndex].translateX = -400;
					return updatedNotifies;
				});
			} else {
				setNotifies((prevNotifies) => {
					const updatedNotifies = [...prevNotifies];
					updatedNotifies[dragState.currentIndex].translateX = 0;
					return updatedNotifies;
				});
			}
		}
	};

	useEffect(() => {
		// When the mouse moves away from the container, the mouseup function will be triggered
		const handleDocumentMouseUp = () => {
			handleMouseUp();
		};

		document.addEventListener('mouseup', handleDocumentMouseUp);

		return () => {
			// Cleanup the event listener when the component unmounts
			document.removeEventListener('mouseup', handleDocumentMouseUp);
		};
	}, [handleMouseUp]);

	const handleCheckBox = (e, id) => {
		if (!isShowCheckBox) return;

		e.stopPropagation();

		if (listRemove.includes(id)) {
			setListRemove((prev) => prev.filter((item) => item !== id));
		} else {
			setListRemove((prev) => [...prev, id]);
		}
	};

	const handelSelectAll = () => {
		if (listRemove.length === notifies.length) {
			setListRemove([]);
			return;
		}

		const newListRemove = [];
		notifies.forEach((notify) => {
			newListRemove.push(notify.id);
		});
		setListRemove(newListRemove);
	};

	const handleChangeState = async (type, id = undefined) => {
		// Update the list of notifies
		const newList = [...notifies];

		if (!id) {
			newList.forEach((notify, index) => {
				if (listRemove.includes(notify.id)) {
					const newItem = {
						[index]: notify.isSeen,
					};
					setListUndoChangeState((prev) => [...prev, newItem]);
					notify.isSeen = type === 'seen' ? 1 : 0;
				}
			});
		} else {
			newList.forEach((notify, index) => {
				if (notify.id === id) {
					if ('translateX' in notify) {
						delete notify.translateX;
					}

					const newItem = {
						[index]: notify.isSeen,
					};
					setListUndoChangeState((prev) => [...prev, newItem]);
					notify.isSeen = type === 'seen' ? 1 : 0;
				}
			});
		}

		setNotifies([...newList]);

		await axios
			.put(`${BE_BASE_URL}/notify`, {
				userId,
				id: id || listRemove,
				type,
			})
			.then((res) => {
				if (res?.data?.message === 'success') {
					if (!toastUndo) {
						setJustAction(type);
						setToastContent('Cập nhật thành công.');
						setToastType('success');
					}
				}
			})
			.catch((err) => {
				console.log(err);
			});

		setIsShowCheckBox(false);
	};

	useEffect(() => {
		if (isShowCheckBox) {
			setListRemove([]);
		}
	}, [isShowCheckBox]);

	useEffect(() => {
		if (!toastUndo) return;

		axios.post(`${BE_BASE_URL}/notify/undo`).catch((err) => {
			console.log(err);
		});

		if (justAction === 'remove') {
			const arr = [...notifies, ...listUndoRemove];
			setNotifies(sortDescNumeric(arr, 'id'));
		} else {
			const newList = [...notifies];
			listUndoChangeState.forEach((item) => {
				const index = Object.keys(item)[0];
				newList[index].isSeen = item[index];
			});
			setNotifies(newList);
		}

		setJustAction('');
		setToastUndo(false);
		setListRemove([]);
		setListUndoRemove([]);
	}, [toastUndo]);

	const handleClickNotify = async (link, linkId, notifyId) => {
		await axios
			.patch(`${BE_BASE_URL}/notify`, {
				userId,
				notifyId,
			})
			.then((res) => {
				if (res?.data?.message === 'success') {
					console.log('success');
				}
			})
			.catch((err) => {
				console.log(err);
			});

		if (link.includes('-')) {
			const [head, tail] = link.split('-');

			if (head === 'Feedback') {
				axios
					.post('http://localhost:3000/schedule', {
						scheduleId: linkId,
					})
					.then((res) => {
						if (res?.data?.length !== 0) {
							dispatch({
								type: 'SCHEDULE/VIEW',
								payload: res.data[0],
							});
							navigate(`/view-schedule?feedback=${tail}`);
						}
					})
					.catch((err) => {
						console.log(err);
					});
			}
		} else if (link === 'schedule') {
			axios
				.post('http://localhost:3000/schedule', {
					scheduleId: linkId,
				})
				.then((res) => {
					if (res?.data?.length !== 0) {
						dispatch({
							type: 'SCHEDULE/VIEW',
							payload: res.data[0],
						});
						navigate(`/view-schedule`);
					}
				})
				.catch((err) => {
					console.log(err);
				});
		} else if (link === 'profile') {
			navigate('/profile');
		}
	};

	return (
		<>
			<div
				className={cx('wrap')}
				onClick={(e) => e.stopPropagation()}
				style={{
					scale: isHideNotify ? '0' : '1',
					transformOrigin: isHideNotify ? '298px -20px' : '',
				}}
			>
				<div className={cx('text-center mb-3 fw-bold')}>THÔNG BÁO</div>
				<div className={cx('tool')}>
					<div>
						{!isShowCheckBox && (
							<div
								className={cx('title')}
								onClick={() => setIsShowCheckBox(true)}
							>
								Lựa chọn
							</div>
						)}
						{isShowCheckBox && (
							<div className={cx('count')}>
								<div onClick={() => setIsShowCheckBox(false)}>
									{backIcon}
								</div>
								<div>{listRemove.length}</div>
							</div>
						)}
					</div>
					{isShowCheckBox && (
						<div className={cx('option')}>
							<div onClick={() => handleChangeState('seen')}>
								Đã đọc
							</div>
							<div onClick={() => handleChangeState('not seen')}>
								Chưa đọc
							</div>
							<div onClick={() => handleRemove()}>Xóa</div>
						</div>
					)}
				</div>
				{isShowCheckBox && (
					<div className={cx('select-all')}>
						<input
							type='checkbox'
							id='select-all'
							onChange={handelSelectAll}
							checked={listRemove.length === notifies.length}
						/>
						<label htmlFor='select-all'>
							{listRemove.length === notifies.length
								? 'Bỏ chọn tất cả'
								: 'Chọn tất cả'}
						</label>
					</div>
				)}
				<div className={cx('contain')}>
					{notifies.length > 0 &&
						notifies.map((notify, index) => (
							<div
								key={notify.id}
								className={cx('item-wrap')}
								style={{
									// backgroundColor:
									// 	slideDirection === 'left'
									// 		? 'var(--success-color)'
									// 		: 'var(--primary-color)',
									backgroundColor: 'var(--primary-color)',
								}}
								onClick={() =>
									handleClickNotify(
										notify.link,
										notify.link_id,
										notify.id
									)
								}
							>
								<div className={cx('drag-icon')}>
									{trashIcon}
								</div>
								<div className={cx('drag-icon')}>
									{/* {notify.isSeen ? eyeSlashIcon : eyeIcon} */}
									{trashIcon}
								</div>
								<div
									className={
										notify.isSeen
											? cx('item')
											: cx('item', 'active')
									}
									style={{
										transform: `translateX(${notify.translateX}px)`,
									}}
									onMouseDown={(e) =>
										handleMouseDown(e, index)
									}
									onMouseMove={(e) => handleMouseMove(e)}
									onMouseUp={handleMouseUp}
									onClick={(e) =>
										handleCheckBox(e, notify.id)
									}
								>
									<div className={cx('icon')}>
										{!isShowCheckBox && (
											<FontAwesomeIcon
												icon={faBusSimple}
											/>
										)}
										{!isShowCheckBox && !notify.isSeen && (
											<FontAwesomeIcon
												className={cx('status-icon')}
												icon={faCircle}
											/>
										)}
										{isShowCheckBox && (
											<input
												type='checkbox'
												onChange={(e) =>
													handleCheckBox(e, notify.id)
												}
												checked={listRemove.includes(
													notify.id
												)}
											/>
										)}
									</div>
									<div className={cx('content')}>
										<div className={cx('time')}>
											<div>
												{convertYYYYMMDDToDDMMYYYY(
													notify.date
												)}
											</div>
											<div>
												{notificationTimeCalculator(
													notify.date,
													notify.time
												)}
											</div>
										</div>
										<div>{notify.content}</div>
									</div>
								</div>
							</div>
						))}
				</div>
			</div>
			<div
				className={cx('triangle')}
				style={{
					scale: isHideNotify ? '0' : '1',
					transformOrigin: isHideNotify ? 'top' : '',
				}}
			></div>
		</>
	);
};

export default Notify;
