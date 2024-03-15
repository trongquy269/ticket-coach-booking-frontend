import { useState } from 'react';
import Toast from 'react-bootstrap/Toast';
import classNames from 'classnames/bind';

import styles from './ToastComponent.module.scss';

const cx = classNames.bind(styles);

const ToastComponent = ({ type, content, undoBtn = undefined }) => {
	const [show, setShow] = useState(true);

	const handleUndo = () => {
		undoBtn();
		setShow(false);
	};

	return (
		<Toast
			onClose={() => setShow(false)}
			show={show}
			delay={5000}
			autohide
			bg={
				type === 'success'
					? 'success'
					: type === 'error'
					? 'danger'
					: 'warning'
			}
		>
			<Toast.Header>
				<img
					src='/images/logo.png'
					className={cx('rounded', 'me-2', 'toast-logo')}
					alt=''
				/>
				<strong className='me-auto'>
					{type === 'success'
						? 'Thành công'
						: type === 'error'
						? 'Lỗi'
						: 'Cảnh báo'}
				</strong>
				<small className='text-muted'>Vừa xong</small>
			</Toast.Header>
			<Toast.Body>
				<div
					className={type === 'danger' ? 'text-black' : 'text-light'}
				>
					{content}
				</div>
				{undoBtn !== undefined && (
					<div className='mt-2 pt-2 border-top'>
						<button
							type='button'
							className='btn btn-light btn-sm position-relative top-0 start-0'
							onClick={handleUndo}
						>
							Hoàn tác
						</button>
					</div>
				)}
			</Toast.Body>
		</Toast>
	);
};

export default ToastComponent;
