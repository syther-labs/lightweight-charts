function generateData() {
	const res = [];
	const time = new Date(Date.UTC(2018, 0, 1, 0, 0, 0, 0));
	for (let i = 0; i < 20; ++i) {
		res.push({
			time: time.getTime() / 1000,
			value: i,
		});

		time.setUTCDate(time.getUTCDate() + 1);
	}
	return res;
}

function runTestCase(container) {
	const chart = window.chart = LightweightCharts.createChart(container, { layout: { attributionLogo: false } });

	const mainSeries = chart.addSeries(LightweightCharts.LineSeries);
	mainSeries.setData(generateData());
	chart.timeScale().setVisibleLogicalRange({
		from: 0,
		to: 30,
	});

	return new Promise(resolve => {
		setTimeout(() => {
			chart.timeScale().applyOptions({ fixRightEdge: true });

			setTimeout(() => {
				chart.timeScale().setVisibleLogicalRange({
					from: 0,
					to: 30,
				});
				resolve();
			}, 100);
		}, 100);
	});
}
