import { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

import styles from './Home.module.scss';
import Header from '../../components/Header';
import Search from '../../components/Search';
import ShowRoutes from '../../components/ShowRoutes';
import Footer from '../../components/Footer';
import Banner from '../../components/Banner';
import Navbar from '../../components/Navbar';
import { createSlug } from '../../store/actions';

const cx = classNames.bind(styles);

const Home = () => {
	const routes = useSelector((state) => state.routes);
	const isShowRoutes = useSelector((state) => state.isShowRoutes);
	const startPlaceID = useSelector((state) => state.startPlaceID);
	const endPlaceID = useSelector((state) => state.endPlaceID);
	const [isShowFullBlog2, setIsShowFullBlog2] = useState(false);

	const dispatch = useDispatch();
	const location = useLocation();
	const navigate = useNavigate();

	useEffect(() => {
		if (isShowRoutes) {
		}
	}, [isShowRoutes]);

	useEffect(() => {
		setIsShowFullBlog2(false);

		if (location.search.includes('show-route=true')) {
			if (startPlaceID && endPlaceID) {
				dispatch({ type: 'ROUTES/SHOW' });
			}
		}

		return () => {
			dispatch({ type: 'ROUTES/HIDE' });
		};
	}, []);

	const findSchedule = (startPlaceId, endPlaceId) => {
		dispatch({ type: 'START_PLACE/CHANGE', payload: startPlaceId });
		dispatch({ type: 'END_PLACE/CHANGE', payload: endPlaceId });

		axios
			.get('http://localhost:3000/schedule', {
				params: {
					startPlace: startPlaceId,
					endPlace: endPlaceId,
					startDate: '',
				},
			})
			.then((res) => {
				if (res?.data?.length) {
					dispatch({ type: 'ROUTES/CHANGE', payload: res.data });
				}

				dispatch({ type: 'ROUTES/SHOW' });
			})
			.catch((error) => console.log(error));
	};

	const gotoSearchSchedule = (place) => {
		const param = createSlug(place);
		navigate(`/search/schedule?end=${param}`);
	};

	return (
		<div className={cx('wrap')}>
			<Header />
			<Navbar />
			<Banner />
			<Search />
			{isShowRoutes && <ShowRoutes />}
			<section>
				<div className={cx('title')}>Các Điểm Đến Phổ Biến</div>
				<div className={cx('container')}>
					<div
						className={cx('item')}
						onClick={() => gotoSearchSchedule('Vũng Tàu')}
					>
						<img
							src='/images/VungTau.png'
							alt='Ảnh Vũng Tàu'
						/>
						<div className={cx('label')}>Vé Xe Đi Vũng Tàu</div>
					</div>
					<div
						className={cx('item')}
						onClick={() => gotoSearchSchedule('Đà Nẵng')}
					>
						<img
							src='/images/DaNang.png'
							alt='Ảnh Đà Nẵng'
						/>
						<div className={cx('label')}>Vé Xe Đi Đà Nẵng</div>
					</div>
					<div
						className={cx('item')}
						onClick={() => gotoSearchSchedule('Cần Thơ')}
					>
						<img
							src='/images/CanTho.png'
							alt='Ảnh Cần Thơ'
						/>
						<div className={cx('label')}>Vé Xe Đi Cần Thơ</div>
					</div>
					<div
						className={cx('item')}
						onClick={() => gotoSearchSchedule('Hà Nội')}
					>
						<img
							src='/images/HaNoi.png'
							alt='Ảnh Hà Nội'
						/>
						<div className={cx('label')}>Vé Xe Đi Hà Nội</div>
					</div>
					<div
						className={cx('item')}
						onClick={() => gotoSearchSchedule('Huế')}
					>
						<img
							src='/images/Hue.png'
							alt='Ảnh Huế'
						/>
						<div className={cx('label')}>Vé Xe Đi Huế</div>
					</div>
					<div
						className={cx('item')}
						onClick={() => gotoSearchSchedule('Hồ Chí Minh')}
					>
						<img
							src='/images/HoChiMinh.png'
							alt='Ảnh TP. Hồ Chí Minh'
						/>
						<div className={cx('label')}>
							Vé Xe Đi TP. Hồ Chí Minh
						</div>
					</div>
				</div>
			</section>
			<section className={cx('--background')}>
				<div className={cx('title')}>Tuyến Xe Khách Phổ Biến</div>
				<div className={cx('container')}>
					<div className={cx('item', 'expand-height')}>
						<div className={cx('header')}>
							<img
								src='/images/HaNoi2.png'
								alt='Ảnh Hà Nội'
							/>
							<div className={cx('label')}>Vé xe khách từ</div>
							<div className={cx('from')}>
								<div>
									<span>Hà Nội</span> đến:
								</div>
								<div>Giá từ:</div>
							</div>
						</div>
						<div className={cx('body')}>
							<div
								className={cx('place')}
								onClick={() => findSchedule(11, 8)}
							>
								<span>Đà Nẵng</span>
								<span>355.000 VND</span>
							</div>
							<div
								className={cx('place')}
								onClick={() => findSchedule(11, 16)}
							>
								<span>Thừa Thiên - Huế</span>
								<span>345.000 VND</span>
							</div>
							<div
								className={cx('place')}
								onClick={() => findSchedule(11, 21)}
							>
								<span>Nam Định</span>
								<span>110.000 VND</span>
							</div>
						</div>
					</div>
					<div className={cx('item', 'expand-height')}>
						<div className={cx('header')}>
							<img
								src='/images/HoChiMinh2.png'
								alt='Ảnh TP. Hồ Chí Minh'
							/>
							<div className={cx('label')}>Vé xe khách từ</div>
							<div className={cx('from')}>
								<div>
									<span>Sài Gòn</span> đến:
								</div>
								<div>Giá từ:</div>
							</div>
						</div>
						<div className={cx('body')}>
							<div
								className={cx('place')}
								onClick={() => findSchedule(18, 6)}
							>
								<span>Cà Mau</span>
								<span>210.000 VND</span>
							</div>
							<div
								className={cx('place')}
								onClick={() => findSchedule(18, 2)}
							>
								<span>Bà Rịa - Vũng Tàu</span>
								<span>115.000 VND</span>
							</div>
							<div
								className={cx('place')}
								onClick={() => findSchedule(18, 1)}
							>
								<span>An Giang</span>
								<span>155.000 VND</span>
							</div>
						</div>
					</div>
					<div className={cx('item', 'expand-height')}>
						<div className={cx('header')}>
							<img
								src='/images/CanTho2.png'
								alt='Ảnh Cần Thơ'
							/>
							<div className={cx('label')}>Vé xe khách từ</div>
							<div className={cx('from')}>
								<div>
									<span>Cần Thơ</span> đến:
								</div>
								<div>Giá từ:</div>
							</div>
						</div>
						<div className={cx('body')}>
							<div
								className={cx('place')}
								onClick={() => findSchedule(7, 18)}
							>
								<span>Sài Gòn</span>
								<span>130.000 VND</span>
							</div>
							<div
								className={cx('place')}
								onClick={() => findSchedule(7, 1)}
							>
								<span>An Giang</span>
								<span>160.000 VND</span>
							</div>
							<div
								className={cx('place')}
								onClick={() => findSchedule(7, 5)}
							>
								<span>Bình Dương</span>
								<span>170.000 VND</span>
							</div>
						</div>
					</div>
				</div>
			</section>
			<section>
				<div className={cx('title', 'small')}>
					Đặt Vé Xe Khách Tại COACH BOOKING Giúp Bạn Thỏa Sức Du Ngoạn
				</div>
				<p className={cx('blog')}>
					Hãy sẵn sàng để trải nghiệm nhiều tiện ích hơn khi lên kế
					hoạch cho chuyến đi bằng dịch vụ <b>đặt vé xe khách</b> với
					COACH BOOKING. Tính năng mới nhất này của COACH BOOKING giúp
					người dùng <b>đặt vé xe online</b> chỉ trong vài cú nhấp
					chuột. Với <b>“Chọn, Đặt, Đi!”</b> tất cả những gì bạn cần
					làm là — <b>chọn</b> loại xe phù hợp với nhu cầu, <b>đặt</b>{' '}
					vé cho chuyến xe theo ý thích, sau đó{' '}
					<b>tận hưởng chuyến đi</b> mà không phải lo lắng bất cứ điều
					gì.
				</p>
			</section>
			<section>
				<div className={cx('title', 'small')}>
					Mua Vé Xe Khách Trực Tuyến Tại COACH BOOKING Với Giá Tốt
				</div>
				<p
					className={cx('blog', 'limit-height')}
					style={{
						height: isShowFullBlog2 && 'unset',
					}}
				>
					Vào ngày 01 tháng 01 năm 2024, COACH BOOKING đã giới thiệu
					dịch vụ đặt vé xe online thông qua website COACH BOOKING.
					Dịch vụ này giúp người dùng có thể đặt vé xe khách dễ dàng
					hơn rất nhiều vì không còn phải chịu cảnh xếp hàng tại quầy
					hay mất nhiều thời gian để đến các đại lý bán vé.
					<br />
					<br />
					Cho đến hôm nay, COACH BOOKING đã hợp tác với nhiều hãng xe
					khách nổi tiếng trên khắp Việt Nam đảm bảo đáp ứng nhu cầu
					đa dạng của người dùng. Các hạng xe khách hiện có bao gồm từ
					<b>
						{' '}
						xe khách thông thường, xe khách giường nằm, xe khách
						limousine,...
					</b>{' '}
					Hành khách có thể tận hưởng nhiều tiện nghi khác nhau trên
					xe khách, chẳng hạn như máy lạnh, ghế ngả, nhà vệ sinh, WiFi
					và ổ cắm điện, tùy thuộc vào hạng và loại xe khách.
					<br />
					<br />
					Ngoài những lợi ích đã đề cập ở trên, còn có nhiều lợi ích
					khác mà người dùng có thể nhận được khi đặt vé xe khách trực
					tuyến thông qua website COACH BOOKING.
					<br />
					<br />
					<big>
						<b>1. Chọn - Đặt - Đi</b>
					</big>
					<br />
					Đặt vé xe khách online không còn rắc rối nhờ website COACH
					BOOKING. Tất cả những gì bạn phải làm là truy cập website
					đặt vé xe online trên điện thoại di động, máy tính bảng hoặc
					máy tính mọi lúc, mọi nơi. Quá trình đặt vé xe khách online
					này rất dễ dàng, nhanh chóng và an toàn. Bạn không còn phải
					mất nhiều thời gian cùng sức lực để đến và xếp hàng dài chờ
					đợi tại các bến xe khách. Bạn cũng không phải lo lắng nếu
					gặp sự cố khi đặt vé xe khách. Dịch vụ khách hàng 24 giờ của
					COACH BOOKING sẽ luôn sẵn sàng trợ giúp bạn qua tính năng
					trò chuyện, điện thoại, email hoặc qua trung tâm tin nhắn
					trên Ứng dụng COACH BOOKING.
					<br />
					<br />
					<big>
						<b>2. Tùy chọn không giới hạn</b>
					</big>
					<br />
					COACH BOOKING chính thức hợp tác với nhiều nhà điều hành xe
					khách (PO) và dịch vụ đưa đón phục vụ hàng trăm tuyến đường
					đến các tỉnh thành khác nhau trên khắp Việt Nam. Số lượng
					công ty xe khách, đối tác xe đưa đón và các lựa chọn tuyến
					đường mà COACH BOOKING cung cấp chắc chắn sẽ tiếp tục tăng
					trong tương lai.
					<br />
					<br />
					<big>
						<b>3. Thông tin đầy đủ</b>
					</big>
					<br />
					Khi đặt vé xe online trên COACH BOOKING, bạn có thể dễ dàng
					tìm thấy đầy đủ thông tin liên quan đến chuyến xe của mình.
					Thông tin chi tiết về giá cả, tuyến đường, lịch trình, điểm
					lên và xuống, loại xe khách, thông số kỹ thuật cũng như hình
					ảnh xe khách đều có trên website COACH BOOKING và trang web
					di động. Bạn cũng có thể so sánh các xe khách và chọn loại
					xe phù hợp nhất với nhu cầu của mình chỉ bằng một vài thao
					tác.
					<br />
					<br />
					<big>
						<b>4. Phương thức thanh toán đa dạng</b>
					</big>
					<br />
					COACH BOOKING đảm bảo người dùng có thể hoàn thành thanh
					toán vé xe khách một cách nhanh chóng và an toàn bằng cách
					hợp tác với nhiều ngân hàng đáng tin cậy khác nhau, nhiều
					phương thức thanh toán có sẵn để thuận tiện hơn cho giao
					dịch. Người dùng có thể thực hiện thanh toán vé xe khách
					thông qua máy ATM, chuyển khoản ngân hàng hoặc thẻ tín dụng.
					<br />
					<br />
					<big>
						<b>5. Giá rẻ hơn</b>
					</big>
					<br />
					Trên tất cả các dịch vụ của mình, COACH BOOKING luôn cung
					cấp mức giá tốt nhất cho người dùng. Điều này bao gồm dịch
					vụ đặt vé xe khách và xe đưa đón trực tuyến. Tất cả vé xe
					khách và xe đưa đón tại COACH BOOKING đều được cung cấp với
					mức giá thấp hơn so với các loại vé khác trên thị trường.
					Việc luôn có sẵn các chương trình khuyến mãi hấp dẫn còn
					giúp việc mua vé xe khách tại COACH BOOKING trở nên không
					thể bỏ qua.
					<br />
					<br />
					<big>
						<b>6. Đảm bảo vé chính thức</b>
					</big>
					<br />
					COACH BOOKING thiết lập quan hệ đối tác chính thức với các
					nhà điều hành xe khách và xe đưa đón. Do đó, tất cả các
					thông tin liên quan đến vé xe khách và xe đưa đón của bạn
					đều được phối hợp chặt chẽ với tất cả các nhân viên xe khách
					tại điểm lên xe. Bạn chỉ cần xuất trình vé điện tử COACH
					BOOKING và lên xe để bắt đầu chuyến đi. Ngay cả khi vé xe
					khách của bạn có vấn đề, chẳng hạn như bị từ chối lên xe, bị
					hành khách khác chiếm chỗ hoặc xe khách khởi hành sớm hơn
					lịch trình, COACH BOOKING sẵn sàng cung cấp phương tiện thay
					thế hoặc hoàn tiền 100% cho bạn. Khi du lịch 4.0 lên ngôi,
					hãy tận dụng tối đa sức mạnh công nghệ để chuyến đi của bạn
					diễn ra nhanh chóng và dễ dàng nhất. Trải nghiệm ngay dịch
					vụ đặt vé xe khách cùng COACH BOOKING cho chuyến đi sắp tới
					bạn nhé!
				</p>
				{!isShowFullBlog2 && (
					<button
						className={cx('see-more')}
						onClick={() => setIsShowFullBlog2(true)}
					>
						Xem thêm
					</button>
				)}
			</section>
			<Footer />
		</div>
	);
};

export default Home;
