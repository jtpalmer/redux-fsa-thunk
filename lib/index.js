'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = fsaThunkMiddleware;

var _fluxStandardAction = require('flux-standard-action');

function isThunk(payload) {
  return typeof payload === 'function';
}

function fsaThunkMiddleware(_ref) {
  var dispatch = _ref.dispatch;
  var getState = _ref.getState;

  return function (next) {
    return function (action) {
      if ((0, _fluxStandardAction.isFSA)(action) && isThunk(action.payload)) {
        dispatch(_extends({}, action, { payload: null }));
        return action.payload(dispatch, getState);
      }

      return next(action);
    };
  };
}