import { HoveredItemType, HoveredSource } from '../model/chart-model';
import { Pane } from '../model/pane';
import { Series } from '../model/series';
import { SeriesType } from '../model/series-options';

export interface HoveredItemInfoImpl {
	type: HoveredItemType;
	series?: Series<SeriesType>;
	objectId?: unknown;
	paneIndex?: number;
}

export interface HoveredTargetInfoImpl {
	sourceKind: 'series' | 'series-primitive' | 'pane-primitive';
	objectKind: 'series' | 'custom-object' | 'custom-price-line' | 'series-marker' | 'primitive';
	series?: Series<SeriesType>;
	objectId?: unknown;
	paneIndex?: number;
}

export interface HoveredEventInfoImpl {
	hoveredSeries?: Series<SeriesType>;
	hoveredObject?: string;
	hoveredItem?: HoveredItemInfoImpl;
	hoveredTarget?: HoveredTargetInfoImpl;
}

function hoveredTargetSourceKind(
	source: HoveredSource['source'],
	itemType: HoveredItemType
): HoveredTargetInfoImpl['sourceKind'] {
	if (source instanceof Pane) {
		return 'pane-primitive';
	}

	if (itemType === 'marker' || itemType === 'primitive') {
		return 'series-primitive';
	}

	return 'series';
}

function hoveredTargetObjectKind(
	item: HoveredItemInfoImpl
): HoveredTargetInfoImpl['objectKind'] {
	switch (item.type) {
		case 'custom':
			return item.objectId !== undefined ? 'custom-object' : 'series';
		case 'price-line':
			return 'custom-price-line';
		case 'marker':
			return 'series-marker';
		case 'primitive':
			return 'primitive';
		case 'series-point':
		case 'series-line':
		case 'series-range':
		default:
			return 'series';
	}
}

export function buildHoveredEventInfo(
	hoveredSource: HoveredSource | null,
	paneIndex?: number
): HoveredEventInfoImpl {
	const hoveredSeries = hoveredSource !== null && hoveredSource.source instanceof Series
		? hoveredSource.source
		: undefined;
	const hoveredObject = hoveredSource?.object?.externalId;
	const normalizedPaneIndex = paneIndex !== undefined && paneIndex !== -1 ? paneIndex : undefined;

	if (hoveredSource === null || hoveredSource.itemType === undefined) {
		return {
			hoveredSeries,
			hoveredObject,
		};
	}

	const hoveredItem: HoveredItemInfoImpl = {
		type: hoveredSource.itemType,
		series: hoveredSeries,
		objectId: hoveredObject,
		paneIndex: normalizedPaneIndex,
	};

	return {
		hoveredSeries,
		hoveredObject,
		hoveredItem,
		hoveredTarget: {
			sourceKind: hoveredTargetSourceKind(hoveredSource.source, hoveredItem.type),
			objectKind: hoveredTargetObjectKind(hoveredItem),
			series: hoveredSeries,
			objectId: hoveredObject,
			paneIndex: normalizedPaneIndex,
		},
	};
}
