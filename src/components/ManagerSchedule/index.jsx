import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames/bind';
import axios from 'axios';

import styles from './ManagerSchedule.module.scss';
import { plusIcon, minusIcon } from '../../store/icons';
import ToastContainerComponent from '../../components/ToastContainerComponent';
import ToastComponent from '../../components/ToastComponent';

const cx = classNames.bind(styles);
const BE_BASE_URL = import.meta.env.VITE_BE_BASE_URL;

const ManagerSchedule = ({ type }) => {
	const user = useSelector((state) => state.users);

	const [toastList, setToastList] = useState([]);
	const [cities, setCities] = useState([]);
	const [startPlace, setStartPlace] = useState({});
	const [endPlace, setEndPlace] = useState({});
	const [isShowStartPlaceDropdown, setIsShowStartPlaceDropdown] =
		useState(false);
	const [isShowEndPlaceDropdown, setIsShowEndPlaceDropdown] = useState(false);
	const [schedules, setSchedules] = useState([]);
	const [typeCoaches, setTypeCoaches] = useState([]);
	const [vehicleNumbers, setVehicleNumbers] = useState([]);
	const [fromDate, setFromDate] = useState('');
	const [toDate, setToDate] = useState('');
	const [distance, setDistance] = useState('');
	const [duration, setDuration] = useState('');

	const dispatch = useDispatch();

	const containRef = useRef(null);
	const startPlaceInputRef = useRef(null);
	const endPlaceInputRef = useRef(null);

	const onChangeManagerState = (newState) => {
		dispatch({ type: 'MANAGER/CHANGE_STATE', payload: newState });
	};

	useEffect(() => {
		// Function to close the calendar when clicking outside of it
		const handleClickOutside = (event) => {
			if (
				startPlaceInputRef.current &&
				!startPlaceInputRef.current.contains(event.target)
			) {
				setIsShowStartPlaceDropdown(false);
			}

			if (
				endPlaceInputRef.current &&
				!endPlaceInputRef.current.contains(event.target)
			) {
				setIsShowEndPlaceDropdown(false);
			}
		};

		// Add event listener when the calendar is visible
		if (isShowStartPlaceDropdown) {
			document.addEventListener('click', handleClickOutside);
		} else if (isShowEndPlaceDropdown) {
			document.addEventListener('click', handleClickOutside);
		} else {
			// Remove the event listener when the calendar is hidden
			document.removeEventListener('click', handleClickOutside);
		}

		// Clean up the event listener on unmount
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	}, [isShowStartPlaceDropdown, isShowEndPlaceDropdown]);

	useEffect(() => {
		if (type === 'add') {
			axios
				.get(`${BE_BASE_URL}/city`)
				.then((res) => {
					if (res?.data) {
						setCities(res.data);
					}
				})
				.catch((error) => console.log(error));

			axios
				.get(`${BE_BASE_URL}/manager-coach/type`)
				.then((res) => {
					if (res?.data) {
						setTypeCoaches(res.data);
					}
				})
				.catch((error) => console.log(error));

			axios
				.get(`${BE_BASE_URL}/manager-coach/simple`, {
					params: {
						userId: user.id,
						typeCoachId: 2,
					},
				})
				.then((res) => {
					if (res?.data) {
						setVehicleNumbers(res.data);
					}
				})
				.catch((error) => console.log(error));
		}
	}, [type]);

	useEffect(() => {
		if (typeCoaches.length !== 0 && vehicleNumbers.length !== 0) {
			const newSchedule = {
				time: '',
				price: '',
				discount: 0,
				typeCoach: typeCoaches[0].id,
				coachId: vehicleNumbers[0].id,
			};

			setSchedules([newSchedule]);
		}
	}, [typeCoaches, vehicleNumbers]);

	const handleShowDropdown = (type) => {
		if (type === 'start') {
			if (isShowStartPlaceDropdown) {
				setIsShowStartPlaceDropdown(false);
			} else {
				setIsShowStartPlaceDropdown(true);
			}
		} else {
			if (isShowEndPlaceDropdown) {
				setIsShowEndPlaceDropdown(false);
			} else {
				setIsShowEndPlaceDropdown(true);
			}
		}
	};

	const startTimeChangeHandler = (e, indexToUpdate) => {
		setSchedules((prev) =>
			prev.map((schedule, index) =>
				index === indexToUpdate ? { ...schedule, time: e.target.value } : schedule,
			),
		);
	};

	const priceChangeHandler = (e, indexToUpdate) => {
		setSchedules((prev) =>
			prev.map((schedule, index) =>
				index === indexToUpdate ? { ...schedule, price: +e.target.value } : schedule,
			),
		);
	};

	const discountChangeHandler = (e, indexToUpdate) => {
		setSchedules((prev) =>
			prev.map((schedule, index) =>
				index === indexToUpdate ? { ...schedule, discount: +e.target.value } : schedule,
			),
		);
	};

	const typeCoachChangeHandler = (e, indexToUpdate) => {
		setSchedules((prev) =>
			prev.map((schedule, index) => {
					if (index === indexToUpdate) {
						const vehicleNumberIndex = vehicleNumbers.findIndex(
							item => item.type_id === +e.target.value,
						);

						return {
							...schedule,
							typeCoach: +e.target.value,
							coachId: vehicleNumbers[vehicleNumberIndex].id,
						};
					} else {
						return schedule;
					}
				},
			),
		);
	};

	const vehicleNumberChangeHandler = (e, indexToUpdate) => {
		setSchedules((prev) =>
			prev.map((schedule, index) =>
				index === indexToUpdate ? { ...schedule, coachId: +e.target.value } : schedule,
			),
		);
	};

	const extendTime = () => {
		const newSchedule = {
			time: '',
			price: '',
			discount: 0,
			typeCoach: typeCoaches[0].id,
			coachId: vehicleNumbers[0].id,
		};

		setSchedules(prev => [...prev, newSchedule]);
	};

	const removeTime = (indexToRemove) => {
		setSchedules((prevSchedules) =>
			prevSchedules.filter((_, index) => {
				return index !== indexToRemove;
			}),
		);
	};

	useEffect(() => {
		containRef?.current?.scrollTo({
			top: containRef?.current?.scrollHeight,
			behavior: 'smooth',
		});
	}, [schedules]);

	const addScheduleHandler = () => {
		axios.post(`${BE_BASE_URL}/manager-schedule`, {
			startPlaceId: +startPlace.id,
			endPlaceId: +endPlace.id,
			fromDate,
			toDate,
			scheduleTime: schedules,
			distance: +distance,
			duration: +duration,
		}).then(res => {
			if (res?.data?.message === 'success') {
				setToastList([
					...toastList,
					<ToastComponent
						type="success"
						content={'Thêm lịch trình thành công.'}
					/>,
				]);
			}
		}).catch(error => {
			console.log(error);
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
							onChangeManagerState('manager-schedule/view')
						}
					>
						Xem lịch trình
					</button>
					<button
						style={{
							backgroundColor:
								type === 'add' ? 'var(--primary-color)' : '#39a7ff',
						}}
						onClick={() => onChangeManagerState('manager-schedule/add')}
					>
						Thêm lịch trình
					</button>
					<button
						style={{
							backgroundColor:
								type === 'edit'
								? 'var(--primary-color)'
								: '#39a7ff',
						}}
						onClick={() =>
							onChangeManagerState('manager-schedule/edit')
						}
					>
						Sửa lịch trình
					</button>
				</div>
				{type === 'add' && <div className={cx('content')} ref={containRef}>
					<div className={cx('line', '--mt-0')}>
						<div className={cx('input-wrap')}>
						<span
							className={cx('label')}
							style={{
								color:
									isShowStartPlaceDropdown ||
									JSON.stringify(startPlace) !== '{}' &&
									'var(--blue-color)',
								top: !isShowStartPlaceDropdown &&
								     JSON.stringify(startPlace) === '{}' && '50%',
								transform:
									!isShowStartPlaceDropdown &&
									JSON.stringify(startPlace) === '{}' &&
									'translateY(-50%)',
								fontSize: !isShowStartPlaceDropdown &&
								          JSON.stringify(startPlace) === '{}' && '1.1rem',
							}}
						>
							Điểm đi
						</span>
							<div
								className={cx('input')}
								style={{
									borderColor:
										isShowStartPlaceDropdown &&
										'var(--blue-color)',
								}}
								onClick={() => handleShowDropdown('start')}
								ref={startPlaceInputRef}
							>
								{startPlace?.name ? startPlace.name : '---'}
							</div>
							{isShowStartPlaceDropdown && (
								<div className={cx('dropdown')}>
									{cities.map((city) => (
										<div
											key={city.id}
											className={cx('item')}
											onClick={() => setStartPlace(city)}
										>
											{city.name}
										</div>
									))}
								</div>
							)}
						</div>
						<div className={cx('input-wrap')}>
						<span
							className={cx('label')}
							style={{
								color:
									isShowEndPlaceDropdown ||
									JSON.stringify(endPlace) !== '{}' &&
									'var(--blue-color)',
								top: !isShowEndPlaceDropdown &&
								     JSON.stringify(endPlace) === '{}' && '50%',
								transform:
									!isShowEndPlaceDropdown &&
									JSON.stringify(endPlace) === '{}' &&
									'translateY(-50%)',
								fontSize: !isShowEndPlaceDropdown &&
								          JSON.stringify(endPlace) === '{}' && '1.1rem',
							}}
						>
							Điểm đến
						</span>
							<div
								className={cx('input')}
								style={{
									borderColor:
										isShowEndPlaceDropdown &&
										'var(--blue-color)',
								}}
								onClick={() => handleShowDropdown('end')}
								ref={endPlaceInputRef}
							>
								{endPlace?.name ? endPlace.name : '---'}
							</div>
							{isShowEndPlaceDropdown && (
								<div className={cx('dropdown')}>
									{cities.map((city) => (
										<div
											key={city.id}
											className={cx('item')}
											onClick={() => setEndPlace(city)}
										>
											{city.name}
										</div>
									))}
								</div>
							)}
						</div>
						<div className={cx('input-wrap')}>
							<label htmlFor="startDate">Từ ngày: </label>
							<input
								type="date"
								id="startDate"
								onChange={(e) => setFromDate(e.target.value)}
							/>
						</div>
						<div className={cx('input-wrap')}>
							<label htmlFor="startDate">Đến ngày: </label>
							<input
								type="date"
								id="startDate"
								onChange={(e) => setToDate(e.target.value)}
							/>
						</div>
					</div>
					<div className={cx('line')}>
						<div className={cx('heading')}>THÊM GIỜ KHỞI HÀNH</div>
					</div>
					<div className={cx('line', '--mt-0')}>
						{schedules?.map((schedule, index) => (
							<div
								className={cx('item')}
								key={index}
							>
								<div className={cx('input')}>
									<label
										htmlFor={`schedule-${index}-start-time`}
									>
										Giờ khởi hành:
									</label>
									<input
										type="time"
										id={`schedule-${index}-start-time`}
										defaultValue={schedules[index]?.time || ''}
										onChange={(e) =>
											startTimeChangeHandler(e, index)}
									/>
								</div>
								<div className={cx('input')}>
									<label
										htmlFor={`schedule-${index}-price`}
									>
										Giá vé:
									</label>
									<input
										type="number"
										id={`schedule-${index}-price`}
										defaultValue={schedules[index]?.price || null}
										onChange={(e) =>
											priceChangeHandler(e, index)}
									/>
									<label
										htmlFor={`schedule-${index}-price`}
									>
										đồng
									</label>
								</div>
								<div className={cx('input')}>
									<label
										htmlFor={`schedule-${index}-discount`}
									>
										Chiếc khấu:
									</label>
									<input
										type="number"
										id={`schedule-${index}-discount`}
										defaultValue={schedules[index]?.discount || 0}
										onChange={(e) =>
											discountChangeHandler(e, index)}
									/>
									<label
										htmlFor={`schedule-${index}-discount`}
									>
										%
									</label>
								</div>
								<div className={cx('input')}>
									<label
										htmlFor={`schedule-${index}-coach-type`}
									>
										Loại xe:
									</label>
									<select
										id={`schedule-${index}-coach-type`}
										onChange={(e) =>
											typeCoachChangeHandler(e, index)}
										value={schedules[index]?.typeCoach ||
										       typeCoaches[0]?.id}
									>
										{typeCoaches.map((typeCoach, index) =>
											<option value={typeCoach.id} key={index}
											>
												{typeCoach.name}
											</option>,
										)}
									</select>
								</div>
								<div className={cx('input')}>
									<label
										htmlFor={`schedule-${index}-vehicle-number`}
									>
										Số xe:
									</label>
									<select
										id={`schedule-${index}-vehicle-number`}
										value={schedules[index]?.coachId ||
										       vehicleNumbers[0]?.id}
										onChange={(e) =>
											vehicleNumberChangeHandler(e, index)}
									>
										{vehicleNumbers?.filter(vehicleNumber => {
											return schedule.typeCoach === vehicleNumber?.type_id;
										})?.map(
											(vehicleNumber, index) => (
												<option
													value={vehicleNumber?.id}
													key={index}
												>
													{vehicleNumber?.vehicle_number}
												</option>
											),
										)}
									</select>
								</div>
								<div className={cx('icon')}
								     onClick={() => extendTime()}
								>
									{plusIcon}
								</div>
								{index !== 0 &&
								 (
									 <div className={cx('icon', '--red-color')}
									      onClick={() => removeTime(index)}
									 >
										 {minusIcon}
									 </div>
								 )}
							</div>
						))}
					</div>
					<div className={cx('line')}>
						<div className={cx('input')}>
							<label htmlFor="distance">Khoảng cách:</label>
							<input type="number" id="distance" onChange={
								(e) => setDistance(e.target.value)}/>
							<label htmlFor="distance">km</label>
						</div>
						<div className={cx('input')}>
							<label htmlFor="duration">Thời gian di chuyển:</label>
							<input type="number" id="duration" onChange={
								(e) => setDuration(e.target.value)
							}/>
							<label htmlFor="duration">phút</label>
						</div>
						<button onClick={addScheduleHandler}>Thêm</button>
					</div>
				</div>}
			</div>
			<ToastContainerComponent
				toastList={toastList}
				setToastList={setToastList}
			/>
		</>
	);
};

export default ManagerSchedule;
