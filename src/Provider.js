import {
	Component,
	Fragment,
	createElement
} from 'react';
import PropTypes from 'prop-types';
import Store from './Store';

export default class Provider extends Component {

	static propTypes = {
		store:    PropTypes.instanceOf(Store).isRequired,
		children: PropTypes.any.isRequired
	}

	static childContextTypes = {
		store: PropTypes.instanceOf(Store).isRequired
	}

	constructor(props, context) {

		super(props, context);

		this.state = {
			store: props.store
		};
	}

	render() {

		const { children } = this.props;

		return createElement(Fragment, null, children);
	}

	getChildContext() {

		const { store } = this.state;

		return { store };
	}
}

if (process.env.NODE_ENV != 'production') {

	Provider.prototype.componentWillReceiveProps =
	function componentWillReceiveProps({ store }) {

		const { store: prevStore } = this.state;

		if (store != prevStore) {
			this.setState(() => ({ store }));
			prevStore.destroy();
		}
	};
}
