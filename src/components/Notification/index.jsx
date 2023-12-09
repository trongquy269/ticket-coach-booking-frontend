import { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faFaceLaughWink,
	faFaceFrown,
	faFaceSadCry,
} from '@fortawesome/free-regular-svg-icons';

import styles from './Notification.module.scss';

const cx = classNames.bind(styles);

function Notification({ type, message, timeout }) {
	const [background, setBackground] = useState('var(--success-color)');
	const [icon, setIcon] = useState(faFaceLaughWink);
	const [right, setRight] = useState('-400px');
	const [timeoutId, setTimeoutId] = useState(null);

	useEffect(() => {
		if (timeoutId) {
			clearTimeout(timeoutId);
		}

		if (type === 'error') {
			setBackground('var(--error-color)');
			setIcon(faFaceSadCry);
		} else if (type === 'success') {
			setBackground('var(--success-color)');
			setIcon(faFaceLaughWink);
		} else if (type === 'warning') {
			setBackground('var(--warning-color)');
			setIcon(faFaceFrown);
		}

		setRight(0);

		const _timeout = setTimeout(() => {
			setRight('-400px');
		}, timeout);

		setTimeoutId(_timeout);

		return () => {
			if (_timeout) {
				clearTimeout(_timeout);
			}
		};
	}, []);

	return (
		<div
			className={cx('wrap')}
			style={{ backgroundColor: background, right: right }}
		>
			<FontAwesomeIcon
				icon={icon}
				className={cx('icon')}
			/>
			<div className={cx('content')}>
				<div className={cx('title')}>{type}</div>
				<div className={cx('message')}>{message}</div>
			</div>
		</div>
	);
}

export default Notification;
