import { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import { useNavigate } from 'react-router-dom';

import styles from './Navbar.module.scss';

const cx = classNames.bind(styles);
const navList = [
	{
		title: 'TRANG CHỦ',
		url: '/',
	},
	{
		title: 'LỊCH TRÌNH',
		url: '/search/schedule',
	},
	{
		title: 'TRA CỨU VÉ',
		url: '/search/ticket',
	},
	{
		title: 'TIN TỨC',
		url: '/news',
	},
];

function Navbar() {
	const [currentItem, setCurrentItem] = useState(1);

	const navigate = useNavigate();

	const changePageHandler = (index, url) => {
		setCurrentItem(index);
		navigate(url);
	};

	useEffect(() => {
		const url = window.location.href;

		for (let i = 1; i < navList.length; i++) {
			if (url.includes(navList[i].url)) {
				setCurrentItem(i + 1);
				return;
			}
		}
	}, []);

	return (
		<div className={cx('wrap')}>
			<ul className={cx('list')}>
				{navList.map((navItem, index) => (
					<li
						key={index}
						className={cx(
							'item',
							currentItem === index + 1 && 'active'
						)}
					>
						<button
							className={cx('btn')}
							onClick={() =>
								changePageHandler(index + 1, navItem.url)
							}
						>
							{navItem.title}
						</button>
						<div className={cx('mark')}></div>
					</li>
				))}
			</ul>
		</div>
	);
}

export default Navbar;
