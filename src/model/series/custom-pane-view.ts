import { CanvasRenderingTarget2D } from 'fancy-canvas';

import { undefinedIfNull } from '../../helpers/strict-type-checks';

import { Coordinate } from '../../model/coordinate';
import { HitTestPriority, InternalHitTestCandidate, InternalHoveredItemKind } from '../../model/internal-hit-test';
import { IPaneRenderer } from '../../renderers/ipane-renderer';
import { hitTestSeriesRange } from '../../renderers/series-hit-test';

import { IChartModelBase } from '../chart-model';
import {
	CustomBarItemData,
	CustomConflationContext,
	CustomData,
	CustomSeriesHitTestResult,
	CustomSeriesPricePlotValues,
	CustomSeriesWhitespaceData,
	ICustomSeriesPaneRenderer,
	ICustomSeriesPaneView,
	PriceToCoordinateConverter,
} from '../icustom-series';
import { ISeries } from '../iseries';
import { PriceScale } from '../price-scale';
import { SeriesPlotRow } from '../series-data';
import { SeriesOptionsMap } from '../series-options';
import { TimedValue } from '../time-data';
import { ITimeScale } from '../time-scale';
import { ISeriesCustomPaneView } from './pane-view';
import { SeriesPaneViewBase } from './series-pane-view-base';

type CustomBarItemBase = TimedValue;

interface CustomBarItem extends CustomBarItemBase {
	barColor: string;
	originalData?: Record<string, unknown>;
	priceValues: CustomSeriesPricePlotValues;
}

interface CustomSeriesHitTestItem extends TimedValue {
	x: Coordinate;
	topY: Coordinate;
	bottomY: Coordinate;
}

class CustomSeriesPaneRendererWrapper implements IPaneRenderer {
	private readonly _sourceRenderer: ICustomSeriesPaneRenderer;
	private readonly _priceScale: PriceToCoordinateConverter;

	public constructor(
		sourceRenderer: ICustomSeriesPaneRenderer,
		priceScale: PriceToCoordinateConverter
	) {
		this._sourceRenderer = sourceRenderer;
		this._priceScale = priceScale;
	}

	public draw(
		target: CanvasRenderingTarget2D,
		isHovered: boolean,
		hitTestData?: unknown
	): void {
		this._sourceRenderer.draw(target, this._priceScale, isHovered, hitTestData);
	}
}

function customHitPriority(type: CustomSeriesHitTestResult['type']): HitTestPriority {
	switch (type) {
		case 'point':
			return HitTestPriority.Point;
		case 'range':
			return HitTestPriority.Range;
		case 'line':
		case 'custom':
		default:
			return HitTestPriority.Line;
	}
}

function normalizeCustomHit(
	result: CustomSeriesHitTestResult
): InternalHitTestCandidate {
	return {
		distance: result.distance,
		priority: customHitPriority(result.type),
		itemKind: InternalHoveredItemKind.Custom,
		cursorStyle: result.cursorStyle,
		externalId: result.objectId,
		hitTestData: result.hitTestData,
	};
}

export class SeriesCustomPaneView extends SeriesPaneViewBase<
	'Custom'& keyof SeriesOptionsMap,
	CustomBarItem,
	CustomSeriesPaneRendererWrapper
