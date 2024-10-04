import { useSelector } from 'react-redux';
import classNames from 'classnames/bind';

import styles from './App.module.scss';
import AppRouter from './routes';
import Chat from './views/Chat';

const cx = classNames.bind(styles);

function App() {
	const userID = useSelector((state) => state.users.id);

	return (
		<div className={cx('wrap')}>
			<AppRouter />
			{!!userID && <Chat />}
		</div>
	);
}

export default App;
