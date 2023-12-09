import { useState } from 'react';
import classnames from 'classnames/bind';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faArrowRightFromBracket,
	faMagnifyingGlass,
	faBarsProgress,
	faHouseFlag,
	faVanShuttle,
	faCalendarDays,
	faTicket,
	faUser,
} from '@fortawesome/free-solid-svg-icons';

import styles from './Manager.module.scss';
import ManagerGarage from '../../components/ManagerGarage';
import ManagerSchedule from '../../components/ManagerSchedule';
import ManagerTicket from '../../components/ManagerTicket';
import ManagerUser from '../../components/ManagerUser';
import ManagerCoach from '../../components/ManagerCoach';

const cx = classnames.bind(styles);

const Manager = () => {
	const [hideMenu, setHideMenu] = useState('232px');

	const dispatch = useDispatch();
	const navigate = useNavigate();

	const username = useSelector((state) => state.users.name);
	const managerState = useSelector((state) => state.managerState);

	const loginHandler = () => {
		if (username === '') {
			dispatch({ type: 'ACCOUNT_FORM/SHOW' });
		}
	};

	const logoutHandler = () => {
		dispatch({ type: 'LOGOUT' });
	};

	const onHideMenu = () => {
		if (hideMenu === '232px') {
			setHideMenu('0');
		} else {
			setHideMenu('232px');
		}
	};

	const onChangeManagerState = (newState) => {
		dispatch({ type: 'MANAGER/CHANGE_STATE', payload: newState });
	};

	return (
		<div className={cx('wrap')}>
			<div className={cx('header')}>
				<img
					src='/images/logo.png'
					alt='logo'
					className={cx('logo')}
					onClick={() => {
						navigate('/');
					}}
				/>
				<div className={cx('search')}>
					<FontAwesomeIcon
						icon={faMagnifyingGlass}
						className={cx('icon')}
					/>
					<input
						type='text'
						placeholder='Tìm kiếm...'
					/>
					<button className={cx('search-btn')}>Tìm kiếm</button>
				</div>

				<div className={cx('button')}>
					<div
						className={cx('item')}
						onClick={onHideMenu}
					>
						<button className={cx('color')}>
							{hideMenu === '232px' ? 'Ẩn menu' : 'Hiện menu'}
						</button>
					</div>
					<div className={cx('item')}>
						<button
							className={cx('color')}
							onClick={loginHandler}
						>
							{username !== '' ? `Hi, ${username}` : 'Đăng nhập'}
						</button>
						{username !== '' && (
							<div className={cx('option')}>
								<div
									className={cx('item')}
									onClick={logoutHandler}
								>
									<span>Đăng xuất</span>
									<FontAwesomeIcon
										icon={faArrowRightFromBracket}
									/>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
			<div className={cx('main')}>
				<div className={cx('navbar')}>
					<div className={cx('title')}>
						<span
							className={cx('label')}
							style={{ width: hideMenu }}
						>
							Quản lý
						</span>
						<FontAwesomeIcon
							icon={faBarsProgress}
							className={cx('icon')}
						/>
					</div>
					<div
						className={cx(
							'item',
							managerState.split('/')[0] === 'manager-garage' &&
								'active'
						)}
						onClick={() =>
							onChangeManagerState('manager-garage/view')
						}
					>
						<span
							className={cx('label')}
							style={{ width: hideMenu }}
						>
							Quản lý Nhà xe
						</span>
						<FontAwesomeIcon
							icon={faHouseFlag}
							className={cx('icon')}
						/>
					</div>
					<div
						className={cx(
							'item',
							managerState.split('/')[0] === 'manager-schedule' &&
								'active'
						)}
						onClick={() =>
							onChangeManagerState('manager-schedule/view')
						}
					>
						<span
							className={cx('label')}
							style={{ width: hideMenu }}
						>
							Quản lý Lịch trình
						</span>
						<FontAwesomeIcon
							icon={faCalendarDays}
							className={cx('icon')}
						/>
					</div>
					<div
						className={cx(
							'item',
							managerState.split('/')[0] === 'manager-ticket' &&
								'active'
						)}
						onClick={() =>
							onChangeManagerState('manager-ticket/view')
						}
					>
						<span
							className={cx('label')}
							style={{ width: hideMenu }}
						>
							Quản lý Vé xe
						</span>
						<FontAwesomeIcon
							icon={faTicket}
							className={cx('icon')}
						/>
					</div>
					<div
						className={cx(
							'item',
							managerState.split('/')[0] === 'manager-user' &&
								'active'
						)}
						onClick={() =>
							onChangeManagerState('manager-user/view')
						}
					>
						<span
							className={cx('label')}
							style={{ width: hideMenu }}
						>
							Quản lý Khách hàng
						</span>
						<FontAwesomeIcon
							icon={faUser}
							className={cx('icon')}
						/>
					</div>
					<div
						className={cx(
							'item',
							managerState.split('/')[0] === 'manager-coach' &&
								'active'
						)}
						onClick={() =>
							onChangeManagerState('manager-coach/view')
						}
					>
						<span
							className={cx('label')}
							style={{ width: hideMenu }}
						>
							Quản lý Xe
						</span>
						<FontAwesomeIcon
							icon={faVanShuttle}
							className={cx('icon')}
						/>
					</div>
				</div>
				<div className={cx('content')}>
					{managerState.split('/')[0] === 'manager-garage' && (
						<ManagerGarage type={managerState.split('/')[1]} />
					)}
					{managerState.split('/')[0] === 'manager-schedule' && (
						<ManagerSchedule type={managerState.split('/')[1]} />
					)}
					{managerState.split('/')[0] === 'manager-ticket' && (
						<ManagerTicket type={managerState.split('/')[1]} />
					)}
					{managerState.split('/')[0] === 'manager-user' && (
						<ManagerUser type={managerState.split('/')[1]} />
					)}
					{managerState.split('/')[0] === 'manager-coach' && (
						<ManagerCoach type={managerState.split('/')[1]} />
					)}
				</div>
			</div>
		</div>
	);
};

export default Manager;
