import classNames from 'classnames/bind';

import styles from './Footer.module.scss';
import {
	locateIcon,
	phoneIcon,
	mailIcon,
	facebookIcon,
	twitterIcon,
	linkedinIcon,
} from '../../store/icons';

const cx = classNames.bind(styles);

function Footer() {
	return (
		<div className={cx('wrap')}>
			<div className={cx('block')}>
				<div className={cx('item')}>
					<div className={cx('icon')}>{locateIcon}</div>
					<div className={cx('label')}>
						Quận Ninh Kiều, <b>Thành phố Cần Thơ, Việt Nam</b>
					</div>
				</div>
				<div className={cx('item')}>
					<div className={cx('icon')}>{phoneIcon}</div>
					<div className={cx('label')}>+84 555 123456</div>
				</div>
				<div className={cx('item')}>
					<div className={cx('icon')}>{mailIcon}</div>
					<div className={cx('label', 'text-blue')}>
						support@coachbooking.com
					</div>
				</div>
			</div>
			<div className={cx('block')}>
				<div className={cx('item')}>
					<div className={cx('text', 'title')}>Về chúng tôi</div>
				</div>
				<div className={cx('item')}>
					<div className={cx('text')}>
						Chúng tôi tự hào là một công ty về dịch vụ đặt vé xe
						khách online an toàn và nhiều người sử dụng
					</div>
				</div>
				<div className={cx('item')}>
					<div className={cx('list-icon')}>
						<div>{facebookIcon}</div>
						<div>{twitterIcon}</div>
						<div>{linkedinIcon}</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Footer;
