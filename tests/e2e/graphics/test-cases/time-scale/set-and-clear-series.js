function runTestCase(container) {
	const data = [
		{ time: 1609459200, value: 500 },
		{ time: 1609545600, value: 600 },
		{ time: 1609632000, value: 700 },
	];

	const chart = window.chart = LightweightCharts.createChart(container, {
		timeScale: {
			barSpacing: 40,
		},
		layout: { attributionLogo: false },
	});

	const series = chart.addSeries(LightweightCharts.LineSeries);
	series.setData(data);
	series.setData([]);
	series.setData(data);
}
