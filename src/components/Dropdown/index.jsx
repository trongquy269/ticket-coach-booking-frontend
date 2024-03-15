import classNames from 'classnames/bind';
import { useDispatch, useSelector } from 'react-redux';

import styles from './Dropdown.module.scss';

const cx = classNames.bind(styles);

const Dropdown = ({ data }) => {
	const dispatch = useDispatch();
	const isShowStartPlaceDropdown = useSelector(
		(state) => state.isShowStartPlaceDropdown
	);
	const isShowEndPlaceDropdown = useSelector(
		(state) => state.isShowEndPlaceDropdown
	);

	const handle = (id) => {
		if (isShowStartPlaceDropdown) {
			dispatch({ type: 'START_PLACE/CHANGE', payload: id });
			dispatch({ type: 'START_PLACE/HIDE' });
		} else if (isShowEndPlaceDropdown) {
			dispatch({ type: 'END_PLACE/CHANGE', payload: id });
			dispatch({ type: 'END_PLACE/HIDE' });
		}
	};

	return (
		<div className={cx('wrap')}>
			{data.length > 0 &&
				data.map((item, index) => (
					<div
						className={cx('item')}
						key={index}
						onClick={() => handle(item.id)}
					>
						{item.name}
					</div>
				))}
		</div>
	);
};

export default Dropdown;
