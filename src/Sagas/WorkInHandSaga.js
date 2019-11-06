import { call, put, select } from 'redux-saga/effects';

import { creators as WorkInHandActions } from '../Reducers/WorkInHand';
import ApiWorkInHand from '../Api/ApiWorkInHand';

export function * getWorkInHandSummary({payload}) {
  try {
    const response = yield call(ApiWorkInHand.getSummary, payload.dimDate);

    if (response.status === 200) {
      yield put(WorkInHandActions.workinhandSuccess({summaryData: response.data}));
    }
  } catch(e) {
    yield put(WorkInHandActions.workinhandFailure(e));
  }
}

export function * getWorkInHandDetail({payload}) {
  try {
    const response = yield call(ApiWorkInHand.getDetail, payload.dimDate);

    if (response.status === 200) {
      yield put(WorkInHandActions.workinhandSuccess({detailData: response.data}));
    }
  } catch(e) {
    yield put(WorkInHandActions.workinhandFailure(e));
  }
}
