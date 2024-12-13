import { useState, useEffect, useRef } from 'react';
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
	faUser, faKey,
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

import styles from './Manager.module.scss';
import ManagerStatistic from '../../components/ManagerStatistic';
import ManagerGarage from '../../components/ManagerGarage';
import ManagerSchedule from '../../components/ManagerSchedule';
import ManagerTicket from '../../components/ManagerTicket';
import ManagerUser from '../../components/ManagerUser';
import ManagerCoach from '../../components/ManagerCoach';
import Overlay from '../../components/Overlay';
import { closeIcon } from '../../store/icons';
import { convertYYYYMMDDToDDMMYYYY } from '../../store/actions';

const cx = classnames.bind(styles);
const BE_BASE_URL = import.meta.env.VITE_BE_BASE_URL;

const Manager = () => {
	const [hideMenu, setHideMenu] = useState('232px');
	const [resultHeight, setResultHeight] = useState('0px');
	const [typeSearch, setTypeSearch] = useState('customer');
	const [searchData, setSearchData] = useState('');
	const [isShowResultSearchEmpty, setIsShowResultSearchEmpty] =
		useState(false);
	const [orderItemSelect, setOrderItemSelect] = useState(0);
	const [resultSearched, setResultSearched] = useState([]);
	const [suggestSearching, setSuggestSearching] = useState([]);

	const searchInputRef = useRef(null);

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
		navigate('/');
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

	const searchHandler = async (data) => {
		if (data === '') {
			return;
		}

		setIsShowResultSearchEmpty(false);

		if (data === ':k') {
			setTypeSearch('customer');
			searchInputRef.current.value = '';
			setResultSearched([]);
			setSearchData('');
		} else if (data === ':l') {
			setTypeSearch('schedule');
			searchInputRef.current.value = '';
			setResultSearched([]);
			setSearchData('');
		} else if (data === ':v') {
			setTypeSearch('ticket');
			searchInputRef.current.value = '';
			setResultSearched([]);
			setSearchData('');
		} else if (data === ':x') {
			setTypeSearch('coach');
			searchInputRef.current.value = '';
			setResultSearched([]);
			setSearchData('');
		} else if (data === ':n') {
			setTypeSearch('garage');
			searchInputRef.current.value = '';
			setResultSearched([]);
			setSearchData('');
		} else {
			await axios
				.get(`${BE_BASE_URL}/search`, {
					params: {
						searchData: searchInputRef.current.value,
						typeSearch,
					},
				})
				.then((res) => {
					if (res?.data?.length > 0) {
						setResultSearched([...res.data]);
						setSuggestSearching([]);
					} else {
						setIsShowResultSearchEmpty(true);
					}
				})
				.catch((err) => console.log(err));
		}
	};

	const searchKeyDown = (event) => {
		if (event.key === 'Enter') {
			if (resultSearched.length === 0) {
				searchHandler(event.target.value.trim());
			} else {
				const id = resultSearched[orderItemSelect - 1].id;
				gotoResultSearched(id);
			}
			setOrderItemSelect(0);
		} else if (event.key === 'ArrowDown') {
			event.preventDefault();

			if (resultSearched.length === 0 && suggestSearching.length === 0) {
				if (orderItemSelect < 5) {
					setOrderItemSelect(orderItemSelect + 1);
				} else if (orderItemSelect === 5) {
					setOrderItemSelect(1);
				}
			} else if (resultSearched.length > 0) {
				if (orderItemSelect < resultSearched.length) {
					setOrderItemSelect(orderItemSelect + 1);
				} else if (orderItemSelect === resultSearched.length) {
					setOrderItemSelect(1);
				}
			} else if (suggestSearching.length > 0) {
				if (orderItemSelect < suggestSearching.length) {
					setOrderItemSelect(orderItemSelect + 1);
				} else if (orderItemSelect === suggestSearching.length) {
					setOrderItemSelect(1);
				}
			}
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();

			if (resultSearched.length === 0 && suggestSearching.length === 0) {
				if (orderItemSelect > 1) {
					setOrderItemSelect(orderItemSelect - 1);
				} else if (orderItemSelect >= 0) {
					setOrderItemSelect(5);
				}
			} else if (resultSearched.length > 0) {
				if (orderItemSelect > 1) {
					setOrderItemSelect(orderItemSelect - 1);
				} else if (orderItemSelect === 1) {
					setOrderItemSelect(resultSearched.length);
				}
			} else if (suggestSearching.length > 0) {
				if (orderItemSelect > 1) {
					setOrderItemSelect(orderItemSelect - 1);
				} else {
					setOrderItemSelect(suggestSearching.length);
				}
			}
		} else if (event.key === 'Escape') {
			event.preventDefault();
			searchInputRef.current.blur();
			setOrderItemSelect(0);
		} else {
			setOrderItemSelect(0);
		}
	};

	useEffect(() => {
		if (resultSearched.length === 0 && suggestSearching.length === 0) {
			switch (orderItemSelect) {
				case 1:
					searchInputRef.current.value = ':k';
					break;
				case 2:
					searchInputRef.current.value = ':l';
					break;
				case 3:
					searchInputRef.current.value = ':v';
					break;
				case 4:
					searchInputRef.current.value = ':x';
					break;
				case 5:
					searchInputRef.current.value = ':n';
					break;
			}
		} else if (resultSearched.length > 0) {
		} else if (suggestSearching.length > 0) {
			const newOrderItemSelect =
				orderItemSelect === 0 ? 1 : orderItemSelect;

			if (typeSearch === 'customer') {
				searchInputRef.current.value =
					suggestSearching[newOrderItemSelect - 1].data.split('-')[1];
			} else if (typeSearch === 'ticket') {
				searchInputRef.current.value =
					suggestSearching[newOrderItemSelect - 1].id;
			}
		}
	}, [orderItemSelect]);

	useEffect(() => {
		setResultSearched([]);

		if (isShowResultSearchEmpty && searchData.length === 0) {
			setIsShowResultSearchEmpty(false);
		}

		if (searchData.length > 0) {
			if (orderItemSelect === 0) {
				// Debounce timeout
				const getData = setTimeout(() => {
					axios
						.get(`${BE_BASE_URL}/typing-search`, {
							params: {
								searchData,
								typeSearch,
							},
						})
						.then((res) => {
							if (res?.data) {
								setSuggestSearching([...res.data]);
							}
						})
						.catch((err) => console.log(err));
				}, 500);

				return () => {
					clearTimeout(getData);
				};
			}
		} else {
			setSuggestSearching([]);
		}
	}, [searchData]);

	useEffect(() => {
		if (resultHeight === '0px') {
			setOrderItemSelect(0);
			setSuggestSearching([]);
			setResultSearched([]);
		}
	}, [resultHeight]);

	useEffect(() => {
		const handleKeyDown = (event) => {
			if (event.ctrlKey && (
				event.key === 'r' || event.key === 'R'
			)) {
				event.preventDefault();
				searchInputRef.current.focus();
			}
		};

		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, []);

	const gotoResultSearched = (id) => {
		const payload = { id, type: typeSearch };
		dispatch({ type: 'SEARCH/SET', payload });

		if (typeSearch === 'customer') {
			onChangeManagerState('manager-user/view');
		} else if (typeSearch === 'schedule') {
			onChangeManagerState('manager-schedule/view');
		} else if (typeSearch === 'ticket') {
			onChangeManagerState('manager-ticket/view');
		} else if (typeSearch === 'coach') {
			onChangeManagerState('manager-coach/view');
		} else if (typeSearch === 'garage') {
			onChangeManagerState('manager-garage/view');
		}

		setResultHeight('0px');
		searchInputRef.current.value = '';
		setSearchData('');
	};

	const changePasswordHandler = () => {
	};

	return (
		<div className={cx('wrap')}>
			<div className={cx('header')}>
				<img
					src="/images/logo.png"
					alt="logo"
					className={cx('logo')}
					onClick={() => {
						navigate('/');
					}}
				/>
				<div
					className={cx('search')}
					style={{
						border:
							resultHeight === '0px'
							? '1px solid var(--border-color)'
							: 'none',
					}}
				>
					<FontAwesomeIcon
						icon={faMagnifyingGlass}
						className={cx('icon')}
					/>
					<div className={cx('type')}>
						{typeSearch === 'customer'
						 ? 'Khách hàng'
						 : typeSearch === 'schedule'
						   ? 'Lịch trình'
						   : typeSearch === 'ticket'
						     ? 'Vé xe'
						     : typeSearch === 'coach'
						       ? 'Xe'
						       : 'Nhà xe'}
						<ul>
							{!(
								typeSearch === 'customer'
							) && (
								 <li onClick={() => setTypeSearch('customer')}>
									 Khách hàng
								 </li>
							 )}
							{!(
								typeSearch === 'schedule'
							) && (
								 <li onClick={() => setTypeSearch('schedule')}>
									 Lịch trình
								 </li>
							 )}
							{!(
								typeSearch === 'ticket'
							) && (
								 <li onClick={() => setTypeSearch('ticket')}>
									 Vé xe
								 </li>
							 )}
							{!(
								typeSearch === 'coach'
							) && (
								 <li onClick={() => setTypeSearch('coach')}>
									 Xe
								 </li>
							 )}
							{!(
								typeSearch === 'garage'
							) && (
								 <li onClick={() => setTypeSearch('garage')}>
									 Nhà xe
								 </li>
							 )}
						</ul>
					</div>
					<input
						type="text"
						placeholder="Tìm kiếm..."
						onFocus={() => setResultHeight('500px')}
						onBlur={() => setResultHeight('0px')}
						onKeyDown={(e) => searchKeyDown(e)}
						ref={searchInputRef}
						onChange={(e) => setSearchData(e.target.value)}
						value={undefined}
					/>
					{searchData !== '' && (
						<button
							className={cx('clear-input-btn')}
							onClick={() => {
								searchInputRef.current.value = '';
								searchInputRef.current.focus();
								setSearchData('');
							}}
						>
							{closeIcon}
						</button>
					)}
					<button
						className={cx('search-btn')}
						onClick={() => searchHandler(searchData.trim())}
					>
						Tìm kiếm
					</button>
					<div
						className={cx('result')}
						style={{ maxHeight: resultHeight }}
					>
						{!isShowResultSearchEmpty &&
						 (
							 (
								 resultSearched.length > 0 &&
								 suggestSearching.length > 0
							 ) ||
							 resultSearched.length === 0
						 ) && (
							 <div className={cx('result-tag')}>Gợi ý</div>
						 )}
						{!isShowResultSearchEmpty &&
						 suggestSearching.length === 0 &&
						 resultSearched.length === 0 && (
							 <div>
								 <div
									 className={cx(
										 'sample',
                         orderItemSelect === 1 && 'selected',
									 )}
									 onClick={() => {
										 setTypeSearch('customer');
										 setSearchData('');
									 }}
								 >
									 <span>:k</span> hoặc <span>:K</span> tìm
									 kiếm trong khách hàng
								 </div>
								 <div
									 className={cx(
										 'sample',
                         orderItemSelect === 2 && 'selected',
									 )}
									 onClick={() => {
										 setTypeSearch('schedule');
										 setSearchData('');
									 }}
								 >
									 <span>:l</span> hoặc <span>:L</span> tìm
									 kiếm trong lịch trình
								 </div>
								 <div
									 className={cx(
										 'sample',
                         orderItemSelect === 3 && 'selected',
									 )}
									 onClick={() => {
										 setTypeSearch('ticket');
										 setSearchData('');
									 }}
								 >
									 <span>:v</span> hoặc <span>:v</span> tìm
									 kiếm trong vé xe
								 </div>
								 <div
									 className={cx(
										 'sample',
                         orderItemSelect === 4 && 'selected',
									 )}
									 onClick={() => {
										 setTypeSearch('coach');
										 setSearchData('');
									 }}
								 >
									 <span>:x</span> hoặc <span>:x</span> tìm
									 kiếm trong xe
								 </div>
								 <div
									 className={cx(
										 'sample',
                         orderItemSelect === 5 && 'selected',
									 )}
									 onClick={() => {
										 setTypeSearch('garage');
										 setSearchData('');
									 }}
								 >
									 <span>:n</span> hoặc <span>:n</span> tìm
									 kiếm trong nhà xe
								 </div>
							 </div>
						 )}
						{suggestSearching.length > 0 &&
						 suggestSearching.map((item, index) => (
							 <div
								 className={cx(
									 'sample',
                         orderItemSelect === index + 1 &&
                         'selected',
								 )}
								 onClick={() => searchHandler(item)}
								 key={index}
							 >
								 {typeSearch === 'customer' &&
								  (
									  item.data.split('-')[0] === 'phone' ? (
										  <>
											  <span>Số điện thoại: </span>
											  <span className={cx('active')}>
													{searchData}
												</span>
											  {item.data
											       .split('-')[1]
												  .substring(
													  item.data
													      .split('-')[1]
														  .indexOf(
															  searchData,
														  ) +
													  searchData.length,
												  )}
										  </>
									  ) : item.data.split('-')[0] ===
									      'email' ? (
										      <>
											      <span>email: </span>
											      <span className={cx('active')}>
													{searchData}
												</span>
											      {item.data
											           .split('-')[1]
												      .substring(
													      item.data
													          .split('-')[1]
														      .indexOf(
															      searchData,
														      ) +
													      searchData.length,
												      )}
										      </>
									      ) : (
										      <>
											      <span>CCCD: </span>
											      <span className={cx('active')}>
													{searchData}
												</span>
											      {item.data
											           .split('-')[1]
												      .substring(
													      item.data
													          .split('-')[1]
														      .indexOf(
															      searchData,
														      ) +
													      searchData.length,
												      )}
										      </>
									      )
								  )}
								 {typeSearch === 'ticket' && (
									 <>
										 <span>Ticket ID: </span>
										 <span className={cx('active')}>
												{searchData}
											</span>
										 {item.id
										      .toString()
										      .substring(
											      item.id
											          .toString()
											          .indexOf(searchData) +
											      searchData.length,
										      )}
									 </>
								 )}
							 </div>
						 ))}
						{isShowResultSearchEmpty && (
							<div className={cx('notify')}>
								Không tìm thấy kết quả
							</div>
						)}
						{!isShowResultSearchEmpty &&
						 resultSearched.length > 0 && (
							 <div className={cx('result-tag')}>Kết quả</div>
						 )}
						{resultSearched.length > 0 &&
						 resultSearched.map((item, index) => (
							 <div
								 className={cx(
									 'item',
                         orderItemSelect === index + 1 &&
                         'selected',
								 )}
								 key={index}
								 onClick={() => gotoResultSearched(item.id)}
							 >
								 {typeSearch === 'customer' && (
									 <>
										 <div>
											 <span>Tên: </span>
											 {item.name}
											 {', '}
										 </div>
										 <div>
											 <span>Giới tính: </span>
											 {item.gender}
											 {', '}
										 </div>
										 <div>
											 <span>Ngày sinh: </span>
											 {convertYYYYMMDDToDDMMYYYY(
												 item.date_of_birth,
											 )}
											 {', '}
										 </div>
										 <div>
											 <span>CCCD: </span>
											 {item.citizen_identification}
											 {', '}
										 </div>
										 <div>
											 <span>Số điện thoại: </span>
											 {item.phone}
											 {', '}
										 </div>
										 <div>
											 <span>email: </span>
											 {item.email}
											 {', '}
										 </div>
									 </>
								 )}
								 {typeSearch === 'ticket' && (
									 <>
										 <div>
											 <span>Ticket ID: </span>
											 {item.id}
											 {', '}
										 </div>
										 <div>
											 <span>Tên khách hàng: </span>
											 {item.name}
											 {', '}
										 </div>
										 <div>
												<span>
													Số điện thoại khách hàng:{' '}
												</span>
											 {item.phone}
										 </div>
									 </>
								 )}
							 </div>
						 ))}
					</div>
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
									onClick={changePasswordHandler}
								>
									<span>Đổi mật khẩu</span>
									<FontAwesomeIcon icon={faKey}/>
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
							managerState.split('/')[0] ===
							'manager-statistic' && 'active',
						)}
						onClick={() =>
							onChangeManagerState('manager-statistic/chart')
						}
					>
						<span
							className={cx('label')}
							style={{ width: hideMenu }}
						>
							Thống kê
						</span>
						<FontAwesomeIcon
							icon={faHouseFlag}
							className={cx('icon')}
						/>
					</div>
					<div
						className={cx(
							'item',
							managerState.split('/')[0] === 'manager-garage' &&
							'active',
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
							'active',
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
							'active',
						)}
						onClick={() =>
							onChangeManagerState('manager-ticket/add')
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
							'active',
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
							'active',
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
					{managerState.split('/')[0] === 'manager-statistic' && (
						<ManagerStatistic type={managerState.split('/')[1]}/>
					)}
					{managerState.split('/')[0] === 'manager-garage' && (
						<ManagerGarage type={managerState.split('/')[1]}/>
					)}
					{managerState.split('/')[0] === 'manager-schedule' && (
						<ManagerSchedule type={managerState.split('/')[1]}/>
					)}
					{managerState.split('/')[0] === 'manager-ticket' && (
						<ManagerTicket type={managerState.split('/')[1]}/>
					)}
					{managerState.split('/')[0] === 'manager-user' && (
						<ManagerUser type={managerState.split('/')[1]}/>
					)}
					{managerState.split('/')[0] === 'manager-coach' && (
						<ManagerCoach type={managerState.split('/')[1]}/>
					)}
				</div>
			</div>

			{resultHeight !== '0px' && <Overlay/>}
		</div>
	);
};

export default Manager;
