import { useState, useRef, useEffect, Fragment } from 'react';
import classNames from 'classnames/bind';
import axios from 'axios';
import { useSelector } from 'react-redux';

import styles from './Chat.module.scss';
import { chatIcon, sendIcon, closeIcon } from '../../store/icons';
import {
	convertTimestampToYYYYMMDD,
	convertTimestampToTime,
} from '../../store/actions';

const cx = classNames.bind(styles);
const BE_BASE_URL = import.meta.env.VITE_BE_BASE_URL;

function Chat() {
	const [messages, setMessages] = useState([]);
	const [isInputFocus, setIsInputFocus] = useState(false);
	const [isShowMessageForm, setIsShowMessageForm] = useState(false);
	const [isShowBotChatAnimate, setIsShowBotChatAnimate] = useState(false);

	const inputRef = useRef(null);
	const messagesRef = useRef(null);
	const messagesWrapRef = useRef(null);
	const mainRef = useRef(null);
	const chatBtnRef = useRef(null);

	const userId = useSelector((state) => state.users.id);

	const groupMessagesBySender = (messages) => {
		let groupedTimes = [];
		let groupedMessages = [];
		let currentGroup = [];

		for (let i = 0; i < messages.length; i++) {
			const message = messages[i];

			if (currentGroup.length === 0) {
				currentGroup.push(message);
			} else {
				const lastMessage = currentGroup[currentGroup.length - 1];
				const lastMessageDay = new Date(lastMessage.time).getDate();
				const lastMessageMonth = new Date(lastMessage.time).getMonth();
				const lastMessageYear = new Date(
					lastMessage.time
				).getFullYear();
				const messageDay = new Date(message.time).getDate();
				const messageMonth = new Date(message.time).getMonth();
				const messageYear = new Date(message.time).getFullYear();
				const timeDiff =
					messageYear !== lastMessageYear ||
					messageMonth !== lastMessageMonth ||
					messageDay !== lastMessageDay;
				const sameSender = message.sender === lastMessage.sender;

				if (!timeDiff) {
					if (sameSender) {
						currentGroup.push(message);
					} else {
						groupedMessages.push(currentGroup);
						currentGroup = [message];
					}
				} else {
					if (groupedMessages.length === 0) {
						groupedTimes.push([currentGroup]);
					} else {
						groupedMessages.push(currentGroup);
						groupedTimes.push(groupedMessages);
					}
					groupedMessages = [];
					currentGroup = [message];
				}
			}
		}

		if (currentGroup.length > 0) {
			groupedMessages.push(currentGroup);
		}

		groupedTimes.push(groupedMessages);

		return groupedTimes;
	};

	const renderMessages = () => {
		return messages.map((groups, index) => {
			return (
				<Fragment key={index}>
					<div className={cx('center')}>
						<div className={cx('text-wrap')}>
							<div className={cx('text')}>
								{convertTimestampToYYYYMMDD(groups[0][0].time)}
							</div>
						</div>
					</div>
					{groups.map((group, index) => {
						return (
							<div
								className={
									group[0].sender === 'bot'
										? cx('left')
										: cx('right')
								}
								key={index}
							>
								{group[0].sender === 'bot' && (
									<img
										src='/images/logo.png'
										alt='icon'
										className={cx('icon-text')}
									/>
								)}
								<div className={cx('text-wrap')}>
									{group.map((message, index) => {
										return (
											<div
												key={index}
												className={cx('text')}
												style={{
													'--time': `"${convertTimestampToTime(
														message.time
													)}"`,
												}}
											>
												{decodeURIComponent(
													atob(message.text)
												)}
											</div>
										);
									})}
								</div>
							</div>
						);
					})}
				</Fragment>
			);
		});
	};

	const addNewMessageToChat = (message) => {
		const messagesLength = messages.length;
		const lastTime = messages[messagesLength - 1];
		const timesLength = lastTime.length;
		const lastGroup = lastTime[timesLength - 1];
		const groupsLength = lastGroup.length;
		const lastMessage = lastGroup[groupsLength - 1];
		const lastMessageDay = new Date(lastMessage.time).getDate();
		const lastMessageMonth = new Date(lastMessage.time).getMonth();
		const lastMessageYear = new Date(lastMessage.time).getFullYear();
		const messageDay = new Date(message.time).getDate();
		const messageMonth = new Date(message.time).getMonth();
		const messageYear = new Date(message.time).getFullYear();
		const timeDiff =
			messageYear !== lastMessageYear ||
			messageMonth !== lastMessageMonth ||
			messageDay !== lastMessageDay;
		const sameSender = message.sender === lastMessage.sender;

		if (!timeDiff) {
			if (sameSender) {
				// lastGroup.push(message);
				const newMessages = [...messages];
				newMessages[messagesLength - 1][timesLength - 1].push(message);
				setMessages([...newMessages]);
			} else {
				// lastTime.push([message]);
				const newMessages = [...messages];
				newMessages[messagesLength - 1].push([message]);
				setMessages([...newMessages]);
			}
		} else {
			// messages.push([[message]]);
			const newMessages = [...messages];
			newMessages.push([[message]]);
			setMessages([...newMessages]);
		}
	};

	useEffect(() => {
		if (isShowMessageForm) {
			inputRef.current.focus();
		}
	}, [isShowMessageForm]);

	useEffect(() => {
		// Scroll messages to bottom
		messagesWrapRef.current.scrollTo({
			top: messagesRef.current.scrollHeight,
			behavior: 'smooth',
		});
	}, [messages]);

	const sendMessage = async (e = null) => {
		if (e) {
			if (e.shiftKey && e.key === 'Enter') {
				// If Shift + Enter is pressed, insert a newline
				// Insert a newline at the current cursor position in the text input
				const textarea = e.target;
				const start = textarea.selectionStart;
				const end = textarea.selectionEnd;

				// Set the value to the text before the cursor + newline + text after the cursor
				textarea.value =
					textarea.value.substring(0, start) +
					'\n' +
					textarea.value.substring(end);

				// Move the cursor to after the newline
				textarea.selectionStart = textarea.selectionEnd = start + 1;
				textarea.rows = ++textarea.rows;

				e.preventDefault();
				return;
			} else if (e.key === 'Enter') {
				if (e.target.value.trim() === '') {
					return;
				}
				e.preventDefault();
			} else {
				return;
			}
		}

		const text = btoa(encodeURIComponent(inputRef.current.value.trim()));
		const time = new Date().getTime();
		const sender = 'own';
		addNewMessageToChat({ text, time, sender });
		inputRef.current.value = '';
		e.target.rows = 1;
		setIsShowBotChatAnimate(true);

		await axios
			.post(`${BE_BASE_URL}/chat`, {
				userId,
				text,
				time,
			})
			.then((res) => {
				if (Object.keys(res?.data) !== 0) {
					addNewMessageToChat(res.data);
				}
			})
			.catch((err) => console.log(err));

		setIsShowBotChatAnimate(false);
	};

	useEffect(() => {
		// Click out side to hide chat
		const handleClickOutside = (e) => {
			if (
				mainRef.current &&
				!mainRef.current.contains(e.target) &&
				!chatBtnRef.current.contains(e.target)
			) {
				setIsShowMessageForm(false);
			}
		};

		document.addEventListener('click', handleClickOutside);

		axios
			.get(`${BE_BASE_URL}/chat`, {
				params: {
					userID: userId,
				},
			})
			.then((res) => {
				if (res?.data.length > 0) {
					setMessages(groupMessagesBySender(res.data));
				}
			})
			.catch((err) => console.log(err));

		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	}, []);

	return (
		<div className={cx('wrap')}>
			<div
				className={cx('main', isShowMessageForm && 'show')}
				ref={mainRef}
			>
				<div className={cx('header')}>
					<div className={cx('circle-icon')}></div>
					<div className={cx('title')}>COACH BOOKING</div>
					<div
						className={cx('close-icon')}
						onClick={() => setIsShowMessageForm(false)}
					>
						{closeIcon}
					</div>
				</div>
				<div
					className={cx('content')}
					onClick={() => inputRef.current.focus()}
					ref={messagesWrapRef}
				>
					<div
						className={cx('message')}
						ref={messagesRef}
					>
						{messages.length > 0 && renderMessages()}
						{isShowBotChatAnimate && (
							<div className={cx('left')}>
								<img
									src='/images/logo.png'
									alt='icon'
									className={cx('icon-text')}
								/>
								<div className={cx('bounce')}>
									<span className={cx('spinner')}></span>
									<span className={cx('spinner')}></span>
									<span className={cx('spinner')}></span>
								</div>
							</div>
						)}
					</div>
				</div>
				<div className={cx('footer')}>
					<textarea
						className={cx('input')}
						type='text'
						placeholder='Soạn tin nhắn...'
						autoFocus
						onFocus={() => setIsInputFocus(true)}
						onBlur={() => setIsInputFocus(false)}
						ref={inputRef}
						onKeyDown={(e) => sendMessage(e)}
						rows={1}
						spellCheck='false'
					></textarea>
					<div
						className={cx('send-icon')}
						onClick={() => {
							sendMessage();
							inputRef.current.focus();
						}}
					>
						{sendIcon}
					</div>
				</div>
			</div>
			<div
				className={cx('icon')}
				onClick={() => setIsShowMessageForm(!isShowMessageForm)}
				ref={chatBtnRef}
			>
				{chatIcon}
			</div>
		</div>
	);
}

export default Chat;
