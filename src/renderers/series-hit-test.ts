import { Coordinate } from '../model/coordinate';
import { HitTestPriority, InternalHitTestCandidate, toLegacyHitTestResult } from '../model/internal-hit-test';
import { SeriesItemsIndexesRange, TimedValue } from '../model/time-data';

import { LinePoint, LineType } from './draw-line';
import { getControlPoints } from './walk-line';

const BEZIER_APPROXIMATION_STEPS = 12;

interface TimedCoordinate extends TimedValue {
	x: Coordinate;
}

function hoveredSeriesHitTestResult(distance: number, priority: HitTestPriority): InternalHitTestCandidate {
	return { distance, priority };
}

function isWithinHorizontalSweep(x: number, left: number, right: number, radius: number): boolean {
	return x >= left - radius && x <= right + radius;
}

function distanceToSegment(
	x: number,
	y: number,
	x1: number,
	y1: number,
	x2: number,
	y2: number
): number {
	const deltaX = x2 - x1;
	const deltaY = y2 - y1;

	if (deltaX === 0 && deltaY === 0) {
		return Math.hypot(x - x1, y - y1);
	}

	const projection = ((x - x1) * deltaX + (y - y1) * deltaY) / (deltaX * deltaX + deltaY * deltaY);
	const clampedProjection = Math.max(0, Math.min(1, projection));
	const closestX = x1 + deltaX * clampedProjection;
	const closestY = y1 + deltaY * clampedProjection;

	return Math.hypot(x - closestX, y - closestY);
}

function cubicBezierPoint(
	p0: number,
	p1: number,
	p2: number,
	p3: number,
	t: number
): number {
	const u = 1 - t;
	return u * u * u * p0
		+ 3 * u * u * t * p1
		+ 3 * u * t * t * p2
		+ t * t * t * p3;
}

function distanceToBezierCurve(x: number, y: number, points: [LinePoint, LinePoint, LinePoint, LinePoint]): number {
	let minDistance = Number.POSITIVE_INFINITY;
	let previousPoint = points[0];

	for (let step = 1; step <= BEZIER_APPROXIMATION_STEPS; step++) {
		const t = step / BEZIER_APPROXIMATION_STEPS;
		const currentPoint: LinePoint = {
			x: cubicBezierPoint(points[0].x, points[1].x, points[2].x, points[3].x, t) as Coordinate,
			y: cubicBezierPoint(points[0].y, points[1].y, points[2].y, points[3].y, t) as Coordinate,
		};

		minDistance = Math.min(
			minDistance,
			distanceToSegment(x, y, previousPoint.x, previousPoint.y, currentPoint.x, currentPoint.y)
		);
		previousPoint = currentPoint;
	}

	return minDistance;
}

function lineSegmentHorizontalBounds(
	firstItem: LinePoint,
	secondItem: LinePoint,
	lineType: LineType,
	items: readonly LinePoint[],
	toItemIndex: number
): [number, number] {
	switch (lineType) {
		case LineType.Curved: {
			const [firstControlPoint, secondControlPoint] = getControlPoints(items, toItemIndex - 1, toItemIndex);
			const minX = Math.min(firstItem.x, secondItem.x, firstControlPoint.x, secondControlPoint.x);
			const maxX = Math.max(firstItem.x, secondItem.x, firstControlPoint.x, secondControlPoint.x);
			return [minX, maxX];
		}
		case LineType.WithSteps:
		case LineType.Simple:
		default: {
			const minX = Math.min(firstItem.x, secondItem.x);
			const maxX = Math.max(firstItem.x, secondItem.x);
			return [minX, maxX];
		}
	}
}

function slotStart(
	item: TimedCoordinate,
	previousItem: TimedCoordinate | undefined,
	barSpacing: number
): number {
	if (previousItem === undefined || previousItem.time !== item.time - 1) {
		return item.x - barSpacing / 2;
	}

	return (previousItem.x + item.x) / 2;
}

function slotEnd(
	item: TimedCoordinate,
	nextItem: TimedCoordinate | undefined,
	barSpacing: number
): number {
	if (nextItem === undefined || nextItem.time !== item.time + 1) {
		return item.x + barSpacing / 2;
	}

	return (item.x + nextItem.x) / 2;
}

// eslint-disable-next-line max-params
function hitTestLineSegment(
	x: Coordinate,
	y: Coordinate,
	firstItem: LinePoint,
	secondItem: LinePoint,
	lineType: LineType,
	items: readonly LinePoint[],
	toItemIndex: number,
	radius: number
): number | null {
	switch (lineType) {
		case LineType.WithSteps:
			{
				const horizontalDistance = distanceToSegment(x, y, firstItem.x, firstItem.y, secondItem.x, firstItem.y);
				const verticalDistance = distanceToSegment(x, y, secondItem.x, firstItem.y, secondItem.x, secondItem.y);
				const minDistance = Math.min(horizontalDistance, verticalDistance);
				return minDistance <= radius ? minDistance : null;
			}
		case LineType.Curved: {
			const [firstControlPoint, secondControlPoint] = getControlPoints(items, toItemIndex - 1, toItemIndex);
			const distance = distanceToBezierCurve(x, y, [firstItem, firstControlPoint, secondControlPoint, secondItem]);
			return distance <= radius ? distance : null;
		}
		case LineType.Simple:
		default:
			{
				const distance = distanceToSegment(x, y, firstItem.x, firstItem.y, secondItem.x, secondItem.y);
				return distance <= radius ? distance : null;
			}
	}
}

