function runTestCase(container) {
	const chart = window.chart = LightweightCharts.createChart(container, { layout: { attributionLogo: false } });

	const mainSeries = chart.addSeries(LightweightCharts.LineSeries);

	mainSeries.setData([
		{ time: 1, value: 1, color: 'red' },
		{ time: 2, value: 2, color: 'green' },
		{ time: 3, value: 1, color: 'blue' },
	]);

	chart.timeScale().fitContent();
}
