import { useState, useEffect, useRef, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import classNames from 'classnames/bind';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faSortDown,
	faFileExcel,
	faFileCsv,
} from '@fortawesome/free-solid-svg-icons';
import * as XLSX from 'xlsx';

import styles from './ManagerStatistic.module.scss';
import ChartStackedColumn from '../ChartStackedColumn';
import { reloadIcon } from '../../store/icons';

const cx = classNames.bind(styles);
const BE_BASE_URL = import.meta.env.VITE_BE_BASE_URL;

const ManagerStatistic = ({ type }) => {
	const [dataChart, setDataChart] = useState({});
	const [titleChart, setTitleChart] = useState('');
	const [labelChart, setLabelChart] = useState([]);
	const [valueChart, setValueChart] = useState([]);
	const [buttonChild, setButtonChild] = useState('');
	const [isShowExport, setIsShowExport] = useState(false);
	const [dateSelected, setDateSelected] = useState('');
	const [weekSelected, setWeekSelected] = useState(0);
	const [monthSelected, setMonthSelected] = useState(0);
	const [quarterSelected, setQuarterSelected] = useState(0);
	const [yearSelected, setYearSelected] = useState(0);
	const [isShowWeekDropdown, setIsShowWeekDropdown] = useState(false);
	const [isShowMonthDropdown, setIsShowMonthDropdown] = useState(false);
	const [isShowQuarterDropdown, setIsShowQuarterDropdown] = useState(false);
	const [isShowYearDropdown, setIsShowYearDropdown] = useState(false);
	const [figuresData, setFiguresData] = useState([]);

	const dispatch = useDispatch();
	const exportOptionRef = useRef(null);
	const weekRef = useRef(null);
	const monthRef = useRef(null);
	const quarterRef = useRef(null);
	const yearRef = useRef(null);

	const onChangeManagerState = (newState) => {
		dispatch({ type: 'MANAGER/CHANGE_STATE', payload: newState });

		if (newState.includes('figures')) {
			setButtonChild('figures/day');
		} else {
			setButtonChild('');
		}
	};

	const onChangeButtonChild = (state) => {
		if (buttonChild !== '') {
			const [first, last] = buttonChild.split('/');

			setButtonChild(`${first}/${state}`);
		}
	};

	const getCurrentDate = () => {
		const currentDate = new Date();

		return `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;
	};

	const getDateWeek = () => {
		const currentDate = new Date();
		const januaryFirst =
			new Date(currentDate.getFullYear(), 0, 1);
		const daysToNextMonday =
			(
				januaryFirst.getDay() === 1
			) ? 0 :
			(
				7 - januaryFirst.getDay()
			) % 7;
		const nextMonday =
			new Date(currentDate.getFullYear(), 0,
				januaryFirst.getDate() + daysToNextMonday);

		return (
			       currentDate < nextMonday
		       ) ? 52 :
		       (
			       currentDate > nextMonday ? Math.ceil(
				       (
					       currentDate - nextMonday
				       ) / (
					       24 * 3600 * 1000
				       ) / 7) : 1
		       );
	};

	const getCurrentMonth = () => {
		const currentDate = new Date();

		return currentDate.getMonth() + 1;
	};

	const getCurrentQuarter = () => {
		const currentDate = new Date();

		return Math.ceil((
			                 currentDate.getMonth() + 1
		                 ) / 3);
	};

	const getCurrentYear = () => {
		const currentDate = new Date();

		return currentDate.getFullYear();
	};

	const formatTime = (time) => {
		const [hour, minute, second] = time.split(':');

		return `${hour}:${minute}`;
	};

	const formatDate = (date) => {
		const [result, _] = date.split('T');

		return result;
	};

	const getFiguresDataWithDay = () => {
		if (dateSelected === '') {
			return;
		}

		axios.get(`${BE_BASE_URL}/manager/figures`, {
			params: {
				time: dateSelected,
				type: 'day',
			},
		}).then(res => {
			if (res?.data) {
				setFiguresData(res.data);
			}
		}).catch(err => {
			console.log(err);
		});
	};

	const getFiguresDataManyDays = (time, type) => {
		if (time === 0) {
			return;
		}

		axios.get(`${BE_BASE_URL}/manager/figures`, {
			params: {
				time,
				type,
			},
		}).then(res => {
			if (res?.data) {
				setFiguresData(res.data);
			}
		}).catch(err => {
			console.log(err);
		});
	};

	const reloadHandler = () => {
		if (buttonChild.includes('day')) {
			getFiguresDataWithDay();
		} else if (buttonChild.includes('week')) {
			getFiguresDataManyDays(weekSelected, 'week');
		} else if (buttonChild.includes('month')) {
			getFiguresDataManyDays(monthSelected, 'month');
		} else if (buttonChild.includes('quarter')) {
			getFiguresDataManyDays(quarterSelected, 'quarter');
		} else if (buttonChild.includes('year')) {
			getFiguresDataManyDays(yearSelected, 'year');
		}
	};

	const exportToExcel = () => {
		const fileName = buttonChild.includes('day') ?
		                 `Bảng thống kê thu nhập ngày ${dateSelected}` :
		                 buttonChild.includes('week') ?
		                 `Bảng thống kê thu nhập tuần ${weekSelected}` :
		                 buttonChild.includes('week') ?
		                 `Bảng thống kê thu nhập tháng ${monthSelected}` :
		                 buttonChild.includes('week') ?
		                 `Bảng thống kê thu nhập quý ${quarterSelected}` :
		                 `Bảng thống kê thu nhập năm ${yearSelected}`;

		// Create headers with merged cells for the same structure
		const headers = [
			['STT', 'Chuyến xe', 'Lượt đi', '', '', 'Lượt về', '', '', 'Giá vé', 'Thời gian mua vé', 'SĐT người mua'],
			['', '', 'Chỗ', 'Ngày đi', 'Xe trung chuyển', 'Chỗ', 'Ngày về', 'Xe trung chuyển', '', '', ''],
		];

		// Map data into the table format
		const formattedData = figuresData.map((item, index) => [
			index + 1, // STT
			`${item.start_place} - ${item.end_place}`, // Chuyến xe
			item.seat, // Chỗ (Lượt đi)
			`${formatTime(item.go_time)} ${formatDate(item.go_date)}`, // Ngày đi
			item.address || '', // Xe trung chuyển (Lượt đi)
			item.seat_back || '', // Chỗ (Lượt về)
			item.back_time
			? `${formatTime(item.back_time)} ${formatDate(item.back_date)}`
			: '', // Ngày về
			item.back_address || '', // Xe trung chuyển (Lượt về)
			new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price), // Giá vé
			`${formatTime(item.time)} ${formatDate(item.date)}`, // Thời gian mua vé
			item.phone, // SĐT người mua
		]);

		// Calculate total price
		const totalPrice = figuresData.reduce((sum, item) => sum + item.price, 0);

		// Add "Tổng cộng" row
		const totalRow = [
			'', // Empty for STT
			'Tổng cộng',
			'', // Empty for Chỗ
			'', // Empty for Ngày đi
			'', // Empty for Xe trung chuyển
			'', // Empty for Chỗ (Lượt về)
			'', // Empty for Ngày về
			'', // Empty for Xe trung chuyển
			totalPrice, // Total price
			'', // Empty for Thời gian mua vé
			'', // Empty for SĐT người mua
		];

		const formattedTotalRow = [
			...totalRow.slice(0, 8),
			new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice),
			...totalRow.slice(9),
		];

		// Combine headers and data
		const worksheetData = [...headers, ...formattedData, formattedTotalRow];

		// Create a worksheet
		const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
		const endRow = figuresData.length + 2;

		// Merge cells for the header
		worksheet['!merges'] = [
			{ s: { r: 0, c: 2 }, e: { r: 0, c: 4 } }, // Merge "Lượt đi"
			{ s: { r: 0, c: 5 }, e: { r: 0, c: 7 } }, // Merge "Lượt về"
			{ s: { r: endRow, c: 1 }, e: { r: endRow, c: 7 } }, // Merge "Tổng cộng"
		];

		// Adjust column widths
		worksheet['!cols'] = [
			{ wch: 5 },  // STT
			{ wch: 20 }, // Chuyến xe
			{ wch: 10 }, // Chỗ (Lượt đi)
			{ wch: 20 }, // Ngày đi
			{ wch: 20 }, // Xe trung chuyển (Lượt đi)
			{ wch: 10 }, // Chỗ (Lượt về)
			{ wch: 20 }, // Ngày về
			{ wch: 20 }, // Xe trung chuyển (Lượt về)
			{ wch: 10 }, // Giá vé
			{ wch: 20 }, // Thời gian mua vé
			{ wch: 15 }, // SĐT người mua
		];

		// Apply styles for header cells
		const headerStyle = {
			font: { name: 'Times New Roman', bold: true },
			alignment: { horizontal: 'center', vertical: 'center' },
		};

		headers.forEach((row, rowIndex) => {
			row.forEach((_, colIndex) => {
				const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
				if (!worksheet[cellRef]) {
					return;
				}
				worksheet[cellRef].s = headerStyle;
			});
		});

		// Apply font style for the entire sheet
		Object.keys(worksheet).forEach((cellRef) => {
			if (cellRef[0] === '!') {
				return;
			} // Skip special keys like !merges or !cols
			if (!worksheet[cellRef].s) {
				worksheet[cellRef].s = {};
			} // Initialize style if undefined
			worksheet[cellRef].s.font = { name: 'Times New Roman' }; // Set font to Times New Roman
		});

		// Create a workbook and append the worksheet
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

		// Export the workbook to an Excel file
		XLSX.writeFile(workbook, `${fileName}.xlsx`);
	};

	const exportToCSV = () => {
		const fileName = buttonChild.includes('day') ?
		                 `Bảng thống kê thu nhập ngày ${dateSelected}` :
		                 buttonChild.includes('week') ?
		                 `Bảng thống kê thu nhập tuần ${weekSelected}` :
		                 buttonChild.includes('week') ?
		                 `Bảng thống kê thu nhập tháng ${monthSelected}` :
		                 buttonChild.includes('week') ?
		                 `Bảng thống kê thu nhập quý ${quarterSelected}` :
		                 `Bảng thống kê thu nhập năm ${yearSelected}`;

		// Define headers
		const headers = [
			['STT', 'Chuyến xe', 'Lượt đi Chỗ', 'Lượt đi Ngày', 'Lượt đi Xe trung chuyển',
			 'Lượt về Chỗ', 'Lượt về Ngày', 'Lượt về Xe trung chuyển',
			 'Giá vé', 'Thời gian mua vé', 'SĐT người mua'],
		];

		// Map data into rows
		const rows = figuresData.map((item, index) => [
			index + 1,
			`${item.start_place} - ${item.end_place}`,
			item.seat,
			`${formatTime(item.go_time)} ${formatDate(item.go_date)}`,
			item.address || '',
			item.seat_back || '',
			item.back_time
			? `${formatTime(item.back_time)} ${formatDate(item.back_date)}`
			: '',
			item.back_address || '',
			item.price, // Keep numeric value for total calculation
			`${formatTime(item.time)} ${formatDate(item.date)}`,
			item.phone,
		]);

		// Calculate total price
		const totalPrice = figuresData.reduce((sum, item) => sum + item.price, 0);

		// Add "Tổng cộng" row
		const totalRow = [
			'', // Empty for STT
			'Tổng cộng',
			'', // Empty for Chỗ
			'', // Empty for Ngày đi
			'', // Empty for Xe trung chuyển
			'', // Empty for Chỗ (Lượt về)
			'', // Empty for Ngày về
			'', // Empty for Xe trung chuyển
			totalPrice, // Total price
			'', // Empty for Thời gian mua vé
			'',  // Empty for SĐT người mua
		];

		// Format price in rows and total row
		const formattedRows = rows.map((row) => [
			...row.slice(0, 8), // Keep first 8 columns
			new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(row[8]),
			...row.slice(9), // Skip price column and keep remaining
		]);

		const formattedTotalRow = [
			...totalRow.slice(0, 8),
			new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice),
			...totalRow.slice(9),
		];

		// Combine headers, rows, and total row
		const csvContent = [...headers, ...formattedRows, formattedTotalRow]
			.map((row) => row.map((cell) => `"${cell}"`).join(',')) // Escape with quotes
			.join('\n'); // Join rows by newline

		// Create a Blob and download it
		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.setAttribute('download', `${fileName}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	useEffect(() => {
		if (type === 'chart') {
			axios
				.get(`${BE_BASE_URL}/simple/manager-garage`)
				.then((res) => {
					if (res?.data) {
						setLabelChart(res.data.map((item) => item.name));
					}
				})
				.catch((error) => console.log(error));

			axios
				.get(`${BE_BASE_URL}/parameter/ticket`, {
					params: {
						timeInterval: 'yearly',
						startDate: '2024-01-01',
						endDate: '2024-12-31',
					},
				})
				.then((res) => {
					if (res?.data) {
						setValueChart(res.data);
					}
				})
				.catch((error) => console.log(error));
		} else if (type === 'figures') {
			setDateSelected(getCurrentDate());
			setWeekSelected(getDateWeek());
			setMonthSelected(getCurrentMonth());
			setQuarterSelected(getCurrentQuarter());
			setYearSelected(getCurrentYear());
		}
	}, [type]);

	useEffect(() => {
		if (buttonChild.includes('day')) {
			getFiguresDataWithDay();
			setWeekSelected(getDateWeek());
			setMonthSelected(getCurrentMonth());
			setQuarterSelected(getCurrentQuarter());
			setYearSelected(getCurrentYear());
		} else if (buttonChild.includes('week')) {
			getFiguresDataManyDays(weekSelected, 'week');
			setDateSelected(getCurrentDate());
			setMonthSelected(getCurrentMonth());
			setQuarterSelected(getCurrentQuarter());
			setYearSelected(getCurrentYear());
		} else if (buttonChild.includes('month')) {
			getFiguresDataManyDays(monthSelected, 'month');
			setDateSelected(getCurrentDate());
			setWeekSelected(getDateWeek());
			setQuarterSelected(getCurrentQuarter());
			setYearSelected(getCurrentYear());
		} else if (buttonChild.includes('quarter')) {
			getFiguresDataManyDays(quarterSelected, 'quarter');
			setDateSelected(getCurrentDate());
			setWeekSelected(getDateWeek());
			setMonthSelected(getCurrentMonth());
			setYearSelected(getCurrentYear());
		} else if (buttonChild.includes('year')) {
			getFiguresDataManyDays(yearSelected, 'year');
			setDateSelected(getCurrentDate());
			setWeekSelected(getDateWeek());
			setMonthSelected(getCurrentMonth());
			setQuarterSelected(getCurrentQuarter());
		}
	}, [buttonChild]);

	useEffect(() => {
		if (buttonChild.includes('day') && dateSelected !== '') {
			getFiguresDataWithDay();
		}
	}, [dateSelected]);

	useEffect(() => {
		if (buttonChild.includes('week') && weekSelected !== 0) {
			getFiguresDataManyDays(weekSelected, 'week');
		}
	}, [weekSelected]);

	useEffect(() => {
		if (buttonChild.includes('month') && monthSelected !== 0) {
			getFiguresDataManyDays(monthSelected, 'month');
		}
	}, [monthSelected]);

	useEffect(() => {
		if (buttonChild.includes('quarter') && quarterSelected !== 0) {
			getFiguresDataManyDays(quarterSelected, 'quarter');
		}
	}, [quarterSelected]);

	useEffect(() => {
		if (buttonChild.includes('year') && yearSelected !== 0) {
			getFiguresDataManyDays(yearSelected, 'year');
		}
	}, [yearSelected]);

	// Function to close the calendar when clicking outside of it
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				exportOptionRef.current &&
				!exportOptionRef.current.contains(event.target)
			) {
				setIsShowExport(false);
			}
			if (
				weekRef.current &&
				!weekRef.current.contains(event.target)
			) {
				setIsShowWeekDropdown(false);
			}
			if (
				monthRef.current &&
				!monthRef.current.contains(event.target)
			) {
				setIsShowMonthDropdown(false);
			}
			if (
				quarterRef.current &&
				!quarterRef.current.contains(event.target)
			) {
				setIsShowQuarterDropdown(false);
			}
			if (
				yearRef.current &&
				!yearRef.current.contains(event.target)
			) {
				setIsShowYearDropdown(false);
			}
		};

		// Add event listener when the calendar is visible
		if (
			isShowExport ||
			isShowWeekDropdown ||
			isShowMonthDropdown ||
			isShowQuarterDropdown ||
			isShowYearDropdown
		) {
			document.addEventListener('click', handleClickOutside);
		}

		// Clean up the event listener on unmount
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	}, [isShowExport,
	    isShowWeekDropdown,
	    isShowMonthDropdown,
	    isShowQuarterDropdown,
	    isShowYearDropdown]);

	useEffect(() => {
		if (labelChart.length > 0 && valueChart.length > 0) {
			const data = {
				labels: labelChart,
				datasets: [
					{
						label: 'Số lượng chuyến xe',
						data: [
							valueChart[0].number_of_schedules,
							valueChart[1].number_of_schedules,
						],
						backgroundColor: 'rgba(75, 192, 192, 0.6)',
					},
					{
						label: 'Số lượng vé xe bán ra',
						data: [
							valueChart[0].tickets_sold,
							valueChart[1].tickets_sold,
						],
						backgroundColor: 'rgba(153, 102, 255, 0.6)',
					},
				],
			};

			setDataChart(data);
			setTitleChart('Biểu đồ');
		}
	}, [labelChart, valueChart]);

	const showExportOption = () => {
		if (isShowExport) {
			setIsShowExport(false);
		} else {
			setIsShowExport(true);
		}
	};

	const renderWeek = () => {
		const result = [];

		for (let i = 1; i <= 52; i++) {
			result.push(
				<p className={cx('item', weekSelected === i && 'active')}
				   key={i}
				   onClick={() => {
					   setWeekSelected(i);
					   setIsShowWeekDropdown(false);
				   }}
				>
					{i}
				</p>,
			);
		}

		return result;
	};

	const renderMonth = () => {
		const result = [];

		for (let i = 1; i <= 12; i++) {
			result.push(
				<p className={cx('item', monthSelected === i && 'active')}
				   key={i}
				   onClick={() => {
					   setMonthSelected(i);
					   setIsShowMonthDropdown(false);
				   }}
				>
					{i}
				</p>,
			);
		}

		return result;
	};

	const renderQuarter = () => {
		const result = [];

		for (let i = 1; i <= 4; i++) {
			result.push(
				<p className={cx('item', quarterSelected === i && 'active')}
				   key={i}
				   onClick={() => {
					   setQuarterSelected(i);
					   setIsShowQuarterDropdown(false);
				   }}
				>
					{i}
				</p>,
			);
		}

		return result;
	};

	const renderYear = () => {
		const result = [];
		const currentYear = new Date().getFullYear();

		for (let i = 2010; i <= currentYear; i++) {
			result.push(
				<p className={cx('item', yearSelected === i && 'active')}
				   key={i}
				   onClick={() => {
					   setYearSelected(i);
					   setIsShowYearDropdown(false);
				   }}
				>
					{i}
				</p>,
			);
		}

		return result;
	};

	return (
		<div className={cx('wrap')}>
			<div className={cx('navbar')}>
				<button
					style={{
						backgroundColor:
							type === 'chart'
							? 'var(--primary-color)'
							: '#39a7ff',
					}}
					onClick={() => onChangeManagerState('manager-statistic/chart')}
				>
					Biểu đồ
				</button>
				<button
					style={{
						backgroundColor:
							type === 'figures' ? 'var(--primary-color)' : '#39a7ff',
					}}
					onClick={() => onChangeManagerState('manager-statistic/figures')}
				>
					Số liệu
				</button>
				<div className={cx('button-child-wrap')}
				     style={{
					     maxWidth: buttonChild.includes('figures') ? '500px' : 0,
					     padding: buttonChild.includes('figures') ? '4px' : 0,
					     borderTop: buttonChild.includes('figures') ? 'var(--border)' : 'none',
					     borderRight: buttonChild.includes('figures') ? 'var(--border)' : 'none',
					     borderBottom: buttonChild.includes('figures') ? 'var(--border)' : 'none',
				     }}
				>
					<button
						style={{
							backgroundColor:
								buttonChild.includes('day') ? 'var(--primary-color)' : '#39a7ff',
						}}
						onClick={() => onChangeButtonChild('day')}
					>
						Ngày
					</button>
					<button
						style={{
							backgroundColor:
								buttonChild.includes('week') ? 'var(--primary-color)' : '#39a7ff',
						}}
						onClick={() => onChangeButtonChild('week')}
					>
						Tuần
					</button>
					<button
						style={{
							backgroundColor:
								buttonChild.includes('month') ? 'var(--primary-color)' : '#39a7ff',
						}}
						onClick={() => onChangeButtonChild('month')}
					>
						Tháng
					</button>
					<button
						style={{
							backgroundColor:
								buttonChild.includes('quarter') ? 'var(--primary-color)' : '#39a7ff',
						}}
						onClick={() => onChangeButtonChild('quarter')}
					>
						Quý
					</button>
					<button
						style={{
							backgroundColor:
								buttonChild.includes('year') ? 'var(--primary-color)' : '#39a7ff',
						}}
						onClick={() => onChangeButtonChild('year')}
					>
						Năm
					</button>
				</div>
			</div>
			{type === 'chart' && <div className={cx('content')}>
				<ChartStackedColumn
					data={dataChart}
					title={titleChart}
				/>
				<div className={cx('option')}></div>
			</div>}
			{type === 'figures' && <div className={cx('content')}>
				<div className={cx('title')}>
					<div className={cx('input')}>
						<p>
							{
								buttonChild.includes('day') ? 'Ngày: ' :
								buttonChild.includes('week') ? 'Tuần: ' :
								buttonChild.includes('month') ? 'Tháng: ' :
								buttonChild.includes('quarter') ? 'Quý: ' :
								buttonChild.includes('year') ? 'Năm: ' : ''
							}
						</p>
						{buttonChild.includes('day') &&
						 <input type="date" value={dateSelected}
						        onChange={(e) => setDateSelected(e.target.value)}
						 />}
						{buttonChild.includes('week') && <div
							className={cx('select')}
							ref={weekRef}
						>
							<p onClick={() => setIsShowWeekDropdown(true)}
							>
								{weekSelected}
							</p>
							{isShowWeekDropdown && <div className={cx('option')}>
								{renderWeek()}
							</div>}
						</div>}
						{buttonChild.includes('month') && <div
							className={cx('select')}
							ref={monthRef}
						>
							<p onClick={() => setIsShowMonthDropdown(true)}
							>
								{monthSelected}
							</p>
							{isShowMonthDropdown && <div className={cx('option')}>
								{renderMonth()}
							</div>}
						</div>}
						{buttonChild.includes('quarter') && <div
							className={cx('select')}
							ref={quarterRef}
						>
							<p onClick={() => setIsShowQuarterDropdown(true)}
							>
								{quarterSelected}
							</p>
							{isShowQuarterDropdown && <div className={cx('option')}>
								{renderQuarter()}
							</div>}
						</div>}
						{buttonChild.includes('year') && <div
							className={cx('select')}
							ref={yearRef}
						>
							<p onClick={() => setIsShowYearDropdown(true)}
							>
								{yearSelected}
							</p>
							{isShowYearDropdown && <div className={cx('option')}>
								{renderYear()}
							</div>}
						</div>}
					</div>
					<p>Bảng thống kê thu nhập theo {
						buttonChild.includes('day') ? 'ngày' :
						buttonChild.includes('week') ? 'tuần' :
						buttonChild.includes('month') ? 'tháng' :
						buttonChild.includes('quarter') ? 'quý' :
						buttonChild.includes('year') ? 'năm' : ''
					}</p>
					<div className={cx('reload')} onClick={reloadHandler}>{reloadIcon}</div>
					<div className={cx('export')}
					     onClick={showExportOption}
					     style={{
						     borderBottomLeftRadius: isShowExport ? '0' : '10px',
						     borderBottomRightRadius: isShowExport ? '0' : '10px',
					     }}
					     ref={exportOptionRef}
					>
						<p>Xuất file</p>
						<FontAwesomeIcon className={cx('icon')} icon={faSortDown}/>
						<div className={cx('option')}
						     style={{
							     maxHeight: isShowExport ? '100px' : 0,
							     border: isShowExport ? '1px solid var(--green-color)' : 'none',
						     }}
						>
							<div className={cx('item')} onClick={exportToExcel}>
								<p>.xlxs</p>
								<FontAwesomeIcon className={cx('icon')} icon={faFileExcel}/>
							</div>
							<div className={cx('item')} onClick={exportToCSV}>
								<p>.csv</p>
								<FontAwesomeIcon className={cx('icon')} icon={faFileCsv}/>
							</div>
						</div>
					</div>
				</div>
				<table>
					<thead>
					<tr>
						<th rowSpan="2">STT</th>
						<th rowSpan="2">Chuyến xe</th>
						<th colSpan="3">Lượt đi</th>
						<th colSpan="3">Lượt về</th>
						<th rowSpan="2">Giá vé</th>
						<th rowSpan="2">Thời gian mua vé</th>
						<th rowSpan="2">SĐT người mua</th>
					</tr>
					<tr>
						<th>Chỗ</th>
						<th>Ngày đi</th>
						<th>Xe trung chuyển</th>
						<th>Chỗ</th>
						<th>Ngày về</th>
						<th>Xe trung chuyển</th>
					</tr>
					</thead>
					<tbody>
					{figuresData.map((item, index) =>
						<tr key={index}>
							<td>{index + 1}</td>
							<td>{item.start_place} - {item.end_place}</td>
							<td>{item.seat}</td>
							<td>{formatTime(item.go_time)} {formatDate(item.go_date)}</td>
							<td>{item.address || ''}</td>
							<td>{item.seat_back || ''}</td>
							<td>{item.back_time ? formatTime(item.back_time) + ' ' + formatDate(item.back_date) :
							     ''}</td>
							<td>{item.back_address || ''}</td>
							<td>
								{
									new Intl.NumberFormat(
										'vi-VN',
										{
											style: 'currency',
											currency: 'VND',
										},
									).format(item.price)
								}
							</td>
							<td>{formatTime(item.time)} {formatDate(item.date)}</td>
							<td>{item.phone}</td>
						</tr>,
					)}
					<tr>
						<th colSpan="8">Tổng cộng</th>
						<th colSpan="2" className={cx('text-left', 'text-red')}>
							{
								new Intl.NumberFormat(
									'vi-VN',
									{
										style: 'currency',
										currency: 'VND',
									},
								).format(figuresData.reduce((sum, item) => sum + item.price, 0))
							}
						</th>
					</tr>
					</tbody>
				</table>
			</div>}
		</div>
	);
};

export default ManagerStatistic;