// eslint-disable-next-line max-params, complexity
export function hitTestLineSeries(
	items: readonly LinePoint[],
	visibleRange: SeriesItemsIndexesRange | null,
	x: Coordinate,
	y: Coordinate,
	lineType: LineType,
	lineWidth: number,
	pointMarkersRadius?: number,
	barSpacing: number = 0,
	hitTestTolerance: number = 0
): InternalHitTestCandidate | null {
	if (visibleRange === null || visibleRange.from >= visibleRange.to || items.length === 0) {
		return null;
	}

	const radius = Math.max(lineWidth / 2, pointMarkersRadius ?? 0) + hitTestTolerance;
	let pointMinDistance = Number.POSITIVE_INFINITY;

	for (let itemIndex = visibleRange.from; itemIndex < visibleRange.to; itemIndex++) {
		const item = items[itemIndex];
		if (pointMarkersRadius !== undefined) {
			if (!isWithinHorizontalSweep(x, item.x, item.x, pointMarkersRadius + hitTestTolerance)) {
				continue;
			}
			const distance = Math.hypot(x - item.x, y - item.y);
			if (distance <= pointMarkersRadius + hitTestTolerance) {
				pointMinDistance = Math.min(pointMinDistance, distance);
			}
		}
	}

	if (visibleRange.to - visibleRange.from < 2) {
		const item = items[visibleRange.from];
		const singlePointHalfWidth = Math.max(barSpacing / 2, radius);
		const distance = distanceToSegment(x, y, item.x - singlePointHalfWidth, item.y, item.x + singlePointHalfWidth, item.y);
		if (distance <= radius) {
			pointMinDistance = Math.min(pointMinDistance, distance);
		}
		return Number.isFinite(pointMinDistance) ? hoveredSeriesHitTestResult(pointMinDistance, HitTestPriority.Point) : null;
	}

	let lineMinDistance = Number.POSITIVE_INFINITY;

	for (let itemIndex = visibleRange.from + 1; itemIndex < visibleRange.to; itemIndex++) {
		const previousItem = items[itemIndex - 1];
		const currentItem = items[itemIndex];
		const [leftX, rightX] = lineSegmentHorizontalBounds(previousItem, currentItem, lineType, items, itemIndex);
		if (!isWithinHorizontalSweep(x, leftX, rightX, radius)) {
			continue;
		}
		const distance = hitTestLineSegment(x, y, previousItem, currentItem, lineType, items, itemIndex, radius);
		if (distance !== null) {
			lineMinDistance = Math.min(lineMinDistance, distance);
		}
	}

	if (Number.isFinite(pointMinDistance)) {
		return hoveredSeriesHitTestResult(pointMinDistance, HitTestPriority.Point);
	}

	return Number.isFinite(lineMinDistance) ? hoveredSeriesHitTestResult(lineMinDistance, HitTestPriority.Line) : null;
}

// eslint-disable-next-line max-params, complexity
export function hitTestSeriesRange<TItem extends TimedCoordinate>(
	items: readonly TItem[],
	visibleRange: SeriesItemsIndexesRange | null,
	x: Coordinate,
	y: Coordinate,
	barSpacing: number,
	hitTestTolerance: number,
	rangeProvider: (item: TItem) => [Coordinate, Coordinate]
): InternalHitTestCandidate | null {
	if (visibleRange === null || visibleRange.from >= visibleRange.to || items.length === 0) {
		return null;
	}

	let minDistance = Number.POSITIVE_INFINITY;

	for (let itemIndex = visibleRange.from; itemIndex < visibleRange.to; itemIndex++) {
		const item = items[itemIndex];
		const previousItem = itemIndex > visibleRange.from ? items[itemIndex - 1] : undefined;
		const nextItem = itemIndex < visibleRange.to - 1 ? items[itemIndex + 1] : undefined;
		const leftBoundary = slotStart(item, previousItem, barSpacing) - hitTestTolerance;
		const rightBoundary = slotEnd(item, nextItem, barSpacing) + hitTestTolerance;

		if (x < leftBoundary || x > rightBoundary) {
			continue;
		}

		const [rangeStart, rangeEnd] = rangeProvider(item);
		const actualTop = Math.min(rangeStart, rangeEnd);
		const actualBottom = Math.max(rangeStart, rangeEnd);
		const top = actualTop - hitTestTolerance;
		const bottom = actualBottom + hitTestTolerance;

		if (y >= actualTop && y <= actualBottom) {
			minDistance = Math.min(minDistance, 0);
			continue;
		}

		if (y >= top && y <= bottom) {
			const distance = Math.min(Math.abs(y - actualTop), Math.abs(actualBottom - y));
			minDistance = Math.min(minDistance, distance);
		}
	}

	return Number.isFinite(minDistance) ? hoveredSeriesHitTestResult(minDistance, HitTestPriority.Range) : null;
}

export { HitTestPriority, toLegacyHitTestResult };
