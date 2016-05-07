import expect, { createSpy } from 'expect';
import { createAction } from 'redux-actions';
import fsaThunkMiddleware from '../lib/index';

describe('Redux FSA Thunk Middleware', function () {
  it('is a function', function () {
    expect(fsaThunkMiddleware).toBeA(Function);
  });

  describe('returns a next handler', function () {
    const dispatchSpy = createSpy();
    const getStateSpy = createSpy();
    const store = { dispatch: dispatchSpy, getState: getStateSpy };
    const nextHandler = fsaThunkMiddleware(store);

    it('is a function', function () {
      expect(nextHandler).toBeA(Function);
    });

    describe('returns an action handler', function () {
      const nextSpy = createSpy();
      const actionHandler = nextHandler(nextSpy);

      beforeEach(function () {
        nextSpy.reset();
      });

      it('is a function', function () {
        expect(actionHandler).toBeA(Function);
      });

      it('passes non-FSA actions', function () {
        const nonFsaAction = { random: 'stuff' };
        actionHandler(nonFsaAction);
        expect(nextSpy).toHaveBeenCalled();
        expect(nextSpy).toHaveBeenCalledWith(nonFsaAction);
      });

      it('passes non-thunk FSA actions', function () {
        const fsaNonThunkAction = createAction('FSA_ACTION')();
        actionHandler(fsaNonThunkAction);
        expect(nextSpy).toHaveBeenCalled();
        expect(nextSpy).toHaveBeenCalledWith(fsaNonThunkAction);
      });

      describe('handles thunk FSA actions', function () {
        const thunkSpy = createSpy();
        const fsaThunkAction = createAction('FSA_THUNK', () => thunkSpy)();

        beforeEach(function () {
          nextSpy.reset();
          dispatchSpy.reset();
          getStateSpy.reset();
          thunkSpy.reset();
          actionHandler(fsaThunkAction);
        });

        it('does not pass the action', function () {
          expect(nextSpy).toNotHaveBeenCalled();
        });

        it('dispatches the action', function () {
          expect(dispatchSpy).toHaveBeenCalled();
          expect(dispatchSpy.calls[0].arguments[0]).toInclude({
            type: fsaThunkAction.type
          });
        });

        it('calls the thunk with dispatch and getState', function () {
          expect(thunkSpy).toHaveBeenCalled();
          expect(thunkSpy).toHaveBeenCalledWith(dispatchSpy, getStateSpy);
        });
      });
    });
  });
});
