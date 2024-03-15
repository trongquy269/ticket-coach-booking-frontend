import { memo } from 'react';
import classNames from 'classnames/bind';
import { useDispatch } from 'react-redux';

import styles from './Overlay.module.scss';

const cx = classNames.bind(styles);

const Overlay = () => {
	const dispatch = useDispatch();

	return (
		<div
			className={cx('overlay')}
			onClick={() => dispatch({ type: 'ACCOUNT_FORM/HIDE' })}
		></div>
	);
};

export default memo(Overlay);
