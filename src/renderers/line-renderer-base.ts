import { BitmapCoordinatesRenderingScope } from 'fancy-canvas';

import { Coordinate } from '../model/coordinate';
import { LegacyHitTestResultLike } from '../model/internal-hit-test';
import { PricedValue } from '../model/price-scale';
import { SeriesItemsIndexesRange, TimedValue } from '../model/time-data';

import { BitmapCoordinatesPaneRenderer } from './bitmap-coordinates-pane-renderer';
import { getDashPatternLength, LinePoint, LineStyle, LineType, LineWidth, setLineStyle } from './draw-line';
import { drawSeriesPointMarkers } from './draw-series-point-markers';
import { hitTestLineSeries, toLegacyHitTestResult } from './series-hit-test';
import { walkLine } from './walk-line';

export type LineItemBase = TimedValue & PricedValue & LinePoint;

export interface PaneRendererLineDataBase<TItem extends LineItemBase = LineItemBase> {
	lineType?: LineType;

	items: TItem[];

	barWidth: number;

	lineWidth: LineWidth;
	lineStyle: LineStyle;
	hitTestLineType?: LineType;
	hitTestLineWidth?: number;

	visibleRange: SeriesItemsIndexesRange | null;

	pointMarkersRadius?: number;
	hitTestTolerance: number;
}

function finishStyledArea(scope: BitmapCoordinatesRenderingScope, style: CanvasRenderingContext2D['strokeStyle']): void {
	const ctx = scope.context;
	ctx.strokeStyle = style;
	ctx.stroke();
}

export abstract class PaneRendererLineBase<TData extends PaneRendererLineDataBase> extends BitmapCoordinatesPaneRenderer {
	protected _data: TData | null = null;

	public setData(data: TData): void {
		this._data = data;
	}

	public hitTest(x: Coordinate, y: Coordinate): LegacyHitTestResultLike | null {
		if (this._data === null) {
			return null;
		}

		return toLegacyHitTestResult(hitTestLineSeries(
			this._data.items,
			this._data.visibleRange,
			x,
			y,
			this._data.hitTestLineType ?? this._data.lineType ?? LineType.Simple,
			this._data.hitTestLineWidth ?? this._data.lineWidth,
			this._data.pointMarkersRadius,
			this._data.barWidth,
			this._data.hitTestTolerance
			));
	}

	protected _drawImpl(renderingScope: BitmapCoordinatesRenderingScope): void {
		if (this._data === null) {
			return;
		}

		const { items, visibleRange, barWidth, lineType, lineWidth, lineStyle, pointMarkersRadius } = this._data;

		if (visibleRange === null) {
			return;
		}

		const ctx = renderingScope.context;

		ctx.lineCap = 'butt';
		ctx.lineWidth = lineWidth * renderingScope.verticalPixelRatio;

		const dashPattern = setLineStyle(ctx, lineStyle);

		ctx.lineJoin = 'round';

		const styleGetter = this._strokeStyle.bind(this);

		const dashPatternLength = getDashPatternLength(dashPattern);

		if (lineType !== undefined) {
			walkLine(renderingScope, items, lineType, visibleRange, barWidth, styleGetter, finishStyledArea, dashPatternLength);
		}

		if (pointMarkersRadius) {
			drawSeriesPointMarkers(renderingScope, items, pointMarkersRadius, visibleRange, styleGetter);
		}
	}

	protected abstract _strokeStyle(renderingScope: BitmapCoordinatesRenderingScope, item: TData['items'][0]): CanvasRenderingContext2D['strokeStyle'];
}
