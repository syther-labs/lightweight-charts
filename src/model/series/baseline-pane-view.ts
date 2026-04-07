import { BarPrice } from '../../model/bar';
import { IChartModelBase } from '../../model/chart-model';
import { Coordinate } from '../../model/coordinate';
import { InternalHitTestCandidate } from '../../model/internal-hit-test';
import { ISeries } from '../../model/iseries';
import { ISeriesBarColorer } from '../../model/series-bar-colorer';
import { TimePointIndex } from '../../model/time-data';
import { BaselineFillItem, PaneRendererBaselineArea } from '../../renderers/baseline-renderer-area';
import { BaselineStrokeItem, PaneRendererBaselineLine } from '../../renderers/baseline-renderer-line';
import { CompositeRenderer } from '../../renderers/composite-renderer';
import { hitTestLineSeries } from '../../renderers/series-hit-test';

import { LinePaneViewBase } from './line-pane-view-base';

export class SeriesBaselinePaneView extends LinePaneViewBase<'Baseline', BaselineFillItem & BaselineStrokeItem, CompositeRenderer> {
	protected readonly _renderer: CompositeRenderer = new CompositeRenderer();
	private readonly _baselineAreaRenderer: PaneRendererBaselineArea = new PaneRendererBaselineArea();
	private readonly _baselineLineRenderer: PaneRendererBaselineLine = new PaneRendererBaselineLine();

	public constructor(series: ISeries<'Baseline'>, model: IChartModelBase) {
		super(series, model);
		this._renderer.setRenderers([this._baselineAreaRenderer, this._baselineLineRenderer]);
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

	protected _createRawItem(time: TimePointIndex, price: BarPrice, colorer: ISeriesBarColorer<'Baseline'>): BaselineFillItem & BaselineStrokeItem {
		return {
			...this._createRawItemBase(time, price),
			...colorer.barStyle(time),
		};
	}

	protected _prepareRendererData(): void {
		const firstValue = this._series.firstValue();
		if (firstValue === null) {
			return;
		}

		const options = this._series.options();
		const baseLevelCoordinate = this._series.priceScale().priceToCoordinate(options.baseValue.price, firstValue.value);
		const barWidth = this._model.timeScale().barSpacing();

		if (this._itemsVisibleRange === null || this._items.length === 0) {
			return;
		}
		let topCoordinate;
		let bottomCoordinate;

		if (options.relativeGradient) {
			topCoordinate = this._items[this._itemsVisibleRange.from].y;
			bottomCoordinate = this._items[this._itemsVisibleRange.from].y;

			for (let i = this._itemsVisibleRange.from; i < this._itemsVisibleRange.to; i++) {
				const item = this._items[i];
				if (item.y < topCoordinate) {
					topCoordinate = item.y;
				}
				if (item.y > bottomCoordinate) {
					bottomCoordinate = item.y;
				}
			}
		}

		this._baselineAreaRenderer.setData({
			items: this._items,
			lineWidth: options.lineWidth,
			lineStyle: options.lineStyle,
			lineType: options.lineType,
			baseLevelCoordinate,
			topCoordinate,
			bottomCoordinate,
			invertFilledArea: false,
			visibleRange: this._itemsVisibleRange,
			barWidth,
		});

		this._baselineLineRenderer.setData({
			items: this._items,
			hitTestLineType: options.lineType,
			hitTestLineWidth: options.lineVisible ? options.lineWidth : 1,
			hitTestTolerance: options.hitTestTolerance,
			lineWidth: options.lineWidth,
			lineStyle: options.lineStyle,
			lineType: options.lineVisible ? options.lineType : undefined,
			pointMarkersRadius: options.pointMarkersVisible ? (options.pointMarkersRadius || options.lineWidth / 2 + 2) : undefined,
			baseLevelCoordinate,
			topCoordinate,
			bottomCoordinate,
			visibleRange: this._itemsVisibleRange,
			barWidth,
		});
	}
}
