import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import classNames from 'classnames/bind';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faStar as solidStar,
	faStarHalfStroke,
} from '@fortawesome/free-solid-svg-icons';
import { faStar as regularStar } from '@fortawesome/free-regular-svg-icons';

import styles from './ShowFeedback.module.scss';
import { convertYYYYMMDDToDDMMYYYY } from '../../store/actions';
import { likeIcon, dislikeIcon, optionIcon, editIcon } from '../../store/icons';
import Loader from '../../components/Loader';
import ToastContainerComponent from '../../components/ToastContainerComponent';
import ToastComponent from '../../components/ToastComponent';

const cx = classNames.bind(styles);
const BE_BASE_URL = import.meta.env.VITE_BE_BASE_URL;

const ShowFeedback = ({ scheduleId = 0, garageId = 0 }) => {
	const [filterFeedbacks, setFilterFeedback] = useState([]);
	const [feedbacks, setFeedbacks] = useState([]);
	const [rateTemp, setRateTemp] = useState(0);
	const [rate, setRate] = useState(0);
	const [feedbackInput, setFeedbackInput] = useState('');
	const [isShowFeedbackInput, setIsShowFeedbackInput] = useState(false);
	const [meanRate, setMeanRate] = useState(0);
	const [filterState, setFilterState] = useState(0);
	const [sliceFeedback, setSliceFeedback] = useState(3);
	const [isLoading, setIsLoading] = useState(false);
	const [toastList, setToastList] = useState([]);
	const [isModifyFeedback, setIsModifyFeedback] = useState(false);
	const [feedbackId, setFeedbackId] = useState(0);
	const [isShowStarRate, setIsShowStarRate] = useState(false);

	const user = useSelector((state) => state.users);

	const getData = async () => {
		scheduleId !== 0 &&
			(await axios
				.get(`${BE_BASE_URL}/feedback`, {
					params: {
						scheduleId,
					},
				})
				.then((res) => {
					if (res?.data) {
						// Sort the feedbacks to put your rating first
						const arr = res.data.sort((a, b) =>
							a.user_id === user.id
								? -1
								: b.user_id === user.id
								? 1
								: 0
						);

						setFeedbacks([...arr]);
						setFilterFeedback([...arr]);
					}
				})
				.catch((err) => {
					console.log(err);
				}));
	};

	useEffect(() => {
		getData();
	}, [scheduleId, garageId]);

	useEffect(() => {
		if (feedbacks.length > 0) {
			const totalRate = feedbacks.reduce((total, num) => {
				return total + num.rate;
			}, 0);
			setMeanRate(Math.round((totalRate / feedbacks.length) * 10) / 10);
		}
	}, [feedbacks]);

	useEffect(() => {
		if (filterState === 0) {
			setFilterFeedback([...feedbacks]);
			return;
		} else {
			setFilterFeedback(
				feedbacks.filter((feedback) => feedback.rate === filterState)
			);
		}
	}, [filterState]);

	useEffect(() => {
		if (rate !== 0) setIsShowFeedbackInput(true);
	}, [rate]);

	const oneToAllRatio = (ladder) => {
		return (
			feedbacks.reduce((total, num) => {
				if (num.rate === ladder) {
					return total + 1 / feedbacks.length;
				}
				return total;
			}, 0) * 100
		);
	};

	const isFeedback = () => {
		return false;
		if (feedbacks.length === 0) return false;

		for (let i = 0; i < feedbacks.length; i++) {
			if (feedbacks[i].user_id === user.id) return true;
		}

		return false;
	};

	const cancelFeedback = () => {
		setRate(0);
		setIsShowFeedbackInput(false);
		setFeedbackInput('');
		setIsShowStarRate(false);
	};

	const sendFeedback = async () => {
		if (rate === 0) {
			setToastList([
				...toastList,
				<ToastComponent
					type='error'
					content={`Bạn chưa lựa chọn số sao phù hợp`}
				/>,
			]);

			return;
		}

		setIsLoading(true);

		if (!isModifyFeedback) {
			await axios
				.post(`${BE_BASE_URL}/feedback`, {
					userId: user.id,
					scheduleId: scheduleId,
					rate: rate,
					content: feedbackInput.trim(),
				})
				.then((res) => {
					if (res?.data?.message === 'success') {
						setRate(0);
						setIsShowFeedbackInput(false);
						setFeedbackInput('');

						getData();

						setToastList([
							...toastList,
							<ToastComponent
								type='success'
								content={`Cảm ơn bạn đã đánh giá!`}
							/>,
						]);
					}
				})
				.catch((error) => {
					console.log(error);
				});
		} else {
			await axios
				.put(`${BE_BASE_URL}/feedback`, {
					feedbackId,
					rate: rate,
					content: feedbackInput.trim(),
				})
				.then((res) => {
					if (res?.data?.message === 'success') {
						setRate(0);
						setIsShowFeedbackInput(false);
						setFeedbackInput('');
						setIsShowStarRate(false);

						getData();

						setToastList([
							...toastList,
							<ToastComponent
								type='success'
								content={`Cảm ơn bạn đã đánh giá!`}
							/>,
						]);
					}
				})
				.catch((error) => {
					console.log(error);
				});
		}

		setIsLoading(false);
	};

	const contextMenu = (e) => {
		e.preventDefault();
	};

	const modifyFeedback = (index) => {
		setRate(filterFeedbacks[index].rate);
		if (
			filterFeedbacks[index].content ===
			'Khách hàng đã không để lại bất kỳ lời đánh giá nào.'
		) {
			setFeedbackInput('');
		} else {
			setFeedbackInput(filterFeedbacks[index].content);
		}
		setIsShowFeedbackInput(true);
		setIsModifyFeedback(true);
		setFeedbackId(filterFeedbacks[index].id);
		setIsShowStarRate(true);
	};

	const cancelReplyFeedback = (e) => {
		const item = e.target.parentElement.parentElement;
		item.querySelector('.reply').value = '';
		item.querySelector('.reply').focus();
	};

	const sendReplyFeedback = async (e, feedbackId) => {
		const item = e.target.parentElement.parentElement;
		const replyFeedbackValue = item.querySelector('.reply').value;

		if (replyFeedbackValue.trim() === '') {
			setToastList([
				...toastList,
				<ToastComponent
					type='error'
					content={'Không được để trống câu trả lời'}
				/>,
			]);

			item.querySelector('.reply').focus();

			return;
		}

		await axios
			.post(`${BE_BASE_URL}/reply-feedback`, {
				feedbackId,
				content: replyFeedbackValue.trim(),
			})
			.then((res) => {
				if (res?.data?.message === 'success') {
					getData();
					setToastList([
						...toastList,
						<ToastComponent
							type='success'
							content={`Trả lời thành công`}
						/>,
					]);
				}
			})
			.catch((err) => console.log(err));
	};

	return (
		<div className={cx('wrap')}>
			{!isFeedback() && (
				<div className={cx('title')}>
					Cho người khác biết về trải nghiệm của bạn
				</div>
			)}
			{(!isFeedback() || isShowStarRate) && (
				<div className={cx('star')}>
					<FontAwesomeIcon
						className={cx(
							'icon',
							(rate >= 1 || rateTemp >= 1) && 'active'
						)}
						icon={
							rate >= 1 || rateTemp >= 1 ? solidStar : regularStar
						}
						onMouseEnter={() => setRateTemp(1)}
						onMouseLeave={() => setRateTemp(0)}
						onClick={() => setRate(1)}
					/>
					<FontAwesomeIcon
						className={cx(
							'icon',
							(rate >= 2 || rateTemp >= 2) && 'active'
						)}
						icon={
							rate >= 2 || rateTemp >= 2 ? solidStar : regularStar
						}
						onMouseEnter={() => setRateTemp(2)}
						onMouseLeave={() => setRateTemp(0)}
						onClick={() => setRate(2)}
					/>
					<FontAwesomeIcon
						className={cx(
							'icon',
							(rate >= 3 || rateTemp >= 3) && 'active'
						)}
						icon={
							rate >= 3 || rateTemp >= 3 ? solidStar : regularStar
						}
						onMouseEnter={() => setRateTemp(3)}
						onMouseLeave={() => setRateTemp(0)}
						onClick={() => setRate(3)}
					/>
					<FontAwesomeIcon
						className={cx(
							'icon',
							(rate >= 4 || rateTemp >= 4) && 'active'
						)}
						icon={
							rate >= 4 || rateTemp >= 4 ? solidStar : regularStar
						}
						onMouseEnter={() => setRateTemp(4)}
						onMouseLeave={() => setRateTemp(0)}
						onClick={() => setRate(4)}
					/>
					<FontAwesomeIcon
						className={cx(
							'icon',
							(rate >= 5 || rateTemp >= 5) && 'active'
						)}
						icon={
							rate >= 5 || rateTemp >= 5 ? solidStar : regularStar
						}
						onMouseEnter={() => setRateTemp(5)}
						onMouseLeave={() => setRateTemp(0)}
						onClick={() => setRate(5)}
					/>
				</div>
			)}
			{!isFeedback() && !isShowFeedbackInput && (
				<button
					className={cx('write-feedback-btn')}
					onClick={() => setIsShowFeedbackInput(true)}
				>
					Viết bài đánh giá
				</button>
			)}
			{isShowFeedbackInput && (
				<textarea
					className={cx('feedback-input')}
					rows='3'
					placeholder='Mô tả trải nghiệm của bạn (không bắt buộc)'
					onChange={(e) => setFeedbackInput(e.target.value)}
					maxLength={500}
					value={feedbackInput}
				></textarea>
			)}
			{isShowFeedbackInput && (
				<div className={cx('text-count')}>
					{feedbackInput.length}/500
				</div>
			)}
			{isShowFeedbackInput && (
				<div className={cx('button')}>
					<button onClick={cancelFeedback}>Huỷ</button>
					<button onClick={sendFeedback}>Đánh giá</button>
				</div>
			)}
			<div className={cx('title')}>Điểm xếp hạng và bài đánh giá</div>
			<div className={cx('subtitle')}>
				Điểm xếp hạng và bài đánh giá đã được xác minh và do những người
				đã trải nghiệm chuyến đi đưa ra
			</div>
			<div className={cx('score')}>
				<div>
					<div className={cx('mean-rate')}>{meanRate}</div>
					<div className={cx('star-rate')}>
						<FontAwesomeIcon
							icon={meanRate >= 1 ? solidStar : regularStar}
							className={cx(
								'icon-star-rate',
								meanRate >= 1 && 'active'
							)}
						/>
						<FontAwesomeIcon
							icon={
								meanRate >= 2
									? solidStar
									: meanRate > 1
									? faStarHalfStroke
									: regularStar
							}
							className={cx(
								'icon-star-rate',
								meanRate > 1 && 'active'
							)}
						/>
						<FontAwesomeIcon
							icon={
								meanRate >= 3
									? solidStar
									: meanRate > 2
									? faStarHalfStroke
									: regularStar
							}
							className={cx(
								'icon-star-rate',
								meanRate > 2 && 'active'
							)}
						/>
						<FontAwesomeIcon
							icon={
								meanRate >= 4
									? solidStar
									: meanRate > 3
									? faStarHalfStroke
									: regularStar
							}
							className={cx(
								'icon-star-rate',
								meanRate > 3 && 'active'
							)}
						/>
						<FontAwesomeIcon
							icon={
								meanRate >= 5
									? solidStar
									: meanRate > 4
									? faStarHalfStroke
									: regularStar
							}
							className={cx(
								'icon-star-rate',
								meanRate > 4 && 'active'
							)}
						/>
					</div>
					<div className={cx('amount-rate')}>{feedbacks.length}</div>
				</div>
				<div>
					<div className={cx('ladder')}>
						<span className={cx('number')}>5</span>
						<span className={cx('shape')}>
							<span
								className={cx('shape-fill')}
								style={{
									right: `calc(100% - ${oneToAllRatio(5)}%)`,
								}}
							></span>
						</span>
					</div>
					<div className={cx('ladder')}>
						<span className={cx('number')}>4</span>
						<span className={cx('shape')}>
							<span
								className={cx('shape-fill')}
								style={{
									right: `calc(100% - ${oneToAllRatio(4)}%)`,
								}}
							></span>
						</span>
					</div>
					<div className={cx('ladder')}>
						<span className={cx('number')}>3</span>
						<span className={cx('shape')}>
							<span
								className={cx('shape-fill')}
								style={{
									right: `calc(100% - ${oneToAllRatio(3)}%)`,
								}}
							></span>
						</span>
					</div>
					<div className={cx('ladder')}>
						<span className={cx('number')}>2</span>
						<span className={cx('shape')}>
							<span
								className={cx('shape-fill')}
								style={{
									right: `calc(100% - ${oneToAllRatio(2)}%)`,
								}}
							></span>
						</span>
					</div>
					<div className={cx('ladder')}>
						<span className={cx('number')}>1</span>
						<span className={cx('shape')}>
							<span
								className={cx('shape-fill')}
								style={{
									right: `calc(100% - ${oneToAllRatio(1)}%)`,
								}}
							></span>
						</span>
					</div>
				</div>
			</div>
			<div className={cx('filter')}>
				<div
					className={cx('filter-item', filterState === 0 && 'active')}
					onClick={() => setFilterState(0)}
				>
					Tất cả
				</div>
				<div
					className={cx('filter-item', filterState === 5 && 'active')}
					onClick={() => setFilterState(5)}
				>
					5 ★
				</div>
				<div
					className={cx('filter-item', filterState === 4 && 'active')}
					onClick={() => setFilterState(4)}
				>
					4 ★
				</div>
				<div
					className={cx('filter-item', filterState === 3 && 'active')}
					onClick={() => setFilterState(3)}
				>
					3 ★
				</div>
				<div
					className={cx('filter-item', filterState === 2 && 'active')}
					onClick={() => setFilterState(2)}
				>
					2 ★
				</div>
				<div
					className={cx('filter-item', filterState === 1 && 'active')}
					onClick={() => setFilterState(1)}
				>
					1 ★
				</div>
			</div>
			<div className={cx('feedback')}>
				{filterFeedbacks.length > 0 &&
					filterFeedbacks
						.slice(0, sliceFeedback)
						.map((feedback, index) => (
							<div
								key={index}
								className='position-relative w-100'
								onContextMenu={(e) => contextMenu(e)}
							>
								<div className={cx('name')}>
									{feedback.name}
									{feedback.user_id === user.id && (
										<span className={cx('tag')}>
											{' '}
											- Bạn
										</span>
									)}
									{feedback.isModify === 1 && (
										<span className={cx('tag')}>
											{' '}
											(đã chỉnh sửa)
										</span>
									)}
								</div>
								<div className={cx('time')}>
									<div>
										<FontAwesomeIcon
											className={cx(
												feedback.rate >= 1
													? 'active'
													: ''
											)}
											icon={solidStar}
										/>
										<FontAwesomeIcon
											className={cx(
												feedback.rate >= 2
													? 'active'
													: ''
											)}
											icon={solidStar}
										/>
										<FontAwesomeIcon
											className={cx(
												feedback.rate >= 3
													? 'active'
													: ''
											)}
											icon={solidStar}
										/>
										<FontAwesomeIcon
											className={cx(
												feedback.rate >= 4
													? 'active'
													: ''
											)}
											icon={solidStar}
										/>
										<FontAwesomeIcon
											className={cx(
												feedback.rate >= 5
													? 'active'
													: ''
											)}
											icon={solidStar}
										/>
									</div>
									<div>
										{convertYYYYMMDDToDDMMYYYY(
											feedback.date
										)}
									</div>
								</div>
								<div className={cx('content')}>
									{feedback.content}
								</div>
								<div className={cx('evaluate')}>
									<span>
										Bài đánh giá này có hữu ích không?
									</span>
									<span className={cx('evaluate-icon')}>
										{likeIcon}
									</span>
									<span className={cx('evaluate-icon')}>
										{dislikeIcon}
									</span>
								</div>

								{feedback.user_id === user.id && (
									<div className={cx('option-btn')}>
										{optionIcon}
										<div className={cx('option')}>
											<div className={cx('title')}>
												Lựa chọn
											</div>
											<button
												className={cx('item')}
												onClick={() =>
													modifyFeedback(index)
												}
											>
												Chỉnh sửa
											</button>
										</div>
									</div>
								)}
								{!feedback.reply_feedback_content && (
									<textarea
										className={cx(
											'feedback-input',
											'reply'
										)}
										rows='3'
										placeholder={`Trả lời ${feedback.name}`}
										// onChange={(e) =>
										// 	setFeedbackInput(e.target.value)
										// }
										maxLength={500}
										// value={feedbackInput}
									></textarea>
								)}
								{!feedback.reply_feedback_content && (
									<div className={cx('text-count')}>
										{feedbackInput.length}/500
									</div>
								)}
								{!feedback.reply_feedback_content && (
									<div className={cx('button')}>
										<button
											onClick={(e) =>
												cancelReplyFeedback(e)
											}
										>
											Huỷ
										</button>
										<button
											onClick={(e) =>
												sendReplyFeedback(
													e,
													feedback.id
												)
											}
										>
											Trả lời
										</button>
									</div>
								)}
								{feedback.reply_feedback_content && (
									<div className={cx('reply-feedback')}>
										<div className={cx('name')}>
											{feedback.garage_name}
										</div>
										<div className={cx('time')}>
											{convertYYYYMMDDToDDMMYYYY(
												feedback.date
											)}{' '}
											Đã phản hồi đá giá của bạn
										</div>
										<div className={cx('content')}>
											{feedback.reply_feedback_content}
										</div>
									</div>
								)}
							</div>
						))}
				{filterFeedbacks.length === 0 && (
					<div>Không có đánh giá nào</div>
				)}
				{sliceFeedback < filterFeedbacks.length && (
					<button
						className={cx('show-more')}
						onClick={() => setSliceFeedback((prev) => prev + 3)}
					>
						Xem thêm đánh giá
					</button>
				)}
			</div>

			<ToastContainerComponent
				toastList={toastList}
				setToastList={setToastList}
			/>
			{isLoading && <Loader />}
		</div>
	);
};

export default ShowFeedback;
