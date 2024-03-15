import { useRef } from 'react';
import classNames from 'classnames/bind';
import styles from './VerifyCode.module.scss';

const cx = classNames.bind(styles);

const VerifyCode = ({ length, setVerifyCode, handleEnter }) => {
	const codeRefs = Array.from({ length }, () => useRef(null));

	const handleInputChange = (e, index) => {
		const value = e.target.value.trim();

		if (
			value.length === 1 &&
			index < length - 1 &&
			codeRefs[index + 1].current
		) {
			// Check if the next input exists before focusing on it
			codeRefs[index + 1].current.focus();
		}

		// Update the verify code
		let verifyCode = '';

		codeRefs.forEach((ref) => {
			verifyCode += ref.current.value.trim();
		});

		if (verifyCode.length === length) {
			setVerifyCode(verifyCode);
		}
	};

	const handleKeyDown = (e, index) => {
		if (
			e.key === 'Backspace' &&
			index > 0 &&
			!e.target.value &&
			codeRefs[index - 1].current
		) {
			// Check if the previous input exists before focusing on it
			codeRefs[index - 1].current.focus();
		} else if (e.key === 'Enter') {
			handleEnter(e);
		}
	};

	const handlePaste = (e) => {
		const pastedText = e.clipboardData.getData('text');

		if (pastedText.length === length) {
			// Distribute the pasted text to input fields
			Array.from(pastedText).forEach((char, index) => {
				if (index < length) {
					codeRefs[index].current.value = char;
					handleInputChange({ target: { value: char } }, index);
				}
			});

			// Prevent the default paste behavior
			e.preventDefault();
		}
	};

	return (
		<>
			{Array.from({ length }, (_, index) => (
				<input
					key={index}
					type='text'
					className={cx('input')}
					required
					maxLength={1}
					ref={codeRefs[index]}
					onInput={(e) => handleInputChange(e, index)}
					onKeyDown={(e) => handleKeyDown(e, index)}
					onPaste={handlePaste}
				/>
			))}
		</>
	);
};

export default VerifyCode;
