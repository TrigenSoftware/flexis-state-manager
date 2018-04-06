
export default function initMapFunction(fn) {

	if (typeof fn != 'function') {
		return noop;
	}

	fn.dependsOnOwnProps = typeof fn.dependsOnOwnProps == 'boolean'
		? fn.dependsOnOwnProps
		: fn.length != 1;

	return fn;
}

function noop() {
	return {};
}

noop.dependsOnOwnProps = false;
