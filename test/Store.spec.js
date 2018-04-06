import {
	List,
	fromJS,
	is
} from 'immutable';
import Store from '../src/Store';
import Todos from './Todos';

describe('Store', () => {

	it('should create Store instance', () => {

		const store = new Store({
			Todos
		});

		expect(store.subscribe).toBeInstanceOf(Function);

		expect(store.state).toBeInstanceOf(Object);
		expect(store.state.get('todos')).toBeInstanceOf(List);

		expect(store.actions).toBeInstanceOf(Object);

		const { todos } = store.actions;

		expect(todos).toBeInstanceOf(Object);
		expect(todos.loadItems).toBeInstanceOf(Function);
		expect(todos.setItems).toBeInstanceOf(Function);
		expect(todos.addItem).toBeInstanceOf(Function);
		expect(todos.removeItem).toBeInstanceOf(Function);
	});

	it('should destroy Store', () => {

		const store = new Store({
			Todos
		});

		store.destroy();

		expect(store._state).toBeNull();
		expect(store._actions).toBeNull();
		expect(store._subscriptions).toBeNull();
		expect(store._isLocked).toBeNull();
	});

	it('should create Store instance without namespaces', () => {

		const store = new Store(Todos);

		expect(store.subscribe).toBeInstanceOf(Function);

		expect(store.state).toBeInstanceOf(List);
		expect(store.actions).toBeInstanceOf(Object);

		const { actions } = store;

		expect(actions.loadItems).toBeInstanceOf(Function);
		expect(actions.setItems).toBeInstanceOf(Function);
		expect(actions.addItem).toBeInstanceOf(Function);
		expect(actions.removeItem).toBeInstanceOf(Function);
	});

	it('should set force state', () => {

		const forceState = {
			todos: [
				'1st todo',
				'2nd todo'
			]
		};

		const store = new Store({
			Todos
		}, forceState);

		expect(is(
			store.state,
			fromJS(forceState)
		)).toBe(true);
	});

	it('should apply reducer to the previous state', async () => {

		const store = new Store({
			Todos
		});

		expect(store.state.get('todos').toJS()).toEqual([]);

		store.actions.todos.addItem('1st todo');
		store.actions.todos.addItem('2nd todo');

		expect(store.state.get('todos').toJS()).toEqual([
			'1st todo',
			'2nd todo'
		]);

		store.actions.todos.removeItem(1);

		expect(store.state.get('todos').toJS()).toEqual([
			'1st todo'
		]);

		store.actions.todos.setItems([]);

		expect(store.state.get('todos').toJS()).toEqual([]);

		expect(await store.actions.todos.loadItems()).toBe(true);

		expect(store.state.get('todos').toJS()).toEqual([
			'todo "from server"'
		]);

		store.actions.todos.setItems([]);

		expect(store.state.get('todos').toJS()).toEqual([]);
	});

	it('should apply reducer to the previous state without namespaces', async () => {

		const store = new Store(Todos);

		expect(store.state.toJS()).toEqual([]);

		store.actions.addItem('1st todo');
		store.actions.addItem('2nd todo');

		expect(store.state.toJS()).toEqual([
			'1st todo',
			'2nd todo'
		]);

		store.actions.removeItem(1);

		expect(store.state.toJS()).toEqual([
			'1st todo'
		]);

		store.actions.setItems([]);

		expect(store.state.toJS()).toEqual([]);
		expect(await store.actions.loadItems()).toBe(true);
		expect(store.state.toJS()).toEqual([
			'todo "from server"'
		]);

		store.actions.setItems([]);

		expect(store.state.toJS()).toEqual([]);
	});

	it('should apply reducer to the force state', async () => {

		const store = new Store({
			Todos
		}, {
			todos: [
				'1st todo'
			]
		});

		store.actions.todos.addItem('2nd todo');

		expect(store.state.get('todos').toJS()).toEqual([
			'1st todo',
			'2nd todo'
		]);
	});

	it('should support multiple subscriptions', () => {

		const store = new Store({
			Todos
		});

		const listenerA = jest.fn(),
			listenerB = jest.fn();

		let unsubscribeA = store.subscribe(listenerA);

		store.actions.todos.addItem('1st todo');
		expect(listenerA.mock.calls.length).toBe(1);
		expect(listenerB.mock.calls.length).toBe(0);

		store.actions.todos.removeItem(0);
		expect(listenerA.mock.calls.length).toBe(2);
		expect(listenerB.mock.calls.length).toBe(0);

		const unsubscribeB = store.subscribe(listenerB);

		expect(listenerA.mock.calls.length).toBe(2);
		expect(listenerB.mock.calls.length).toBe(0);

		store.actions.todos.addItem('1st todo');
		expect(listenerA.mock.calls.length).toBe(3);
		expect(listenerB.mock.calls.length).toBe(1);

		unsubscribeA();
		expect(listenerA.mock.calls.length).toBe(3);
		expect(listenerB.mock.calls.length).toBe(1);

		store.actions.todos.addItem('2nd todo');
		expect(listenerA.mock.calls.length).toBe(3);
		expect(listenerB.mock.calls.length).toBe(2);

		unsubscribeB();
		expect(listenerA.mock.calls.length).toBe(3);
		expect(listenerB.mock.calls.length).toBe(2);

		store.actions.todos.addItem('3rd todo');
		expect(listenerA.mock.calls.length).toBe(3);
		expect(listenerB.mock.calls.length).toBe(2);

		unsubscribeA = store.subscribe(listenerA);
		expect(listenerA.mock.calls.length).toBe(3);
		expect(listenerB.mock.calls.length).toBe(2);

		store.actions.todos.setItems([]);
		expect(listenerA.mock.calls.length).toBe(4);
		expect(listenerB.mock.calls.length).toBe(2);
	});

	it('should remove listener only once when unsubscribe is called', () => {

		const store = new Store({
			Todos
		});

		const listenerA = jest.fn(),
			listenerB = jest.fn();

		const unsubscribeA = store.subscribe(listenerA);

		store.subscribe(listenerB);

		unsubscribeA();
		unsubscribeA();

		store.actions.todos.addItem('1st todo');
		expect(listenerA.mock.calls.length).toBe(0);
		expect(listenerB.mock.calls.length).toBe(1);
	});

	it('should remove only relevant listener when unsubscribe is called', () => {

		const store = new Store({
			Todos
		});

		const listener = jest.fn();

		store.subscribe(listener);

		const unsubscribeSecond = store.subscribe(listener);

		unsubscribeSecond();
		unsubscribeSecond();

		store.actions.todos.addItem('1st todo');
		expect(listener.mock.calls.length).toBe(1);
	});

	it('should support removing a subscription within a subscription', () => {

		const store = new Store({
			Todos
		});

		const listenerA = jest.fn(),
			listenerB = jest.fn(),
			listenerC = jest.fn();

		store.subscribe(listenerA);

		const unSubB = store.subscribe(() => {
			listenerB();
			unSubB();
		});

		store.subscribe(listenerC);

		store.actions.todos.addItem('1st todo');
		store.actions.todos.addItem('2nd todo');

		expect(listenerA.mock.calls.length).toBe(2);
		expect(listenerB.mock.calls.length).toBe(1);
		expect(listenerC.mock.calls.length).toBe(2);
	});

	it('should notify all subscribers about current dispatch regardless if any of them gets unsubscribed in the process', () => {

		const store = new Store({
			Todos
		});

		const unsubscribeHandles = [];

		const doUnsubscribeAll = () =>
			unsubscribeHandles.forEach(unsubscribe => unsubscribe());

		const listener1 = jest.fn(),
			listener2 = jest.fn(),
			listener3 = jest.fn();

		unsubscribeHandles.push(
			store.subscribe(() => listener1())
		);
		unsubscribeHandles.push(
			store.subscribe(() => {
				listener2();
				doUnsubscribeAll();
			})
		);
		unsubscribeHandles.push(
			store.subscribe(() => listener3())
		);

		store.actions.todos.addItem('1st todo');
		expect(listener1.mock.calls.length).toBe(1);
		expect(listener2.mock.calls.length).toBe(1);
		expect(listener3.mock.calls.length).toBe(1);

		store.actions.todos.addItem('2nd todo');
		expect(listener1.mock.calls.length).toBe(1);
		expect(listener2.mock.calls.length).toBe(1);
		expect(listener3.mock.calls.length).toBe(1);
	});

	it('should notify only subscribers active at the moment of current dispatch', () => {

		const store = new Store({
			Todos
		});

		const listener1 = jest.fn(),
			listener2 = jest.fn(),
			listener3 = jest.fn();

		let listener3Added = false;

		const maybeAddThirdListener = () => {

			if (!listener3Added) {
				listener3Added = true;
				store.subscribe(() => listener3());
			}
		};

		store.subscribe(() => listener1());
		store.subscribe(() => {
			listener2();
			maybeAddThirdListener();
		});

		store.actions.todos.addItem('1st todo');
		expect(listener1.mock.calls.length).toBe(1);
		expect(listener2.mock.calls.length).toBe(1);
		expect(listener3.mock.calls.length).toBe(0);

		store.actions.todos.addItem('2nd todo');
		expect(listener1.mock.calls.length).toBe(2);
		expect(listener2.mock.calls.length).toBe(2);
		expect(listener3.mock.calls.length).toBe(1);
	});

	it('should use the last snapshot of subscribers during nested dispatch', () => {

		const store = new Store({
			Todos
		});

		const listener1 = jest.fn(),
			listener2 = jest.fn(),
			listener3 = jest.fn(),
			listener4 = jest.fn();

		let unsubscribe4 = null;

		const unsubscribe1 = store.subscribe(() => {

			listener1();
			expect(listener1.mock.calls.length).toBe(1);
			expect(listener2.mock.calls.length).toBe(0);
			expect(listener3.mock.calls.length).toBe(0);
			expect(listener4.mock.calls.length).toBe(0);

			unsubscribe1();
			unsubscribe4 = store.subscribe(listener4);

			store.actions.todos.addItem('1st todo');
			expect(listener1.mock.calls.length).toBe(1);
			expect(listener2.mock.calls.length).toBe(1);
			expect(listener3.mock.calls.length).toBe(1);
			expect(listener4.mock.calls.length).toBe(1);
		});

		store.subscribe(listener2);
		store.subscribe(listener3);

		store.actions.todos.addItem('2nd todo');
		expect(listener1.mock.calls.length).toBe(1);
		expect(listener2.mock.calls.length).toBe(2);
		expect(listener3.mock.calls.length).toBe(2);
		expect(listener4.mock.calls.length).toBe(1);

		unsubscribe4();
		store.actions.todos.addItem('3rd todo');
		expect(listener1.mock.calls.length).toBe(1);
		expect(listener2.mock.calls.length).toBe(3);
		expect(listener3.mock.calls.length).toBe(3);
		expect(listener4.mock.calls.length).toBe(1);
	});

	it('should provide an up-to-date state when a subscriber is notified', (done) => {

		const store = new Store({
			Todos
		});

		store.subscribe(() => {
			expect(is(
				store.state,
				fromJS({
					todos: ['1st todo']
				})
			)).toBe(true);
			done();
		});

		store.actions.todos.addItem('1st todo');
	});

	it('should not leak private listeners array', (done) => {

		const store = new Store({
			Todos
		});

		store.subscribe(function listener() {
			expect(this).toBeUndefined();
			done();
		});

		store.actions.todos.addItem('1st todo');
	});

	it('should handle nested dispatches gracefully', () => {

		const store = new Store({
			Todos
		});

		store.subscribe(() => {

			const { state } = store;

			if (state.get('todos').count() == 1) {
				store.actions.todos.addItem('2nd todo');
			}
		});

		store.actions.todos.addItem('1st todo');
		expect(is(
			store.state,
			fromJS({
				todos: ['1st todo', '2nd todo']
			})
		)).toBe(true);
	});
});
