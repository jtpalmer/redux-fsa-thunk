# redux-fsa-thunk

[![Build Status](https://travis-ci.org/jtpalmer/redux-fsa-thunk.svg?branch=master)](https://travis-ci.org/jtpalmer/redux-fsa-thunk)

[FSA][]-compliant [thunk][] [middleware][] for [Redux][].

```sh
npm install redux-fsa-thunk
```

## Middleware Usage

The middleware function is the default export and is used like any other
middleware.

```js
import { createStore, applyMiddleware } from 'redux';
import fsaThunkMiddleware from 'redux-fsa-thunk';
import rootReducer from './reducers';

const store = createStore(
  rootReducer,
  applyMiddleware(fsaThunkMiddleware)
);
```

## Actions

Like [redux-thunk][], redux-fsa-thunk is used to allow action creators
to return functions that dispatch other actions, possibly asynchronously
or conditionally.  The first difference is that redux-fsa-thunk
middleware only handles FSA actions.  The `payload` of the action
must be a function.  Another difference from redux-thunk is that in
addition to any actions dispatched inside the function, the original
action is also dispatched before executing the function, but with the
function removed from the `payload` and replaced with `null`.

```js
const action = {
  type: 'EXAMPLE_ACTION',
  payload: (dispatch, getState) => {
    // Dispatch other actions here.
  }
};
```

The thunk function will be executed synchronously and the `dispatch` and
`getState` functions from the `store` are passed as arguments to the
function.

```js
const action = {
  type: 'FIRST_ACTION',
  payload: (dispatch, getState) => {
    dispatch({ type: 'SECOND_ACTION' });

    if (getState().foo) {
      dispatch({ type: 'THIRD_ACTION' });
    }

    fetch('/data')
      .then(response => response.json())
      .then(json => dispatch({ type: 'FOURTH_ACTION', payload: json });
  }
};
```

## Usage with redux-actions

Since redux-fsa-thunk only handles FSA actions you can use
[redux-actions][] to create thunk actions.

```js
import { createAction } from 'redux-actions';

const fetchUser = createAction('FETCH_USER', (id) => {
  return (dispatch, getState) => {
    fetch('/user/' + id).then(
      user => dispatch(fetchUserSuccess(user)),
      err => dispatch(fetchUserFailure(err))
    )
  };
});

const fetchUserSuccess = createAction('FETCH_USER_SUCCESS');
const fetchUserFailure = createAction('FETCH_USER_FAILURE');

dispatch(fetchUser(1));
```

## Optimistic Updates

One common use case for thunks is performing optimistic updates before
any asynchronous operations complete.  In this example an update to a
user in the store is dispatched and the store is updated synchronously,
but the previous user state is stored so that it can be rolled back if
the asynchronous update fails.

```js
import { createAction, handleActions } from 'redux-actions';

const updateUser = createAction(
  'UPDATE_USER',
  (id, data) => {
    return (dispatch, getState) => {
      fetch('/user/' + id, {
        method: 'post',
        credentials: 'same-origin',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }).then(
        user => dispatch(fetchUserSuccess({ id, user })),
        err => dispatch(fetchUserFailure({ id, err }))
      )
    };
  },
  (id, data) => { id, data }
);

const updateUserSuccess = createAction('UPDATE_USER_SUCCESS');
const updateUserFailure = createAction('UPDATE_USER_FAILURE');

const initialState = {
  users: {
    'j.doe': {
      name: 'John Doe'
    }
  },
  rollbackData: {
  }
};

const reducer = handleActions({
  'UPDATE_USER': function (state, action) {
    const { id, data } = action.meta;

    return {
      users: {
        ...state.users,
        [id]: { ...state.users[id], ...data }
      },
      rollbackData: {
        ...state.rollbackData,
        [id]: state.users[id]
      }
    };
  },
  'UPDATE_USER_SUCCESS': function (state, action) {
    const { id } = action.payload;

    return {
      users: state.users,
      rollbackData: {
        ...state.rollbackData,
        [id]: {}
      }
    };
  },
  'UPDATE_USER_FAILURE': function (state, action) {
    const { id } = action.payload;

    return {
      users: {
        ...state.users,
        [id]: { ...state.users[id], ...state.rollbackData[id] }
      },
      rollbackData: {
        ...state.rollbackData,
        [id]: {}
      }
    };
  },
}, initialState);

dispatch(updateUser('j.doe', { name: 'Jack Doe' }));
```

## See Also

- [Redux][]
- [flux-standard-action][fsa]
- [redux-actions][]
- [redux-promise][]
- [redux-promise-middleware][]
- [redux-thunk][]

[fsa]: https://github.com/acdlite/flux-standard-action/
[middleware]: http://redux.js.org/docs/advanced/Middleware.html
[redux-actions]: https://github.com/acdlite/redux-actions/
[redux-promise-middleware]: https://github.com/pburtchaell/redux-promise-middleware/
[redux-promise]: https://github.com/acdlite/redux-promise/
[redux-thunk]: https://github.com/gaearon/redux-thunk/
[redux]: http://redux.js.org/
[thunk]: https://en.wikipedia.org/wiki/Thunk
