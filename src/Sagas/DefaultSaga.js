import { call, put, select } from 'redux-saga/effects';

import { creators as DefaultActions } from '../Reducers/Default';
import ApiDefault from '../Api/ApiDefault';

export function * getDefaultInfo({payload}) {
  try {
    const response = yield call(ApiDefault.getDefaultInfo, payload.OrgName);

    if (response.status === 200) {
      yield put(DefaultActions.defaultSuccess({defaultInfo: response.data}));
    }
  } catch(e) {
    yield put(DefaultActions.defaultFailure(e));
  }
}
