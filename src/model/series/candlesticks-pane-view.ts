import { Coordinate } from '../../model/coordinate';
import { InternalHitTestCandidate } from '../../model/internal-hit-test';
import { SeriesBarColorer } from '../../model/series-bar-colorer';
import { SeriesPlotRow } from '../../model/series-data';
import { TimePointIndex } from '../../model/time-data';
import {
	CandlestickItem,
	PaneRendererCandlesticks,
} from '../../renderers/candlesticks-renderer';
import { hitTestSeriesRange } from '../../renderers/series-hit-test';

import { BarsPaneViewBase } from './bars-pane-view-base';

export class SeriesCandlesticksPaneView extends BarsPaneViewBase<'Candlestick', CandlestickItem, PaneRendererCandlesticks> {
	protected readonly _renderer: PaneRendererCandlesticks = new PaneRendererCandlesticks();

	protected override _hitTestImpl(x: Coordinate, y: Coordinate): InternalHitTestCandidate | null {
		return hitTestSeriesRange(
			this._items,
			this._itemsVisibleRange,
			x,
			y,
			this._model.timeScale().barSpacing(),
			this._series.options().hitTestTolerance,
			(bar: CandlestickItem, out: [Coordinate, Coordinate]) => {
				out[0] = bar.highY;
				out[1] = bar.lowY;
			}
		);
	}

	protected _createRawItem(time: TimePointIndex, bar: SeriesPlotRow<'Candlestick'>, colorer: SeriesBarColorer<'Candlestick'>): CandlestickItem {
		return {
			...this._createDefaultItem(time, bar, colorer),
			...colorer.barStyle(time),
		};
	}

	protected _prepareRendererData(): void {
		const candlestickStyleProps = this._series.options();

		this._renderer.setData({
			bars: this._items,
			barSpacing: this._model.timeScale().barSpacing(),
			wickVisible: candlestickStyleProps.wickVisible,
			borderVisible: candlestickStyleProps.borderVisible,
			visibleRange: this._itemsVisibleRange,
		});
	}
}
