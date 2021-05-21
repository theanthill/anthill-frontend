import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { save, load } from 'redux-localstorage-simple';
import transactions from './transactions/reducer';
import application from './application/reducer';

const PERSISTED_KEYS: string[] = ['transactions'];
const middlewares = getDefaultMiddleware({ thunk: false });
middlewares.push(save({ states: PERSISTED_KEYS }));

const store = configureStore({
  reducer: {
    application,
    transactions,
  },
  middleware: middlewares,
  preloadedState: load({ states: PERSISTED_KEYS }),
});

export default store;

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
