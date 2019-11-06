import { call, put, select } from 'redux-saga/effects';

import { creators as BalanceSheetActions } from '../Reducers/BalanceSheet';
import ApiBalanceSheet from '../Api/ApiBalanceSheet';

export function * getBalanceSheetQuerys({payload}) {
  try {
    const response = yield call(ApiBalanceSheet.getQuerys, payload.dimdate);

    if (response.status === 200) {
      yield put(BalanceSheetActions.glbsSuccess({queryResult: response.data}));
    }
  } catch(e) {
    yield put(BalanceSheetActions.glbsFailure(e));
  }
}

