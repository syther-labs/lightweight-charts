import { CanvasRenderingTarget2D } from 'fancy-canvas';

import { HoveredObject } from '../model/chart-model';
import { Coordinate } from '../model/coordinate';
import { LegacyHitTestResultLike } from '../model/internal-hit-test';

export interface IPaneRenderer {
	draw(target: CanvasRenderingTarget2D, isHovered: boolean, hitTestData?: unknown): void;
	drawBackground?(target: CanvasRenderingTarget2D, isHovered: boolean, hitTestData?: unknown): void;
	hitTest?(x: Coordinate, y: Coordinate): HoveredObject | LegacyHitTestResultLike | null;
}
