import {
	Component,
	createElement
} from 'react';
import PropTypes from 'prop-types';
import hoistNonReactStatics from 'hoist-non-react-statics';
import Selector from './utils/Selector';
import Subscription from './utils/Subscription';
import Store from './Store';

const dummyState = {},
	noop = () => {};

let hotReloadingVersion = 0;

export default function Connect(
	mapStateToProps,
	mapActionsToProps,
	mergeProps,
	{
		withRef
	} = {
		withRef: false
	}
) {

	const shouldHandleStateChanges = Boolean(mapStateToProps),
		version = hotReloadingVersion++;

	return (WrappedComponent) => {

		const wrappedComponentName = WrappedComponent.displayName
			|| WrappedComponent.name
			|| 'Component';

		const displayName = `Connect(${wrappedComponentName})`;

		class Connect extends Component {

			static WrappedComponent = WrappedComponent;
			static displayName = displayName;

			static contextTypes = {
				store:        PropTypes.instanceOf(Store),
				subscription: PropTypes.instanceOf(Subscription)
			};

			static childContextTypes = {
				subscription: PropTypes.instanceOf(Subscription)
			};

			constructor(props, context) {

				super(props, context);

				this.version = version;
				this.state = {};
				this.store = context.store;
				this.wrappedInstance = null;

				this.initSelector();
				this.initSubscription();
			}

			render() {

				const {
					selector
				} = this;

				selector.shouldComponentUpdate = false;

				if (selector.error) {
					throw selector.error;
				} else {
					return createElement(
						WrappedComponent,
						this.addExtraProps(selector.props)
					);
				}
			}

			getChildContext() {

				const {
					subscription
				} = this;

				const {
					subscription: parentSub
				} = this.context;

				return {
					subscription: subscription || parentSub
				};
			}

			componentWillReceiveProps(nextProps) {

				const {
					state,
					actions
				} = this.store;

				this.selector.run(
					state,
					actions,
					nextProps
				);
			}

			shouldComponentUpdate() {
				return this.selector.shouldComponentUpdate;
			}

			componentWillUnmount() {

				if (this.subscription) {
					this.subscription.tryUnsubscribe();
				}

				if (this.selector) {
					this.selector.destroy();
				}

				this.subscription = null;
				this.selector = null;
				this.notifyNestedSubs = noop;
				this.store = null;
			}

			onWrappedInstance() {
				return (ref) => {
					this.wrappedInstance = ref;
				};
			}

			onStateChange() {
				return () => {

					const {
						state,
						actions
					} = this.store;

					this.selector.run(
						state,
						actions,
						this.props
					);

					if (!this.selector.shouldComponentUpdate) {
						this.notifyNestedSubs();
					} else {
						this.componentDidUpdate = this.notifyNestedSubsOnComponentDidUpdate;
						this.setState(dummyState);
					}
				};
			}

			initSelector() {

				const selector = new Selector(
					mapStateToProps,
					mapActionsToProps,
					mergeProps
				);

				const {
					state,
					actions
				} = this.store;

				this.selector = selector;
				this.selector.run(
					state,
					actions,
					this.props
				);
			}

			notifyNestedSubs() {
				this.subscription.notifyNestedSubs();
			}

			notifyNestedSubsOnComponentDidUpdate() {
				this.componentDidUpdate = global.undefined;
				this.notifyNestedSubs();
			}

			getWrappedInstance() {
				return this.wrappedInstance;
			}
		}

		if (shouldHandleStateChanges) {

			Connect.prototype.componentDidMount =
			function componentDidMount() {

				const {
					state,
					actions
				} = this.store;

				this.subscription.trySubscribe();

				this.selector.run(
					state,
					actions,
					this.props
				);

				if (this.selector.shouldComponentUpdate) {
					this.forceUpdate();
				}
			};

			Connect.prototype.initSubscription =
			function initSubscription() {

				const {
					subscription: parentSub
				} = this.context;

				const subscription = new Subscription(
					this.store,
					parentSub,
					this.onStateChange()
				);

				this.subscription = subscription;
			};

		} else {
			Connect.prototype.initSubscription =
			function initSubscription() {};
		}

		if (withRef) {
			Connect.prototype.addExtraProps =
			function addExtraProps(props) {
				return {
					...props,
					ref: this.onWrappedInstance()
				};
			};
		} else {
			Connect.prototype.addExtraProps =
			function addExtraProps(props) {
				return props;
			};
		}

		if (process.env.NODE_ENV != 'production') {
			Connect.prototype.componentWillUpdate =
			function componentWillUpdate(nextProps, nextState, { store }) {

				if (this.version === version) {
					return;
				}

				if (store != this.store) {
					this.store = store;
				}

				this.version = version;
				this.selector.destroy();
				this.initSelector();

				let oldListeners = [];

				if (this.subscription) {
					oldListeners = this.subscription.listeners.get();
					this.subscription.tryUnsubscribe();
				}

				this.initSubscription();

				if (shouldHandleStateChanges) {
					this.subscription.trySubscribe();
					oldListeners.forEach(listener =>
						this.subscription.listeners.subscribe(listener)
					);
				}
			};
		}

		return hoistNonReactStatics(Connect, WrappedComponent);
	};
}
