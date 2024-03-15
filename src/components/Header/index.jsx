import { useState, useEffect } from 'react';
import classnames from 'classnames/bind';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router-dom';
import {
	faPhone,
	faArrowRightFromBracket,
	faKey,
} from '@fortawesome/free-solid-svg-icons';
import { faClock } from '@fortawesome/free-regular-svg-icons';
import ToastContainer from 'react-bootstrap/esm/ToastContainer';
import axios from 'axios';

import styles from './Header.module.scss';
import imageSrc from '/images/logo.png';
import Account from '../../views/Account';
import Overlay from '../Overlay';
import Notify from '../Notify';
import { bellIcon, bellAlertIcon } from '../../store/icons';
import ToastComponent from '../ToastComponent';
import ToastContainerComponent from '../ToastContainerComponent';
import { sortDescNumeric } from '../../store/actions';

const cx = classnames.bind(styles);
const BE_BASE_URL = import.meta.env.VITE_BE_BASE_URL;

const Header = () => {
	const [toastList, setToastList] = useState([]);
	const [toastContent, setToastContent] = useState('');
	const [toastType, setToastType] = useState('');
	const [toastUndo, setToastUndo] = useState(false);
	const [notifies, setNotifies] = useState([]);
	const [newNotifiesNumber, setNewNotifiesNumber] = useState(0);
	const [isShowNotify, setIsShowNotify] = useState(false);
	const [isHideNotify, setIsHideNotify] = useState(true);

	const dispatch = useDispatch();
	const navigate = useNavigate();

	const username = useSelector((state) => state.users.name);
	const userId = useSelector((state) => state.users.id);
	const isShowAccountForm = useSelector((state) => state.isShowAccountForm);

	const loginHandler = () => {
		if (username === '') {
			dispatch({ type: 'ACCOUNT_FORM/SHOW' });
		} else {
			navigate('/profile');
		}
	};

	const changePasswordHandler = () => {};

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

	useEffect(() => {
		axios
			.get(`${BE_BASE_URL}/notify`, {
				params: {
					userId,
				},
			})
			.then((res) => {
				if (res?.data?.length > 0) {
					setNotifies(sortDescNumeric(res.data, 'id'));
				}
			})
			.catch((err) => {
				console.log(err);
			});
	}, [userId]);

	useEffect(() => {
		if (notifies.length > 0) {
			const newNotifies = notifies.filter(
				(notify) => notify.isSeen === 0
			);
			setNewNotifiesNumber(newNotifies.length);
		}
	}, [notifies]);

	useEffect(() => {
		if (toastContent === '') return;

		setToastList([
			...toastList,
			<ToastComponent
				type={toastType}
				content={toastContent}
				undoBtn={() => setToastUndo(true)}
			/>,
		]);

		setToastContent('');
	}, [toastContent]);

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
								<div className={cx('item')}>
									<span>Phương Trang: 02838386852</span>
								</div>
								<div className={cx('item')}>
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
						{userId !== 0 && (
							<div
								className={cx('item', 'notify')}
								onMouseLeave={() => setIsHideNotify(true)}
								onMouseEnter={() => setIsHideNotify(false)}
								// data-attr={isHideNotify ? unset : ''}
							>
								<div
									className={cx('icon-bell')}
									data-attr={newNotifiesNumber || ''}
									style={{
										'--left-attr':
											`${newNotifiesNumber}`.length > 1
												? '23px'
												: '26px',
									}}
								>
									{bellIcon}
								</div>
								<Notify
									notifies={notifies}
									setNotifies={setNotifies}
									setToastList={setToastList}
									setToastContent={setToastContent}
									setToastType={setToastType}
									toastUndo={toastUndo}
									setToastUndo={setToastUndo}
									isHideNotify={isHideNotify}
									setIsHideNotify={setIsHideNotify}
								/>
							</div>
						)}
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
										onClick={changePasswordHandler}
									>
										<span>Đổi mật khẩu</span>
										<FontAwesomeIcon icon={faKey} />
									</div>
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
			<ToastContainerComponent
				toastList={toastList}
				setToastList={setToastList}
			/>
		</>
	);
};

export default Header;
