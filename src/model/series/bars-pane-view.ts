import { Coordinate } from '../../model/coordinate';
import { InternalHitTestCandidate } from '../../model/internal-hit-test';
import { SeriesBarColorer } from '../../model/series-bar-colorer';
import { SeriesPlotRow } from '../../model/series-data';
import { SeriesType } from '../../model/series-options';
import { TimePointIndex } from '../../model/time-data';
import {
	BarItem,
	PaneRendererBars,
} from '../../renderers/bars-renderer';
import { hitTestSeriesRange } from '../../renderers/series-hit-test';

import { BarsPaneViewBase } from './bars-pane-view-base';

export class SeriesBarsPaneView extends BarsPaneViewBase<'Bar', BarItem, PaneRendererBars> {
	protected readonly _renderer: PaneRendererBars = new PaneRendererBars();

	protected override _hitTestImpl(x: Coordinate, y: Coordinate): InternalHitTestCandidate | null {
		return hitTestSeriesRange(
			this._items,
			this._itemsVisibleRange,
			x,
			y,
			this._model.timeScale().barSpacing(),
			this._series.options().hitTestTolerance,
			(bar: BarItem, out: [Coordinate, Coordinate]) => {
				out[0] = bar.highY;
				out[1] = bar.lowY;
			}
		);
	}

	protected _createRawItem(time: TimePointIndex, bar: SeriesPlotRow<SeriesType>, colorer: SeriesBarColorer<'Bar'>): BarItem {
		return {
			...this._createDefaultItem(time, bar, colorer),
			...colorer.barStyle(time),
		};
	}

	protected _prepareRendererData(): void {
		const barStyleProps = this._series.options();

		this._renderer.setData({
			bars: this._items,
			barSpacing: this._model.timeScale().barSpacing(),
			openVisible: barStyleProps.openVisible,
			thinBars: barStyleProps.thinBars,
			visibleRange: this._itemsVisibleRange,
		});
	}
}
