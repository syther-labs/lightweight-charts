export function hoveredSourceOnTopOrder<T>(sources: readonly T[], hoveredSource: unknown, enabled: boolean): readonly T[] {
	if (!enabled) {
		return sources;
	}

	const hoveredIndex = sources.indexOf(hoveredSource as T);
	if (hoveredIndex === -1 || hoveredIndex === sources.length - 1) {
		return sources;
	}

	const reorderedSources = sources.slice();
	const [hoveredItem] = reorderedSources.splice(hoveredIndex, 1);
	reorderedSources.push(hoveredItem);

	return reorderedSources;
}
