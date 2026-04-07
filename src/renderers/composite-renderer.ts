import { CanvasRenderingTarget2D } from 'fancy-canvas';

import { Coordinate } from '../model/coordinate';
import { isBetterHit, LegacyHitTestResultLike, normalizeHitTestResult, toLegacyHitTestResult } from '../model/internal-hit-test';

import { IPaneRenderer } from './ipane-renderer';

export class CompositeRenderer implements IPaneRenderer {
	private _renderers: readonly IPaneRenderer[] = [];

	public setRenderers(renderers: readonly IPaneRenderer[]): void {
		this._renderers = renderers;
	}

	public draw(target: CanvasRenderingTarget2D, isHovered: boolean, hitTestData?: unknown): void {
		this._renderers.forEach((r: IPaneRenderer) => {
			r.draw(target, isHovered, hitTestData);
		});
	}

	public hitTest(x: Coordinate, y: Coordinate): LegacyHitTestResultLike | null {
		let bestHitResult = null;

		for (const renderer of this._renderers) {
			const hitResult = normalizeHitTestResult(renderer.hitTest?.(x, y));
			if (hitResult !== null && isBetterHit(hitResult, bestHitResult)) {
				bestHitResult = hitResult;
			}
		}

		return toLegacyHitTestResult(bestHitResult);
	}
}
