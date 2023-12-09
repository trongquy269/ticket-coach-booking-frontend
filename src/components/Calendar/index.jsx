import { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';

import styles from './Calendar.module.scss';

const cx = classNames.bind(styles);

const Calendar = ({ setStartDate }) => {
	const [currentDate, setCurrentDate] = useState(new Date());
	const [monthData, setMonthData] = useState([]);

	const getDateTitle = (time) => {
		let day = '';
		const date = time.getDate();
		const month = time.getMonth() + 1;
		const year = time.getFullYear();

		if (time.getDay() === 8) {
			day = 'CN';
		} else {
			day = `T${time.getDay()}`;
		}

		return `${day}, ${date} Th${month} ${year}`;
	};

	const previousMonth = (event) => {
		event.stopPropagation();

		const newDate = new Date(currentDate);
		newDate.setMonth(newDate.getMonth() - 1);
		setCurrentDate(newDate);
	};

	const nextMonth = (event) => {
		event.stopPropagation();

		const newDate = new Date(currentDate);
		newDate.setMonth(newDate.getMonth() + 1);
		setCurrentDate(newDate);
	};

	const getLastDayOfMonth = () => {
		const lastDay = new Date(
			currentDate.getFullYear(),
			currentDate.getMonth() + 1,
			0
		);
		return lastDay.getDate();
	};

	const getMonthData = () => {
		const year = currentDate.getFullYear();
		const month = currentDate.getMonth();
		const firstDay = new Date(year, month, 1);
		const lastDay = getLastDayOfMonth();
		const firstDayOfWeek = firstDay.getDay();
		const monthData = [];

		let day = 1;
		for (let i = 0; i < 6; i++) {
			const week = [];
			for (let j = 0; j < 7; j++) {
				if (i === 0 && j < firstDayOfWeek) {
					week.push(null);
				} else if (day > lastDay) {
					week.push(null);
				} else {
					week.push(day);
					day++;
				}
			}
			monthData.push(week);
			if (day > lastDay) break;
		}

		return monthData;
	};

	const handle = (day) => {
		if (day === null) return;
		if (currentDate.getFullYear() < new Date().getFullYear()) return;
		if (currentDate.getMonth() < new Date().getMonth()) return;
		if (
			currentDate.getMonth() === new Date().getMonth() &&
			day < new Date().getDate()
		)
			return;

		setStartDate(
			`${day}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`
		);
		return;
	};

	useEffect(() => {
		setMonthData(getMonthData());
	}, [currentDate]);

	return (
		<div className={cx('wrap')}>
			<div className={cx('heading')}>
				<FontAwesomeIcon
					className={cx('icon')}
					icon={faAngleLeft}
					onClick={previousMonth}
				/>
				<div className={cx('title')}>{getDateTitle(currentDate)}</div>
				<FontAwesomeIcon
					className={cx('icon')}
					icon={faAngleRight}
					onClick={nextMonth}
				/>
			</div>
			<table>
				<thead>
					<tr>
						<th>T2</th>
						<th>T3</th>
						<th>T4</th>
						<th>T5</th>
						<th>T6</th>
						<th>T7</th>
						<th>CN</th>
					</tr>
				</thead>
				<tbody>
					{monthData.map((week, index) => (
						<tr key={index}>
							{week.map((day, dayIndex) => (
								<td
									key={dayIndex}
									className={
										(!day && cx('null')) ||
										(currentDate.getFullYear() <
											new Date().getFullYear() ||
										(currentDate.getFullYear() ===
											new Date().getFullYear() &&
											currentDate.getMonth() <
												new Date().getMonth()) ||
										(currentDate.getMonth() ===
											new Date().getMonth() &&
											day < new Date().getDate())
											? cx('disable')
											: '')
									}
									onClick={() => handle(day)}
								>
									{day !== null ? day : ''}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default Calendar;
