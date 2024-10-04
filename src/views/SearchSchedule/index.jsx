import { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';

import styles from './SearchSchedule.module.scss';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import {
	locationArrowIcon,
	rotateArrowIcon,
	searchIcon,
} from '../../store/icons/index';
import { createSlug } from '../../store/actions';

const cx = classNames.bind(styles);
const BE_BASE_URL = import.meta.env.VITE_BE_BASE_URL;

function SearchSchedule() {
	const [oriSchedules, setOriSchedules] = useState([]);
	const [schedules, setSchedules] = useState([]);
	const [startPlace, setStartPlace] = useState('');
	const [endPlace, setEndPlace] = useState('');

	const dispatch = useDispatch();
	const navigate = useNavigate();
	const location = useLocation();
	const [searchParams] = useSearchParams();

	const calculateTime = (minutes) => {
		const hour = Math.round(minutes / 60);
		const minute = minutes % 60;

		if (!minute) {
			return `${hour} giờ`;
		}

		return `${hour} giờ ${minute} phút`;
	};

	useEffect(() => {
		axios
			.get(`${BE_BASE_URL}/search/schedule`)
			.then((res) => {
				if (res?.data) {
					setOriSchedules(res.data);
					setSchedules(res.data);
				}
			})
			.catch((err) => console.error(err));

		return () => {
			setStartPlace('');
			setEndPlace('');
		};
	}, []);

	const reversePlace = () => {
		const temp = startPlace;
		setStartPlace(endPlace);
		setEndPlace(temp);
	};

	const finder = () => {
		const newSchedules = [];

		oriSchedules.forEach((group) => {
			const newGroup = group.filter((schedule) => {
				if (
					createSlug(schedule.start_city.toLowerCase()).includes(
						createSlug(startPlace.trim().toLowerCase())
					) &&
					createSlug(schedule.end_city.toLowerCase()).includes(
						createSlug(endPlace.trim().toLowerCase())
					)
				) {
					return schedule;
				}
			});

			if (newGroup.length > 0) {
				newSchedules.push(newGroup);
			}
		});

		if (
			newSchedules.length === 0 &&
			startPlace.trim() === '' &&
			endPlace.trim() === ''
		) {
			setSchedules(oriSchedules);
		} else {
			setSchedules(newSchedules);
		}
	};

	useEffect(() => {
		if (oriSchedules.length === 0) return;

		const timeout = setTimeout(() => {
			finder();
		}, 300);

		return () => {
			clearTimeout(timeout);
		};
	}, [startPlace, endPlace]);

	const findSchedule = (startPlaceId, endPlaceId) => {
		dispatch({ type: 'START_PLACE/CHANGE', payload: startPlaceId });
		dispatch({ type: 'END_PLACE/CHANGE', payload: endPlaceId });

		axios
			.get('http://localhost:3000/schedule', {
				params: {
					startPlace: startPlaceId,
					endPlace: endPlaceId,
					startDate: '',
				},
			})
			.then((res) => {
				if (res?.data?.length) {
					dispatch({ type: 'ROUTES/CHANGE', payload: res.data });
				}

				dispatch({ type: 'ROUTES/SHOW' });
				navigate('/home?show-route=true');
			})
			.catch((error) => console.log(error));
	};

	useEffect(() => {
		if (oriSchedules.length > 0) {
			const searchParam = searchParams.get('end');
			if (searchParam) {
				setEndPlace(searchParam.replace(/-/g, ' '));
			}
		}
	}, [oriSchedules]);

	return (
		<div className={cx('wrap')}>
			<Header hideNav={false} />
			<div className={cx('main')}>
				<div className={cx('search')}>
					<div className={cx('search-input')}>
						<div className={cx('magnify-icon')}>{searchIcon}</div>
						<input
							className={cx('input')}
							type='text'
							placeholder='Nhập điểm đi'
							onChange={(e) => setStartPlace(e.target.value)}
							value={startPlace}
						/>
					</div>
					<div
						className={cx('search-icon')}
						onClick={reversePlace}
					>
						{rotateArrowIcon}
					</div>
					<div className={cx('search-input')}>
						<div className={cx('magnify-icon')}>{searchIcon}</div>
						<input
							className={cx('input')}
							type='text'
							placeholder='Nhập điểm đến'
							onChange={(e) => setEndPlace(e.target.value)}
							value={endPlace}
						/>
					</div>
				</div>
				<div className={cx('group', 'no-border')}>
					<div className={cx('row', 'heading')}>
						<div className={cx('col')}>Tuyến xe</div>
						<div className={cx('col')}>Quảng đường</div>
						<div className={cx('col')}>Thời gian hành trình</div>
					</div>
				</div>
				{schedules.length > 0 &&
					schedules.map((schedule, index) => (
						<div
							className={cx('group')}
							key={index}
						>
							{schedule.map((group, _index) => (
								<div
									className={cx('row')}
									key={_index}
								>
									<div className={cx('col')}>
										<div className={cx('--red')}>
											{group.start_city}
										</div>
										<div className={cx('arrive-icon')}>
											{locationArrowIcon}
										</div>
										<div>{group.end_city}</div>
									</div>
									<div className={cx('col')}>
										{group.distance}km
									</div>
									<div className={cx('col')}>
										{calculateTime(group.duration)}
									</div>
									<button
										className={cx('col', 'button')}
										onClick={() =>
											findSchedule(
												group.start_city_id,
												group.end_city_id
											)
										}
									>
										Tìm chuyến xe
									</button>
								</div>
							))}
						</div>
					))}
				{schedules.length === 0 && (
					<div className={cx('not-found')}>
						Không tìm thấy lịch trình
					</div>
				)}
			</div>
			<Footer />
		</div>
	);
}

export default SearchSchedule;
