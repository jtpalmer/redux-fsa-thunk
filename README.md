Redux FSA Thunk
===============

[FSA][]-compliant [thunk][] [middleware][] for [Redux][].

```sh
npm install redux-fsa-thunk
```

## Middleware Usage

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

```js
const action = {
  type: 'MY_THUNK',
  payload: (dispatch, getState) => {
    // Do something asynchronous and then dispatch another action.
  }
};
```

```js
const action = {
  type: 'FIRST_ACTION',
  payload: (dispatch, getState) => {
    dispatch({ type: 'SECOND_ACTION' });
    dispatch({ type: 'THIRD_ACTION' });
  }
};
```

## Usage with redux-actions

```js
import { createAction } from 'redux-actions';

const fetchUser = createAction('FETCH_USER', (id) => {
  return (dispatch, getState) => {
    fetch('/user/' + id).then(
      user => dispatch(fetchUserSuccess(user)),
      err => dispatch(fetchUserFailure(err)),
    )
  };
});

const fetchUserSuccess = createAction('FETCH_USER_SUCCESS');
const fetchUserFailure = createAction('FETCH_USER_FAILURE');

dispatch(fetchUser(1));
```

## Optimistic Updates

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
        err => dispatch(fetchUserFailure({ id, err })),
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
