import { BarPrice } from '../../model/bar';
import { Coordinate } from '../../model/coordinate';
import { InternalHitTestCandidate } from '../../model/internal-hit-test';
import { ISeriesBarColorer } from '../../model/series-bar-colorer';
import { LinePaneViewBase } from '../../model/series/line-pane-view-base';
import { TimePointIndex } from '../../model/time-data';
import { LineStrokeItem, PaneRendererLine, PaneRendererLineData } from '../../renderers/line-renderer';
import { hitTestLineSeries } from '../../renderers/series-hit-test';

export class SeriesLinePaneView extends LinePaneViewBase<'Line', LineStrokeItem, PaneRendererLine> {
	protected readonly _renderer: PaneRendererLine = new PaneRendererLine();

	public hitTest(x: Coordinate, y: Coordinate): InternalHitTestCandidate | null {
		if (!this._series.visible()) {
			return null;
		}

		this._ensureValid();
		if (this._itemsVisibleRange === null) {
			return null;
		}

		const options = this._series.options();
		return hitTestLineSeries(
			this._items,
			this._itemsVisibleRange,
			x,
			y,
			options.lineType,
			options.lineVisible ? options.lineWidth : 1,
			options.pointMarkersVisible ? (options.pointMarkersRadius || options.lineWidth / 2 + 2) : undefined,
			this._model.timeScale().barSpacing(),
			options.hitTestTolerance
		);
	}

	protected _createRawItem(time: TimePointIndex, price: BarPrice, colorer: ISeriesBarColorer<'Line'>): LineStrokeItem {
		return {
			...this._createRawItemBase(time, price),
			...colorer.barStyle(time),
		};
	}

	protected _prepareRendererData(): void {
		const options = this._series.options();

		const data: PaneRendererLineData = {
			items: this._items,
			hitTestLineType: options.lineType,
			hitTestLineWidth: options.lineVisible ? options.lineWidth : 1,
			hitTestTolerance: options.hitTestTolerance,
			lineStyle: options.lineStyle,
			lineType: options.lineVisible ? options.lineType : undefined,
			lineWidth: options.lineWidth,
			pointMarkersRadius: options.pointMarkersVisible ? (options.pointMarkersRadius || options.lineWidth / 2 + 2) : undefined,
			visibleRange: this._itemsVisibleRange,
			barWidth: this._model.timeScale().barSpacing(),
		};

		this._renderer.setData(data);
	}
}
