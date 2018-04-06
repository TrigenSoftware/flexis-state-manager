# @flexis/state-manager

[![NPM version][npm]][npm-url]
[![Dependency status][deps]][deps-url]
[![Build status][build]][build-url]
[![Coverage status][coverage]][coverage-url]

[npm]: https://img.shields.io/npm/v/%40flexis/state-manager.svg
[npm-url]: https://npmjs.com/package/@flexis/state-manager

[deps]: https://david-dm.org/TrigenSoftware/flexis-state-manager.svg
[deps-url]: https://david-dm.org/TrigenSoftware/flexis-state-manager

[build]: http://img.shields.io/travis/TrigenSoftware/flexis-state-manager.svg
[build-url]: https://travis-ci.org/TrigenSoftware/flexis-state-manager

[coverage]: https://img.shields.io/coveralls/TrigenSoftware/flexis-state-manager.svg
[coverage-url]: https://coveralls.io/r/TrigenSoftware/flexis-state-manager

Lightweight alternative of [Redux](https://github.com/reactjs/redux), inspired by [Hyperapp](https://github.com/hyperapp/hyperapp), based on [ImmutableJS](https://github.com/facebook/immutable-js/).

## Install

```sh
npm i -S @flexis/state-manager
# or
yarn add @flexis/state-manager
```

## API

### `class Store(actions: Object<string, Actions>|Actions)`

#### `destroy(): void`

#### `subscribe(listener: (state: Immutable.Collection) => void): () => void`

#### `get state(): Immutable.Collection`

#### `get actions(): Object<string, Object<string, Function>|Function>`

### `class Actions(store: Store, namespace?: string)`

### `<Provider store={store: Store}>{children}</Provder>`

### `@connect(mapStateToProps, mapActionsToProps, mergeProps, { withRef: bool } = { withRef: false })`

---
[![NPM](https://nodeico.herokuapp.com/@flexis/state-manager.svg?downloads=true&downloadRank=true&stars=true)](https://npmjs.com/package/@flexis/state-manager)
