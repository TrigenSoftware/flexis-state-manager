import {
	fromJS,
	is
} from 'immutable';
import Todos from './Todos';

describe('Actions', () => {

	const mockState = fromJS({
		todos: [
			'1st todo',
			'2nd todo'
		]
	});

	const mockStore = {
		state:             mockState,
		_setState:         () => {},
		_isLocked:         false,
		_actionsCallDepth: 0
	};

	it('should create Actions instance', () => {

		const todos = new Todos({
			...mockStore
		}, 'todos');

		expect(todos.loadItems).toBeInstanceOf(Function);
		expect(todos.setItems).toBeInstanceOf(Function);
		expect(todos.addItem).toBeInstanceOf(Function);
		expect(todos.removeItem).toBeInstanceOf(Function);
	});

	it('should create Actions instance without namespace', () => {

		const todos = new Todos({
			...mockStore
		});

		expect(todos.loadItems).toBeInstanceOf(Function);
		expect(todos.setItems).toBeInstanceOf(Function);
		expect(todos.addItem).toBeInstanceOf(Function);
		expect(todos.removeItem).toBeInstanceOf(Function);
	});

	it('should define state getters', () => {

		const todos = new Todos({
			...mockStore
		}, 'todos');

		expect(is(
			todos.state,
			mockState.get('todos')
		)).toBe(true);

		expect(is(
			todos.globalState,
			mockState
		)).toBe(true);
	});

	it('should define state getters without namespace', () => {

		const todos = new Todos({
			...mockStore,
			state: mockState.get('todos')
		});

		expect(is(
			todos.state,
			mockState.get('todos')
		)).toBe(true);

		expect(is(
			todos.globalState,
			mockState.get('todos')
		)).toBe(true);
	});

	it('should wrap methods', async () => {

		const setState = jest.fn();

		const todos = new Todos({
			...mockStore,
			_setState: setState
		}, 'todos');

		todos.addItem('todo');
		expect(await todos.loadItems()).toBe(true);
		expect(setState.mock.calls.length).toBe(3);
	});

	it('should prevent reducer call in another reducer', () => {

		const todos = new Todos({
			...mockStore
		}, 'todos');

		expect(() => todos.wrongAction()).toThrowError();
	});

	it('should prevent reducer call in another reducer without namespace', () => {

		const todos = new Todos({
			...mockStore,
			state: mockState.get('todos')
		});

		expect(() => todos.wrongAction()).toThrowError();
	});
});
