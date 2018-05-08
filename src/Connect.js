import React, {
	Component,
	createElement
} from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import Selector from './utils/Selector';
import StoreContext from './StoreContext';

const {
	Consumer: StoreContextConsumer
} = StoreContext;

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

	const version = hotReloadingVersion++;

	return (WrappedComponent) => {

		const wrappedComponentName = WrappedComponent.displayName
			|| WrappedComponent.name
			|| 'Component';

		const displayName = `Connect(${wrappedComponentName})`;

		class Connect extends Component {

			static WrappedComponent = WrappedComponent;
			static displayName = displayName;

			renderChild = this.renderChild.bind(this);
			onWrappedInstance = this.onWrappedInstance.bind(this);

			version = version;
			selector = null;
			wrappedInstance = null;
			renderedChild = null;

			render() {
				return (
					<StoreContextConsumer>
						{this.renderChild}
					</StoreContextConsumer>
				);
			}

			renderChild({
				storeState,
				actions
			}) {

				if (this.selector === null) {
					this.initSelector(storeState, actions);
				} else {
					this.selector.run(
						storeState,
						actions,
						this.props
					);
				}

				const {
					selector
				} = this;

				if (selector.error) {
					throw selector.error;
				} else
				if (selector.shouldComponentUpdate) {
					selector.shouldComponentUpdate = false;
					this.renderedChild = createElement(
						WrappedComponent,
						this.addExtraProps(selector.props)
					);
				}

				return this.renderChild;
			}

			componentWillUnmount() {

				if (this.selector !== null) {
					this.selector.destroy();
				}

				this.selector = null;
			}

			onWrappedInstance(ref) {
				this.wrappedInstance = ref;
			}

			getWrappedInstance() {
				return this.wrappedInstance;
			}

			initSelector(storeState, actions) {

				const selector = new Selector(
					mapStateToProps,
					mapActionsToProps,
					mergeProps
				);

				this.selector = selector;
				selector.run(
					storeState,
					actions,
					this.props
				);
			}
		}

		if (withRef) {
			Connect.prototype.addExtraProps =
			function addExtraProps(props) {
				return {
					...props,
					ref: this.onWrappedInstance
				};
			};
		} else {
			Connect.prototype.addExtraProps =
			function addExtraProps(props) {
				return props;
			};
		}

		if (process.env.NODE_ENV != 'production') {

			const {
				renderChild
			} = Connect.prototype;

			Connect.prototype.renderChild =
			function renderChildWithHotReload(context) {

				if (this.version !== version) {
					this.version = version;
					this.selector.destroy();
					this.initSelector();
				}

				Reflect.apply(renderChild, this, [context]);
			};
		}

		return hoistNonReactStatics(Connect, WrappedComponent);
	};
}
