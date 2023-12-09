import { useEffect, useState } from 'react';
import classNames from 'classnames/bind';

import styles from './Slider.module.scss';

const cx = classNames.bind(styles);

const Slider = ({ images }) => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [startX, setStartX] = useState(null);
	const [idDragging, setIdDragging] = useState(false);
	const [translateX, setTranslateX] = useState(0);

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
		console.log(1);
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
					style={{ transform: `translateX(${translateX})` }}
					key={index}
				>
					<img
						src={image}
						alt='slider'
						className={cx('slider')}
					/>
				</div>
			))}
		</div>
	);
};

export default Slider;
