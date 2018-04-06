import { List } from 'immutable';

const nullListeners = {
	notify() {}
};

export default class Subscription {

	constructor(
		store,
		parentSub,
		onStateChange
	) {
		this.store = store;
		this.parentSub = parentSub;
		this.onStateChange = onStateChange;
		this.unsubscribe = null;
		this.listeners = nullListeners;
	}

	addNestedSub(listener) {
		this.trySubscribe();
		return this.listeners.subscribe(listener);
	}

	notifyNestedSubs() {
		this.listeners.notify();
	}

	isSubscribed() {
		return Boolean(this.unsubscribe);
	}

	trySubscribe() {

		if (this.unsubscribe) {
			return;
		}

		const {
			parentSub,
			store,
			onStateChange
		} = this;

		this.unsubscribe = parentSub
			? parentSub.addNestedSub(onStateChange)
			: store.subscribe(onStateChange);

		this.listeners = new ListenerCollection();
	}

	tryUnsubscribe() {

		if (this.unsubscribe) {
			this.unsubscribe();
			this.unsubscribe = null;
			this.listeners.clear();
			this.listeners = nullListeners;
		}
	}
}

class ListenerCollection {

	constructor() {
		this.listeners = List();
	}

	clear() {
		this.listeners = null;
	}

	notify() {
		this.listeners.forEach((listener) => {
			listener();
		});
	}

	get() {
		return this.listeners;
	}

	subscribe(listener) {

		this.listeners = this.listeners.push(listener);

		let isSubscribed = true;

		return () => {

			if (!isSubscribed) {
				return;
			}

			isSubscribed = false;

			const {
				listeners
			} = this;

			if (listeners === null) {
				return;
			}

			this.listeners = listeners.remove(
				listeners.indexOf(listener)
			);
		};
	}
}
