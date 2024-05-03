import { useState, useEffect, useRef } from 'react';
import classNames from 'classnames/bind';

import styles from './QuickRegisterForm.module.scss';
import { isVietnamesePhoneNumber } from '../../store/actions';

const cx = classNames.bind(styles);
/**
 *
 * @param {string} isError - Determine whether the form has information errors. With the corresponding values '' (default) there is no error, 'name' is an error in the input value of a name attribute, and 'phone' is an error in the input value of a phone number attribute
 * @returns
 */
const QuickRegisterForm = ({ setName, setPhone, isError }) => {
	const [nameError, setNameError] = useState('');
	const [phoneError, setPhoneError] = useState('');

	const nameRef = useRef(null);
	const phoneRef = useRef(null);

	useEffect(() => {
		if (!isError) {
			setNameError('');
			setPhoneError('');
		} else if (isError === 'name') {
			nameRef?.current?.focus();

			if (nameRef?.current?.value.trim() === '') {
				setNameError('Tên đăng nhập không được để trống');
			}

			setPhoneError('');
		} else if ((isError = 'phone')) {
			phoneRef?.current?.focus();

			const phoneValue = phoneRef?.current?.value.trim();

			if (!phoneValue) {
				setPhoneError('Số điện thoại không được để trống');
			} else if (!isVietnamesePhoneNumber(phoneValue)) {
				setPhoneError('Số điện thoại không hợp lệ');
			}

			setNameError('');
		}
	}, [isError]);

	return (
		<div className={cx('wrap')}>
			<label htmlFor='quick-register-name-input'>Họ và Tên</label>
			<input
				type='text'
				id='quick-register-name-input'
				onChange={(e) => setName(e.target.value)}
				ref={nameRef}
				className={cx(nameError ? 'shake' : '')}
			/>
			{nameError && <span className={cx('annotation')}>{nameError}</span>}
			<label htmlFor='quick-register-phone-input'>Số điện thoại</label>
			<input
				type='text'
				id='quick-register-phone-input'
				onChange={(e) => setPhone(e.target.value)}
				ref={phoneRef}
				className={cx(phoneError ? 'shake' : '')}
			/>
			{phoneError && (
				<span className={cx('annotation')}>{phoneError}</span>
			)}
		</div>
	);
};

export default QuickRegisterForm;
