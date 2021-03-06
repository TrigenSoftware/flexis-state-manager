import { isImmutable } from 'immutable';

export default class Actions {

	constructor(store, namespace) {

		this._namespace = namespace;
		this._store = store;

		this._defineStateGetters();
		this._wrapMethods();
	}

	_defineStateGetters() {

		const {
			_namespace: namespace,
			_store:	    store
		} = this;

		Reflect.defineProperty(this, 'state', {
			get: namespace
				? () => store.state.get(namespace)
				: () => store.state
		});

		Reflect.defineProperty(this, 'globalState', {
			get: () => store.state
		});
	}

	_wrapMethods() {

		const {
			_namespace: namespace,
			_store:	    store
		} = this;

		Reflect.ownKeys(
			this.constructor.prototype
		).forEach((methodName) => {

			if (typeof methodName == 'symbol') {
				return;
			}

			const method = this[methodName];

			if (methodName == 'constructor'
				|| typeof method != 'function'
			) {
				return;
			}

			if (namespace) {
				this[methodName] = (...args) => {

					const wasLocked = store._isLocked,
						actionsCallDepthPre = ++store._actionsCallDepth;

					store._isLocked = true;

					const result = Reflect.apply(method, this, args),
						actionsCallDepthPost = store._actionsCallDepth;

					if (actionsCallDepthPre === 1) {
						store._actionsCallDepth = 0;
					}

					if (isImmutable(result)) {

						if (actionsCallDepthPost > actionsCallDepthPre) {
							throw new Error(
								'Store is locked by another action.'
							);
						}

						store._isLocked = false;
						store._setState(
							store.state.set(namespace, result)
						);
						store._isLocked = wasLocked;

						return;
					}

					store._isLocked = wasLocked;

					return result; // eslint-disable-line
				};
			} else {
				this[methodName] = (...args) => {

					const wasLocked = store._isLocked,
						actionsCallDepthPre = ++store._actionsCallDepth;

					store._isLocked = true;

					const result = Reflect.apply(method, this, args),
						actionsCallDepthPost = store._actionsCallDepth;

					if (actionsCallDepthPre === 1) {
						store._actionsCallDepth = 0;
					}

					if (isImmutable(result)) {

						if (actionsCallDepthPost > actionsCallDepthPre) {
							throw new Error(
								'Store is locked by another action.'
							);
						}

						store._isLocked = false;
						store._setState(result);
						store._isLocked = wasLocked;

						return;
					}

					store._isLocked = wasLocked;

					return result; // eslint-disable-line
				};
			}

			Reflect.defineProperty(this[methodName], 'name', {
				value: methodName
			});
		});
	}
}
