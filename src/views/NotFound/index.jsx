import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';

import styles from './NotFound.module.scss';

const cx = classNames.bind(styles);

const NotFound = () => {
	const navigate = useNavigate();

	return (
		<div className={cx('wrap')}>
			<div className={cx('background')}>404</div>
			<div className={cx('main')}>
				<div className={cx('heading')}>
					WE ARE SORRY, PAGE NOT FOUND!
				</div>
				<div className={cx('subtitle')}>
					THE PAGE YOU ARE LOOKING FOR MIGHT HAVE BEEN REMOVED HAD ITS
					NAME CHANGED OR IS TEMPORARILY UNAVAILABLE.
				</div>
				<button
					className={cx('button')}
					onClick={() => navigate('/')}
				>
					BACK TO HOMEPAGE
				</button>
			</div>
		</div>
	);
};

export default NotFound;
