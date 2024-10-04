import classNames from 'classnames/bind';

import styles from './Banner.module.scss';
import {
	verifyIcon,
	supportIcon,
	ticketPercentIcon,
	dollarCircleIcon,
} from '../../store/icons';

const cx = classNames.bind(styles);

const Banner = () => {
	return (
		<div className={cx('wrap')}>
			<img
				src='/images/background.jpeg'
				alt='background'
				className={cx('background')}
			/>
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

export default Banner;
