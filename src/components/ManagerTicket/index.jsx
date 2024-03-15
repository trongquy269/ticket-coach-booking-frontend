import { useDispatch } from 'react-redux';
import classNames from 'classnames/bind';

import styles from './ManagerTicket.module.scss';

const cx = classNames.bind(styles);

const ManagerTicket = ({ type }) => {
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
					Xem vé xe
				</button>
				<button
					style={{
						backgroundColor:
							type === 'add' ? 'var(--primary-color)' : '#39a7ff',
					}}
					onClick={() => onChangeManagerState('manager-garage/add')}
				>
					Thêm vé xe
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
					Sửa vé xe
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
					Xóa vé xe
				</button>
			</div>
			<div className={cx('content')}></div>
		</div>
	);
};

export default ManagerTicket;
