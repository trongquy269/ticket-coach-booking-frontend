export const seo = (data = {}) => {
	data.title = data.title || 'Coach Booking';
	data.metaDescription =
		data.metaDescription || 'Online Coach Ticket Booking';

	document.title = data.title;

	const metaDescriptionTag = document.querySelector(
		'meta[name="description"]'
	);

	if (metaDescriptionTag) {
		metaDescriptionTag.setAttribute('content', data.metaDescription);
	} else {
		const meta = document.createElement('meta');
		meta.name = 'description';
		meta.content = data.metaDescription;
		document.head.appendChild(meta);
	}
};

export const convertYYYYMMDDToDDMMYYYY = (date) => {
	if (!date) return '';

	const originalDate = new Date(date);
	const formattedDate = `${originalDate.getDate()}/${
		originalDate.getMonth() + 1
	}/${originalDate.getFullYear()}`;

	return formattedDate;
};

export const convertDDMMYYYYToYYYYMMDD = (date) => {
	if (!date) return '';

	const [dd, mm, yyyy] = date.split('/');
	return `${yyyy}-${mm}-${dd}`;
};

export const sortScheduleNewDate = (schedules) => {
	schedules.sort((a, b) => {
		const dateA = new Date(a.start_date);
		const dateB = new Date(b.start_date);

		return dateB - dateA;
	});

	return schedules;
};

export const sortDescNumeric = (arr, type) => {
	arr.sort((a, b) => b[type] - a[type]);
	return arr;
};

export const sortAscNumeric = (arr, type) => {
	arr.sort((a, b) => a[type] - b[type]);
	return arr;
};

// export const calculateNumberOfLines = (text, width) => {
// 	// Get the computed style of the paragraph element
// 	const computedStyle = window.getComputedStyle(text);
// 	// Get the font size and line height in pixels
// 	const fontSize = parseFloat(computedStyle.fontSize);
// 	const lineHeight = parseFloat(computedStyle.lineHeight);
// 	// Calculate the available width per pixels
// 	const availableWidthPerLine = width;
// 	// Calculate the number of lines by dividing the total width bu available width per line
// 	const numberOfLines = Math.ceil(text.offsetWidth / availableWidthPerLine);
// 	return numberOfLines;
// };

export const calculateNumberOfLines = (text, width) => {
	const textWidth = text.offsetWidth;
	const availableWidthPerLine = width;
	const numberOfLines = Math.ceil(textWidth / availableWidthPerLine);
	return numberOfLines;
};

export const notificationTimeCalculator = (date, time) => {
	// Parse the input date and time
	const dateParts = date.split('-');
	const timeParts = time.split(':');

	const notificationDateTime = new Date(
		Date.UTC(
			parseInt(dateParts[0], 10),
			parseInt(dateParts[1], 10) - 1, // Month is zero-indexed
			parseInt(dateParts[2], 10),
			parseInt(timeParts[0], 10),
			parseInt(timeParts[1], 10),
			parseInt(timeParts[2], 10)
		)
	);

	// Calculate the time difference in milliseconds
	const timeDifference = Date.now() - notificationDateTime.getTime();

	// Define conversion factors
	const minuteInMs = 60 * 1000;
	const hourInMs = 60 * minuteInMs;
	const dayInMs = 24 * hourInMs;
	const weekInMs = 7 * dayInMs;
	const monthInMs = 30 * dayInMs;
	const yearInMs = 365 * dayInMs;

	// Calculate the time in different units
	if (timeDifference < minuteInMs) {
		return 'Vừa xong';
	} else if (timeDifference < hourInMs) {
		return `${Math.floor(timeDifference / minuteInMs)} phút trước`;
	} else if (timeDifference < dayInMs) {
		return `${Math.floor(timeDifference / hourInMs)} giờ trước`;
	} else if (timeDifference < weekInMs) {
		return `${Math.floor(timeDifference / dayInMs)} ngày trước`;
	} else if (timeDifference < monthInMs) {
		return `${Math.floor(timeDifference / weekInMs)} tuần trước`;
	} else if (timeDifference < yearInMs) {
		return `${Math.floor(timeDifference / monthInMs)} tháng trước`;
	} else {
		return `${Math.floor(timeDifference / yearInMs)} năm trước`;
	}
};

export const isVietnamesePhoneNumber = (number) => {
	return /(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/.test(number);
};

export const convertTimestampToYYYYMMDD = (timestamp) => {
	const date = new Date(timestamp);
	return `${String(date.getDate()).padStart(2, '0')}/${String(
		date.getMonth() + 1
	).padStart(2, '0')}/${date.getFullYear()}`;
};

export const convertTimestampToTime = (timestamp) => {
	const date = new Date(timestamp);
	let hours = date.getHours().toString();
	let minutes = date.getMinutes().toString();

	hours = hours.length === 1 ? '0' + hours : hours;
	minutes = minutes.length === 1 ? '0' + minutes : minutes;

	return `${hours}:${minutes}`;
};

export const createSlug = (text) => {
	return text
		.toString()
		.toLowerCase()
		.trim()
		.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a')
		.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e')
		.replace(/ì|í|ị|ỉ|ĩ/g, 'i')
		.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o')
		.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u')
		.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y')
		.replace(/đ/g, 'd')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
};

export const createDateTime = (dateString, timeString) => {
	const datePart = new Date(dateString);
	const year = datePart.getUTCFullYear();
	const month = datePart.getUTCMonth();
	const day = datePart.getUTCDate();

	// Combine the date and time
	const dateTimeString = `${year}-${String(month + 1).padStart(
		2,
		'0'
	)}-${String(day).padStart(2, '0')}T${timeString}Z`;

	return new Date(dateTimeString);
};
