function interactionsToPerform() {
	return [];
}

async function awaitNewFrame() {
	return new Promise(resolve => {
		requestAnimationFrame(resolve);
	});
}

function generateColorChangeData() {
	const res = [];
	const time = new Date(Date.UTC(2018, 0, 1, 0, 0, 0, 0));

	for (let i = 0; i < 30; ++i) {
		res.push({
			time: time.getTime() / 1000,
			value: 50 + Math.sin(i * 0.3) * 30,
			color: i % 5 === 0 ? 'green' : 'purple',
		});
		time.setUTCDate(time.getUTCDate() + 1);
	}
	return res;
}

let lineSeries;
let areaSeries;
let baselineSeries;

async function beforeInteractions(container) {
	const chart = LightweightCharts.createChart(container, {
		layout: { attributionLogo: false },
	});

	lineSeries = chart.addSeries(LightweightCharts.LineSeries, {
		lineWidth: 2,
		lineStyle: LightweightCharts.LineStyle.Dashed,
		color: '#ff0000',
	});
	lineSeries.setData(generateColorChangeData());

	await awaitNewFrame();
	lineSeries.applyOptions({ lineStyle: LightweightCharts.LineStyle.Dotted });
	await awaitNewFrame();
	lineSeries.applyOptions({ lineStyle: LightweightCharts.LineStyle.LargeDashed });
	await awaitNewFrame();
	lineSeries.applyOptions({ lineStyle: LightweightCharts.LineStyle.SparseDotted });
	await awaitNewFrame();
	lineSeries.applyOptions({ lineStyle: LightweightCharts.LineStyle.Solid });

	areaSeries = chart.addSeries(LightweightCharts.AreaSeries, {
		lineWidth: 2,
		lineStyle: LightweightCharts.LineStyle.Dashed,
		lineColor: '#ff0000',
		topColor: 'rgba(255, 0, 0, 0.3)',
		bottomColor: 'rgba(255, 0, 0, 0.05)',
	});
	areaSeries.setData(generateColorChangeData());

	baselineSeries = chart.addSeries(LightweightCharts.BaselineSeries, {
		baseValue: { type: 'price', price: 50 },
		lineWidth: 2,
		lineStyle: LightweightCharts.LineStyle.Dashed,
	});
	const baselineData = generateColorChangeData().map((item, i) => ({
		...item,
		topLineColor: i % 4 === 0 ? 'green' : undefined,
		bottomLineColor: i % 4 === 0 ? 'purple' : undefined,
	}));
	baselineSeries.setData(baselineData);

	chart.timeScale().fitContent();

	return Promise.resolve();
}

async function afterInteractions() {
	lineSeries.applyOptions({ lineType: LightweightCharts.LineType.WithSteps });
	await new Promise(resolve => requestAnimationFrame(resolve));

	lineSeries.applyOptions({ lineType: LightweightCharts.LineType.Curved });
	await new Promise(resolve => requestAnimationFrame(resolve));

	areaSeries.applyOptions({ lineStyle: LightweightCharts.LineStyle.SparseDotted });
	await new Promise(resolve => requestAnimationFrame(resolve));

	baselineSeries.applyOptions({ lineStyle: LightweightCharts.LineStyle.LargeDashed });
	await new Promise(resolve => requestAnimationFrame(resolve));
}
