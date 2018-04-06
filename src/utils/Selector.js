import defaultMergeProps from './mergeProps';
import initMapFunction from './initMapFunction';
import isEqual from './isEqual';

export default class Selector {

	constructor(
		mapStateToProps,
		mapActionsToProps,
		mergeProps = defaultMergeProps
	) {
		this.mapStateToProps = initMapFunction(mapStateToProps);
		this.mapActionsToProps = initMapFunction(mapActionsToProps);
		this.mergeProps = mergeProps;
		this.error = null;
		this.shouldComponentUpdate = true;
		this.hasRunAtLeastOnce = false;
		this.props = {};
		this.state = {};
		this.actions = {};
		this.ownProps = {};
		this.stateProps = {};
		this.actionsProps = {};
		this.mergedProps = {};
	}

	destroy() {

		const noop = initMapFunction(false);

		this.mapStateToProps = noop;
		this.mapActionsToProps = noop;
		this.mergeProps = noop;
		this.error = null;
		this.shouldComponentUpdate = false;
		this.props = {};
		this.hasRunAtLeastOnce = false;
		this.state = {};
		this.actions = {};
		this.ownProps = {};
		this.stateProps = {};
		this.actionsProps = {};
		this.mergedProps = {};
	}

	run(state, actions, ownProps) {

		try {

			const nextProps = this.hasRunAtLeastOnce
				? this.handleSubsequentCalls(state, actions, ownProps)
				: this.handleFirstCall(state, actions, ownProps);

			if (nextProps !== this.props || this.error) {
				this.shouldComponentUpdate = true;
				this.props = nextProps;
				this.error = null;
			}

		} catch (error) {
			this.shouldComponentUpdate = true;
			this.error = error;
		}
	}

	handleFirstCall(firstState, firstActions, firstOwnProps) {

		const {
			mapStateToProps,
			mapActionsToProps,
			mergeProps
		} = this;

		this.state = firstState;
		this.actions = firstActions;
		this.ownProps = firstOwnProps;
		this.stateProps = mapStateToProps(firstState, firstOwnProps);
		this.actionsProps = mapActionsToProps(firstActions, firstOwnProps);
		this.mergedProps = mergeProps(this.stateProps, this.actionsProps, firstOwnProps);
		this.hasRunAtLeastOnce = true;

		return this.mergedProps;
	}

	handleSubsequentCalls(nextState, nextActions, nextOwnProps) {

		const propsChanged = !isEqual(nextOwnProps, this.ownProps),
			actionsChanged = !isEqual(nextActions, this.actions),
			stateChanged = !isEqual(nextState, this.state);

		this.state = nextState;
		this.actions = nextActions;
		this.ownProps = nextOwnProps;

		if (propsChanged && actionsChanged && stateChanged) {
			return this.handleNewPropsAndNewActionsAndNewState();
		}

		if (propsChanged && stateChanged) {
			return this.handleNewPropsAndNewState();
		}

		if (propsChanged && actionsChanged) {
			return this.handleNewPropsAndNewActions();
		}

		if (actionsChanged && stateChanged) {
			return this.handleNewActionsAndNewState();
		}

		if (propsChanged) {
			this.handleNewProps();
		}

		if (actionsChanged) {
			this.handleNewActions();
		}

		if (stateChanged) {
			this.handleNewState();
		}

		return this.mergedProps;
	}

	handleNewPropsAndNewActionsAndNewState() {

		const {
			mapStateToProps,
			mapActionsToProps,
			mergeProps,
			state,
			actions,
			ownProps
		} = this;

		this.stateProps = mapStateToProps(state, ownProps);
		this.actionsProps = mapActionsToProps(actions, ownProps);
		this.mergedProps = mergeProps(this.stateProps, this.actionsProps, ownProps);

		return this.mergedProps;
	}

	handleNewPropsAndNewState() {

		const {
			mapStateToProps,
			mapActionsToProps,
			mergeProps,
			state,
			actions,
			ownProps
		} = this;

		this.stateProps = mapStateToProps(state, ownProps);

		if (mapActionsToProps.dependsOnOwnProps) {
			this.actionsProps = mapActionsToProps(actions, ownProps);
		}

		this.mergedProps = mergeProps(this.stateProps, this.actionsProps, ownProps);

		return this.mergedProps;
	}

	handleNewPropsAndNewActions() {

		const {
			mapStateToProps,
			mapActionsToProps,
			mergeProps,
			state,
			actions,
			ownProps
		} = this;

		this.actionsProps = mapActionsToProps(actions, ownProps);

		if (mapStateToProps.dependsOnOwnProps) {
			this.stateProps = mapStateToProps(state, ownProps);
		}

		this.mergedProps = mergeProps(this.stateProps, this.actionsProps, ownProps);

		return this.mergedProps;
	}

	handleNewActionsAndNewState() {

		const {
			mapStateToProps,
			mapActionsToProps,
			mergeProps,
			state,
			actions,
			ownProps
		} = this;

		this.actionsProps = mapActionsToProps(actions, ownProps);
		this.stateProps = mapStateToProps(state, ownProps);
		this.mergedProps = mergeProps(this.stateProps, this.actionsProps, ownProps);

		return this.mergedProps;
	}

	handleNewProps() {

		const {
			mapStateToProps,
			mapActionsToProps,
			mergeProps,
			state,
			actions,
			ownProps
		} = this;

		if (mapStateToProps.dependsOnOwnProps) {
			this.stateProps = mapStateToProps(state, ownProps);
		}

		if (mapActionsToProps.dependsOnOwnProps) {
			this.actionsProps = mapActionsToProps(actions, ownProps);
		}

		this.mergedProps = mergeProps(this.stateProps, this.actionsProps, ownProps);

		return this.mergedProps;
	}

	handleNewActions() {

		const {
			mapActionsToProps,
			mergeProps,
			actions,
			stateProps,
			ownProps
		} = this;

		const nextActionsProps = mapActionsToProps(actions, ownProps),
			actionsPropsChanged = !isEqual(nextActionsProps, this.actionsProps);

		this.actionsProps = nextActionsProps;

		if (actionsPropsChanged) {
			this.mergedProps = mergeProps(stateProps, this.actionsProps, ownProps);
		}

		return this.mergedProps;
	}

	handleNewState() {

		const {
			mapStateToProps,
			mergeProps,
			state,
			actionsProps,
			ownProps
		} = this;

		const nextStateProps = mapStateToProps(state, ownProps),
			statePropsChanged = !isEqual(nextStateProps, this.stateProps);

		this.stateProps = nextStateProps;

		if (statePropsChanged) {
			this.mergedProps = mergeProps(this.stateProps, actionsProps, ownProps);
		}

		return this.mergedProps;
	}
}
