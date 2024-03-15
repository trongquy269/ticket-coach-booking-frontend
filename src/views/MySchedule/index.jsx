import { useState, useEffect } from 'react';
import classnames from 'classnames/bind';
import { useSelector } from 'react-redux';
import axios from 'axios';

import styles from './MySchedule.module.scss';
import Ticket from '../../components/Ticket';
import Header from '../../components/Header';

const cx = classnames.bind(styles);

const MySchedule = () => {
	const [tickets, setTickets] = useState([]);

	const user = useSelector((state) => state.users);

	useEffect(() => {
		if (!user.id) return;

		axios
			.get('http://localhost:3000/my-schedule', {
				params: {
					userId: user.id,
				},
			})
			.then((res) => {
				if (res?.data) {
					setTickets([...res.data]);
				}
			})
			.catch((err) => console.log(err));
	}, []);

	return (
		<div className={cx('wrap')}>
			<Header />
			<div className={cx('empty')}></div>
			<div className={cx('main')}>
				{tickets.length !== 0 &&
					tickets.map((ticket, index) => (
						<Ticket
							key={index}
							scheduleId={ticket.schedule_id}
							seat={ticket.seat.split(',')}
							payments={ticket.payment}
							onclick={true}
						/>
					))}
			</div>
		</div>
	);
};

export default MySchedule;
