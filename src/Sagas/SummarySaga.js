import { call, put, select } from 'redux-saga/effects';

import { creators as SummaryActions } from '../Reducers/Summary';
import ApiSummary from '../Api/ApiSummary';

export function * getSummary({payload}) {
  try {
    const response = yield call(ApiSummary.getSummary, payload.dimdate);

    if (response.status === 200) {
      yield put(SummaryActions.summarySuccess({summary: response.data}));
    }
  } catch(e) {
    yield put(SummaryActions.summaryFailure(e));
  }
}

export function * setSummary({payload}) {
  try {
    const response = yield call(ApiSummary.setSummary, payload.dimdate , payload.content);

    if (response.status === 200) {
      yield put(SummaryActions.summarySuccess());
    }
  } catch(e) {
    yield put(SummaryActions.summaryFailure(e));
  }
}
