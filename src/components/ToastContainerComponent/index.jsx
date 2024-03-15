import { useEffect, Fragment } from 'react';
import ToastContainer from 'react-bootstrap/ToastContainer';

const ToastContainerComponent = ({ toastList, setToastList }) => {
	useEffect(() => {
		const interval = setInterval(() => {
			if (toastList.length) {
				setToastList((prev) => prev.slice(1));
			}
		}, 5000);

		return () => clearInterval(interval);
	}, [toastList]);

	return (
		<ToastContainer className='mt-4 me-4 position-fixed top-0 end-0'>
			{toastList.length !== 0 &&
				toastList.map((toast, index) => (
					<Fragment key={index}>{toast}</Fragment>
				))}
		</ToastContainer>
	);
};

export default ToastContainerComponent;
