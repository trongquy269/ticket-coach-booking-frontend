import { useEffect, useState } from 'react';
import classNames from 'classnames/bind';

import styles from './Account.module.scss';
import Login from '../Login';
import Register from '../Register';
import FillInfoForm from '../FillInfoForm';
import ForgotPassword from '../ForgotPassword';

const cx = classNames.bind(styles);

const Account = () => {
	const [form, setForm] = useState('login');
	const [loginFadeStyle, setLoginFadeStyle] = useState({
		loginLeft: '50%',
		loginTransition: 'all 0.3s linear',
		registerLeft: '140%',
		registerTransition: 'all 0.2s linear',
		fillInfoLeft: '140%',
		fillInfoTransition: 'all 0.2s linear',
		forgotPasswordLeft: '140%',
		forgotPasswordTransition: 'all 0.2s linear',
	});

	useEffect(() => {
		if (form === 'register') {
			setLoginFadeStyle({
				loginLeft: '-45%',
				loginTransition: 'all 0.3s linear',
				registerLeft: '50%',
				registerTransition: 'all 0.2s linear',
				fillInfoLeft: '140%',
				fillInfoTransition: 'all 0.2s linear',
				forgotPasswordLeft: '140%',
				forgotPasswordTransition: 'all 0.2s linear',
			});
		} else if (form === 'login') {
			setLoginFadeStyle({
				loginLeft: '50%',
				loginTransition: 'all 0.2s linear',
				registerLeft: '140%',
				registerTransition: 'all 0.3s linear',
				fillInfoLeft: '140%',
				fillInfoTransition: 'all 0.2s linear',
				forgotPasswordLeft: '140%',
				forgotPasswordTransition: 'all 0.2s linear',
			});
		} else if (form === 'fill-info') {
			setLoginFadeStyle({
				loginLeft: '-45%',
				loginTransition: 'all 0.3s linear',
				registerLeft: '140%',
				registerTransition: 'all 0.3s linear',
				fillInfoLeft: '50%',
				fillInfoTransition: 'all 0.2s linear',
				forgotPasswordLeft: '140%',
				forgotPasswordTransition: 'all 0.2s linear',
			});
		} else if (form === 'forgot-password') {
			setLoginFadeStyle({
				loginLeft: '-45%',
				loginTransition: 'all 0.3s linear',
				registerLeft: '140%',
				registerTransition: 'all 0.3s linear',
				fillInfoLeft: '140%',
				fillInfoTransition: 'all 0.2s linear',
				forgotPasswordLeft: '50%',
				forgotPasswordTransition: 'all 0.2s linear',
			});
		}
	}, [form]);

	return (
		<div className={cx('wrap')}>
			<Login
				fadeStyle={loginFadeStyle}
				setForm={setForm}
			/>
			<Register
				fadeStyle={loginFadeStyle}
				setForm={setForm}
			/>
			<ForgotPassword
				fadeStyle={loginFadeStyle}
				setForm={setForm}
			/>
			<FillInfoForm
				fadeStyle={loginFadeStyle}
				setForm={setForm}
			/>
		</div>
	);
};

export default Account;
