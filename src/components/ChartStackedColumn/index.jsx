import { Bar } from 'react-chartjs-2';
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
} from 'chart.js';

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend
);

const ChartStackedColumn = ({ data, title }) => {
	if (JSON.stringify(data) === '{}') {
		return <p>Data the chart</p>;
	}

	if (title === '') {
		return <p>Name the chart</p>;
	}

	// Chart options
	const options = {
		responsive: true,
		plugins: {
			legend: {
				position: 'bottom',
			},
			title: {
				display: true,
				text: title,
				position: 'bottom',
			},
		},
		scales: {
			x: {
				stacked: true,
			},
			y: {
				stacked: true,
			},
		},
	};

	return (
		<Bar
			data={data}
			options={options}
		/>
	);
};

export default ChartStackedColumn;