> implements ISeriesCustomPaneView {
	protected readonly _renderer: CustomSeriesPaneRendererWrapper;
	private readonly _paneView: ICustomSeriesPaneView<unknown>;
	private readonly _sourceRenderer: ICustomSeriesPaneRenderer;
	private _hitTestItems: CustomSeriesHitTestItem[] = [];
	private _hitTestItemsValid: boolean = false;

	public constructor(
		series: ISeries<'Custom' & keyof SeriesOptionsMap>,
		model: IChartModelBase,
		paneView: ICustomSeriesPaneView<unknown>
	) {
		super(series, model, false);
		this._paneView = paneView;
		this._sourceRenderer = this._paneView.renderer();
		this._renderer = new CustomSeriesPaneRendererWrapper(
			this._sourceRenderer,
			(price: number) => this._rendererPriceCoordinate(price)
		);
	}

	public get conflationReducer(): ((item1: CustomConflationContext<unknown, CustomData<unknown>>, item2: CustomConflationContext<unknown, CustomData<unknown>>) => CustomData<unknown>) | undefined {
		// eslint-disable-next-line @typescript-eslint/unbound-method
		return this._paneView.conflationReducer;
	}

	public priceValueBuilder(plotRow: CustomData<unknown> | CustomSeriesWhitespaceData<unknown>): CustomSeriesPricePlotValues {
		return this._paneView.priceValueBuilder(plotRow);
	}

	public isWhitespace(data: CustomData<unknown> | CustomSeriesWhitespaceData<unknown>): data is CustomSeriesWhitespaceData<unknown> {
		return this._paneView.isWhitespace(data);
	}

	public hitTest(x: Coordinate, y: Coordinate): InternalHitTestCandidate | null {
		if (!this._series.visible()) {
			return null;
		}

		this._ensureValid();
		if (this._itemsVisibleRange === null) {
			return null;
		}

		const customHit = this._sourceRenderer.hitTest?.(x, y, (price: number) => this._rendererPriceCoordinate(price));
		if (customHit !== null && customHit !== undefined) {
			return normalizeCustomHit(customHit);
		}

		this._ensureHitTestItems();

		return hitTestSeriesRange(
			this._hitTestItems,
			this._itemsVisibleRange,
			x,
			y,
			this._model.timeScale().barSpacing(),
			this._series.options().hitTestTolerance,
			(bar: CustomSeriesHitTestItem) => [bar.topY, bar.bottomY]
		);
	}

	protected _fillRawPoints(): void {
		const colorer = this._series.barColorer();
		this._items = this._series
			.conflatedBars()
			.rows()
			.map((row: SeriesPlotRow<'Custom'>) => {
				const rowData = row.data as unknown as CustomData<unknown> | CustomSeriesWhitespaceData<unknown>;
				return {
					time: row.index,
					x: NaN as Coordinate,
					...colorer.barStyle(row.index),
					originalData: row.data,
					priceValues: this._paneView.isWhitespace(rowData) ? [] : this._paneView.priceValueBuilder(rowData),
				};
			});
	}

	protected override _convertToCoordinates(
		priceScale: PriceScale,
		timeScale: ITimeScale
	): void {
		timeScale.indexesToCoordinates(
			this._items,
			undefinedIfNull(this._itemsVisibleRange)
		);
	}

	protected _prepareRendererData(): void {
		this._hitTestItemsValid = false;

		this._paneView.update(
			{
				bars: this._items.map(unwrapItemData),
				barSpacing: this._model.timeScale().barSpacing(),
				visibleRange: this._itemsVisibleRange,
				conflationFactor: this._model.timeScale().conflationFactor(),
			},
			this._series.options()
		);
	}

	private _rendererPriceCoordinate(price: number): Coordinate | null {
		const firstValue = this._series.firstValue();
		if (firstValue === null) {
			return null;
		}

		return this._series.priceScale().priceToCoordinate(price, firstValue.value);
	}

	private _ensureHitTestItems(): void {
		if (this._hitTestItemsValid) {
			return;
		}

		this._hitTestItems = this._items.map((item: CustomBarItem) => {
			const coordinates = item.priceValues
				.map((price: number) => this._rendererPriceCoordinate(price))
				.filter((coordinate: Coordinate | null): coordinate is Coordinate => coordinate !== null);
			const topY = (coordinates.length > 0 ? Math.min(...coordinates) : NaN) as Coordinate;
			const bottomY = (coordinates.length > 0 ? Math.max(...coordinates) : NaN) as Coordinate;

			return {
				time: item.time,
				x: item.x,
				topY,
				bottomY,
			};
		});
		this._hitTestItemsValid = true;
	}
}

function unwrapItemData(
	item: CustomBarItem
): CustomBarItemData<unknown> {
	return {
		x: item.x,
		time: item.time,
		originalData: item.originalData as unknown as CustomData<unknown>,
		barColor: item.barColor,
	};
}
