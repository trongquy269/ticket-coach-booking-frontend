import classNames from 'classnames/bind';

import styles from './App.module.scss';
import AppRouter from './routes';

const cx = classNames.bind(styles);

function App() {
	return (
		<div className={cx('wrap')}>
			<AppRouter />
		</div>
	);
}

export default App;
