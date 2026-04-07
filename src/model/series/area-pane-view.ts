import { BarPrice } from '../../model/bar';
import { IChartModelBase } from '../../model/chart-model';
import { Coordinate } from '../../model/coordinate';
import { InternalHitTestCandidate } from '../../model/internal-hit-test';
import { ISeries } from '../../model/iseries';
import { ISeriesBarColorer } from '../../model/series-bar-colorer';
import { TimePointIndex } from '../../model/time-data';
import { AreaFillItem, PaneRendererArea } from '../../renderers/area-renderer';
import { CompositeRenderer } from '../../renderers/composite-renderer';
import { LineStrokeItem, PaneRendererLine } from '../../renderers/line-renderer';
import { hitTestLineSeries } from '../../renderers/series-hit-test';

import { LinePaneViewBase } from './line-pane-view-base';

export class SeriesAreaPaneView extends LinePaneViewBase<'Area', AreaFillItem & LineStrokeItem, CompositeRenderer> {
	protected readonly _renderer: CompositeRenderer = new CompositeRenderer();
	private readonly _areaRenderer: PaneRendererArea = new PaneRendererArea();
	private readonly _lineRenderer: PaneRendererLine = new PaneRendererLine();

	public constructor(series: ISeries<'Area'>, model: IChartModelBase) {
		super(series, model);
		this._renderer.setRenderers([this._areaRenderer, this._lineRenderer]);
	}

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

	protected _createRawItem(time: TimePointIndex, price: BarPrice, colorer: ISeriesBarColorer<'Area'>): AreaFillItem & LineStrokeItem {
		return {
			...this._createRawItemBase(time, price),
			...colorer.barStyle(time),
		};
	}

	protected _prepareRendererData(): void {
		const options = this._series.options();
		if (this._itemsVisibleRange === null || this._items.length === 0) {
			return;
		}
		let topCoordinate;

		if (options.relativeGradient) {
			topCoordinate = this._items[this._itemsVisibleRange.from].y;

			for (let i = this._itemsVisibleRange.from; i < this._itemsVisibleRange.to; i++) {
				const item = this._items[i];
				if (item.y < topCoordinate) {
					topCoordinate = item.y;
				}
			}
		}
		this._areaRenderer.setData({
			lineType: options.lineType,
			items: this._items,
			lineStyle: options.lineStyle,
			lineWidth: options.lineWidth,
			baseLevelCoordinate: null,
			topCoordinate,
			invertFilledArea: options.invertFilledArea,
			visibleRange: this._itemsVisibleRange,
			barWidth: this._model.timeScale().barSpacing(),
		});

		this._lineRenderer.setData({
			hitTestLineType: options.lineType,
			hitTestLineWidth: options.lineVisible ? options.lineWidth : 1,
			hitTestTolerance: options.hitTestTolerance,
			lineType: options.lineVisible ? options.lineType : undefined,
			items: this._items,
			lineStyle: options.lineStyle,
			lineWidth: options.lineWidth,
			visibleRange: this._itemsVisibleRange,
			barWidth: this._model.timeScale().barSpacing(),
			pointMarkersRadius: options.pointMarkersVisible ? (options.pointMarkersRadius || options.lineWidth / 2 + 2) : undefined,
		});
	}
}
