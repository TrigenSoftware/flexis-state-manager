import {
	Map,
	List,
	fromJS
} from 'immutable';
import Actions from './Actions';

export default class Store {

	constructor(
		actionsClasses,
		forceState = null
	) {

		const withoutNamespaces = Reflect.getPrototypeOf(actionsClasses) === Actions;

		let actions = {},
			state = {};

		if (withoutNamespaces) {

			const Actions = actionsClasses,
				{ initialState } = Actions;

			actions = new Actions(this, false);

			if (typeof initialState != 'undefined') {
				state = fromJS(initialState);
			}

		} else {
			Object.entries(actionsClasses).forEach(([key, Actions]) => {

				const storeKey = key.replace(/^./, key[0].toLowerCase()),
					{ initialState } = Actions;

				actions[storeKey] = new Actions(this, storeKey);

				if (typeof initialState != 'undefined') {
					state[storeKey] = fromJS(initialState);
				}
			});
		}

		this._state = forceState
			? fromJS(forceState)
			: (withoutNamespaces
				? state
				: Map(state));
		this._actions = actions;
		this._subscriptions = List();
		this._isLocked = false;
		this._actionsCallDepth = 0;
	}

	destroy() {
		this._state = null;
		this._actions = null;
		this._subscriptions = null;
		this._isLocked = null;
	}

	_setState(newState) {

		if (this._isLocked) {
			throw new Error(
				'You may not set state while the action is executing.'
			);
		}

		this._state = newState;
		this._subscriptions.forEach((subscription) => {
			subscription(newState);
		});
	}

	subscribe(subscription) {

		if (typeof subscription != 'function') {
			throw new Error(
				'Expected the listener to be a function.'
			);
		}

		if (this._isLocked) {
			throw new Error(
				'You may not subscribe to a store while the action is executing.'
			);
		}

		this._subscriptions = this._subscriptions.push(subscription);

		let isSubscribed = true;

		return () => {

			if (!isSubscribed) {
				return;
			}

			if (this._isLocked) {
				throw new Error(
					'You may not unsubscribe from a store while the action is executing.'
				);
			}

			const {
				_subscriptions: subscriptions
			} = this;

			this._subscriptions = subscriptions.remove(
				subscriptions.indexOf(subscription)
			);

			isSubscribed = false;
		};
	}

	get state() {
		return this._state;
	}

	get actions() {
		return this._actions;
	}
}
