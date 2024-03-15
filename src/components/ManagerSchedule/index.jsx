import { useDispatch } from 'react-redux';
import classNames from 'classnames/bind';

import styles from './ManagerSchedule.module.scss';

const cx = classNames.bind(styles);

const ManagerSchedule = ({ type }) => {
	const dispatch = useDispatch();

	const onChangeManagerState = (newState) => {
		dispatch({ type: 'MANAGER/CHANGE_STATE', payload: newState });
	};

	return (
		<div className={cx('wrap')}>
			<div className={cx('navbar')}>
				<button
					style={{
						backgroundColor:
							type === 'view'
								? 'var(--primary-color)'
								: '#39a7ff',
					}}
					onClick={() => onChangeManagerState('manager-garage/view')}
				>
					Xem lịch trình
				</button>
				<button
					style={{
						backgroundColor:
							type === 'add' ? 'var(--primary-color)' : '#39a7ff',
					}}
					onClick={() => onChangeManagerState('manager-garage/add')}
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
					onClick={() => onChangeManagerState('manager-garage/edit')}
				>
					Sửa lịch trình
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
					Xóa lịch trình
				</button>
			</div>
			<div className={cx('content')}></div>
		</div>
	);
};

export default ManagerSchedule;
