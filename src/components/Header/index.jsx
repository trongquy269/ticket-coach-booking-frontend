import classnames from 'classnames/bind';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faPhone,
	faArrowRightFromBracket,
} from '@fortawesome/free-solid-svg-icons';
import { faClock } from '@fortawesome/free-regular-svg-icons';
import { useNavigate } from 'react-router-dom';

import styles from './Header.module.scss';
import imageSrc from '/images/logo.png';
import Account from '../../views/Account';
import Overlay from '../Overlay';

const cx = classnames.bind(styles);

const Header = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const username = useSelector((state) => state.users.name);
	const isShowAccountForm = useSelector((state) => state.isShowAccountForm);

	const loginHandler = () => {
		if (username === '') {
			dispatch({ type: 'ACCOUNT_FORM/SHOW' });
		}
	};

	const logoutHandler = () => {
		dispatch({ type: 'LOGOUT' });
	};

	const gotoMySchedule = () => {
		if (username !== '') {
			navigate('/my-schedule');
		} else {
			dispatch({ type: 'ACCOUNT_FORM/SHOW' });
		}
	};

	return (
		<>
			<div className={cx('background')}>
				<div className={cx('wrap')}>
					<img
						src={imageSrc}
						alt='logo'
						className={cx('logo')}
						onClick={() => {
							navigate('/');
						}}
					/>
					<div className={cx('button')}>
						<div className={cx('item')}>
							<button>
								<FontAwesomeIcon icon={faPhone} />
								<span>Hotline</span>
							</button>
							<div className={cx('option')}>
								<div
									className={cx('item')}
									onClick={logoutHandler}
								>
									<span>Phương Trang: 02838386852</span>
								</div>
								<div
									className={cx('item')}
									onClick={logoutHandler}
								>
									<span>Thành Bưởi: 0918919189</span>
								</div>
							</div>
						</div>
						<div
							className={cx('item')}
							onClick={gotoMySchedule}
						>
							<button>
								<FontAwesomeIcon icon={faClock} />
								<span>Lịch trình của bạn</span>
							</button>
						</div>
						<div className={cx('item')}>
							<button
								className={cx('color')}
								onClick={loginHandler}
							>
								{username !== ''
									? `Hi, ${username}`
									: 'Đăng nhập'}
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
			</div>
			<div>
				{isShowAccountForm && <Account />}
				{isShowAccountForm && <Overlay />}
			</div>
		</>
	);
};

export default Header;
