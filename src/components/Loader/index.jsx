import classNames from 'classnames/bind';
import styles from './Loader.module.scss';

const cx = classNames.bind(styles);

const Loader = () => {
	return (
		<div className={cx('wrap')}>
			<span className={cx('loader')}></span>
		</div>
	);
};

export default Loader;
