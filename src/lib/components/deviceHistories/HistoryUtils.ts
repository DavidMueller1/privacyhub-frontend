import * as d3 from 'd3';

export const getTimestampDifference = (
	delta: number,
	timestampStart: number,
	timestampEnd: number,
	width: number,
	marginLeft: number,
	marginRight: number
): number => {
	const panArea = width - marginLeft - marginRight;
	const timeDifference = timestampEnd - timestampStart;
	const timePerPixel = timeDifference / panArea;
	return delta * timePerPixel;
}

// center the action (handles multitouch)
export const centerEvent = (event, target) => {
	if (event.sourceEvent) {
		const p = d3.pointers(event, target);
		return [d3.mean(p, d => d[0]), d3.mean(p, d => d[1])];
	}
	return [width / 2, height / 2];
}