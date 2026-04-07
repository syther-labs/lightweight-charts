import type { HoveredItemType } from './chart-model';

/**
 * Internal hit-test priority used for hover arbitration.
 *
 * Point hits receive a special override over non-point hits. Otherwise distance
 * decides, and equal-distance non-point ties preserve the existing visual/source
 * order instead of preferring a higher numeric priority.
 */
export enum HitTestPriority {
	/**
	 * Range-style hit such as a bar, candle, or histogram interval.
	 */
	Range = 0,
	/**
	 * Stroke-style hit such as a line segment.
	 */
	Line = 1,
	/**
	 * Point-style hit such as a marker or explicit point hover.
	 */
	Point = 2,
}

export enum InternalHoveredItemKind {
	PriceLine,
	Marker,
	Primitive,
	Custom,
}

export interface InternalHitTestCandidate {
	distance: number;
	priority: HitTestPriority;
	itemKind?: InternalHoveredItemKind;
	cursorStyle?: string;
	externalId?: string;
	hitTestData?: unknown;
}

export interface LegacyHitTestResultLike {
	distance?: number;
	hitTestPriority?: number;
	itemType?: HoveredItemType;
	cursorStyle?: string;
	externalId?: string;
	hitTestData?: unknown;
}

export function hoveredItemTypeToInternalKind(itemType: HoveredItemType | undefined): InternalHoveredItemKind | undefined {
	switch (itemType) {
		case 'price-line':
			return InternalHoveredItemKind.PriceLine;
		case 'marker':
			return InternalHoveredItemKind.Marker;
		case 'primitive':
			return InternalHoveredItemKind.Primitive;
		case 'custom':
			return InternalHoveredItemKind.Custom;
		default:
			return undefined;
	}
}

export function internalKindToHoveredItemType(itemKind: InternalHoveredItemKind | undefined): HoveredItemType | undefined {
	switch (itemKind) {
		case InternalHoveredItemKind.PriceLine:
			return 'price-line';
		case InternalHoveredItemKind.Marker:
			return 'marker';
		case InternalHoveredItemKind.Primitive:
			return 'primitive';
		case InternalHoveredItemKind.Custom:
			return 'custom';
		default:
			return undefined;
	}
}

export function normalizeHitTestResult(result: LegacyHitTestResultLike | null | undefined): InternalHitTestCandidate | null {
	if (result === null || result === undefined) {
		return null;
	}

	return {
		distance: result.distance ?? 0,
		priority: result.hitTestPriority ?? HitTestPriority.Range,
		itemKind: hoveredItemTypeToInternalKind(result.itemType),
		cursorStyle: result.cursorStyle,
		externalId: result.externalId,
		hitTestData: result.hitTestData,
	};
}

export function toLegacyHitTestResult(candidate: InternalHitTestCandidate | null): LegacyHitTestResultLike | null {
	if (candidate === null) {
		return null;
	}

	return {
		distance: candidate.distance,
		hitTestPriority: candidate.priority,
		itemType: internalKindToHoveredItemType(candidate.itemKind),
		cursorStyle: candidate.cursorStyle,
		externalId: candidate.externalId,
		hitTestData: candidate.hitTestData,
	};
}

export function isBetterHit(candidate: InternalHitTestCandidate, currentBest: InternalHitTestCandidate | null): boolean {
	if (currentBest === null) {
		return true;
	}

	if (candidate.priority === HitTestPriority.Point && currentBest.priority !== HitTestPriority.Point) {
		return true;
	}

	if (currentBest.priority === HitTestPriority.Point && candidate.priority !== HitTestPriority.Point) {
		return false;
	}

	if (candidate.distance !== currentBest.distance) {
		return candidate.distance < currentBest.distance;
	}

	// Preserve the existing draw/source order for equal-distance non-point ties.
	// This prevents hidden strokes from overtaking visually covering range hits.
	return false;
}
