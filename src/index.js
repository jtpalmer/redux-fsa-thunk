import { isFSA } from 'flux-standard-action';

function isThunk(payload) {
  return typeof payload === 'function';
}

export default function fsaThunkMiddleware({ dispatch, getState }) {
  return next => action => {
    if (isFSA(action) && isThunk(action.payload)) {
      dispatch({ ...action, payload: null });
      return action.payload(dispatch, getState);
    }

    return next(action);
  };
}
