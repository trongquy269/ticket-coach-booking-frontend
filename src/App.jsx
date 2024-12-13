import { useSelector } from 'react-redux';
import classNames from 'classnames/bind';

import styles from './App.module.scss';
import AppRouter from './routes';
import Chat from './views/Chat';

const cx = classNames.bind(styles);

function App () {
	const userID = useSelector((state) => state.users.id);
	const role = useSelector((state) => state.users.role);

	return (
		<div className={cx('wrap')}>
			<AppRouter/>
			{(
			 !!userID && role === 'customer'
			 ) && <Chat/>}
		</div>
	);
}

export default App;
