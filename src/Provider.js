import React, {
	Component,
	Fragment
} from 'react';
import PropTypes from 'prop-types';
import Store from './Store';
import StoreContext from './StoreContext';

const {
	Provider: StoreContextProvider
} = StoreContext;

export default class Provider extends Component {

	static propTypes = {
		store:    PropTypes.instanceOf(Store).isRequired,
		children: PropTypes.any.isRequired
	}

	unsubscribe = null;

	constructor(props) {

		super(props);

		const {
			state: storeState,
			actions
		} = props.store;

		this.state = {
			storeState, // eslint-disable-line
			actions // eslint-disable-line
		};
	}

	render() {

		const {
			children
		} = this.props;

		return (
			<StoreContextProvider value={this.state}>
				<Fragment>
					{children}
				</Fragment>
			</StoreContextProvider>
		);
	}

	componentDidMount() {

		const {
			store
		} = this.props;

		this.unsubscribe = store.subscribe(() => {
			this.setState(() => ({
				storeState: store.state
			}));
		});
	}

	componentWillUnmount() {
		this.unsubscribe();
	}
}

if (process.env.NODE_ENV != 'production') {

	Provider.getDerivedStateFromProps =
	function getDerivedStateFromProps({ store }, { store: prevStore }) {

		if (store === prevStore) {
			return null;
		}

		prevStore.destroy();

		const {
			state: storeState,
			actions
		} = store;

		return {
			storeState,
			actions
		};
	};

	Provider.prototype.componentDidUpdate =
	function componentDidUpdate({ store: prevStore }) {

		const {
			store
		} = this.props;

		if (prevStore !== store) {
			this.unsubscribe = store.subscribe(() => {
				this.setState(() => ({
					storeState: store.state
				}));
			});
		}
	};
}
