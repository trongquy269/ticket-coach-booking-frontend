import { useEffect, useState } from 'react';
import classNames from 'classnames/bind';

import styles from './Slider.module.scss';
import {
	verifyIcon,
	supportIcon,
	ticketPercentIcon,
	dollarCircleIcon,
} from '../../store/icons';

const cx = classNames.bind(styles);

const Slider = ({ images }) => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [startX, setStartX] = useState(null);
	const [idDragging, setIdDragging] = useState(false);
	const [translateX, setTranslateX] = useState(0);
	const [width, setWidth] = useState(100);

	const handleTouchStart = (e) => {
		setStartX(e.touches[0].clientX);
		setIdDragging(true);
	};

	const handleTouchMove = (e) => {
		e.preventDefault();
		if (!idDragging) return;

		const currentX = e.touches[0].clientX;
		const diffX = currentX - startX;
		const newIndex = currentIndex - Math.sign(diffX);

		if (newIndex >= 0 && newIndex < images.length) {
			setCurrentIndex(newIndex);
		}
	};

	const handleTouchEnd = () => {
		setIdDragging(false);
		setStartX(null);
	};

	return (
		<div
			className={cx('wrap')}
			onTouchStart={handleTouchStart}
			onTouchMove={handleTouchMove}
			onTouchEnd={handleTouchEnd}
		>
			{images.map((image, index) => (
				<div
					className={cx('item')}
					style={{
						transform: `translateX(${translateX})`,
					}}
					key={index}
				>
					<img
						src={image}
						alt='slider'
						className={cx('slider')}
						loading='lazy'
						style={{
							width: `${width}vw`,
						}}
					/>
				</div>
			))}
			<div className={cx('name')}>COACH BOOKING</div>
			<div className={cx('commit')}>
				Cam kết hoàn 150% nếu nhà xe không giữ chỗ
			</div>
			<div className={cx('pod-container')}>
				<div className={cx('pod-item')}>
					<span className={cx('icon')}>{verifyIcon}</span>
					<span className={cx('label')}>Chắc chắn có chỗ</span>
				</div>
				<div className={cx('pod-item')}>
					<span className={cx('icon')}>{supportIcon}</span>
					<span className={cx('label')}>Hỗ trợ 24/7</span>
				</div>
				<div className={cx('pod-item')}>
					<span className={cx('icon')}>{ticketPercentIcon}</span>
					<span className={cx('label')}>Nhiều ưu đãi</span>
				</div>
				<div className={cx('pod-item')}>
					<span className={cx('icon')}>{dollarCircleIcon}</span>
					<span className={cx('label')}>Thanh toán đa dạng</span>
				</div>
			</div>
		</div>
	);
};

export default Slider;
