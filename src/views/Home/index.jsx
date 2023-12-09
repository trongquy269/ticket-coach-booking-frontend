import { useState } from 'react';
import classNames from 'classnames/bind';
import { useSelector } from 'react-redux';

import styles from './Home.module.scss';
import Header from '../../components/Header';
import Search from '../../components/Search';
import ShowRoutes from '../../components/ShowRoutes';

const cx = classNames.bind(styles);

const Home = () => {
	const routes = useSelector((state) => state.routes);
	const isShowRoutes = useSelector((state) => state.isShowRoutes);

	return (
		<div className={cx('wrap')}>
			<Header />
			<Search />
			{isShowRoutes && <ShowRoutes routes={routes} />}
		</div>
	);
};

export default Home;
