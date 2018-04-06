import Actions from '../src/Actions';

const TIMEOUT = 300;

export default class Todos extends Actions {

	static initialState = [];

	async loadItems() {
		await timeout(TIMEOUT);
		this.setItems([
			'todo "from server"'
		]);
		return true;
	}

	setItems(items) {
		return this.state.clear().push(...items);
	}

	addItem(text) {
		return this.state.push(text);
	}

	removeItem(index) {
		return this.state.delete(index);
	}
}

function timeout(time) {
	return new Promise((resolve) => {
		setTimeout(resolve, time);
	});
}
