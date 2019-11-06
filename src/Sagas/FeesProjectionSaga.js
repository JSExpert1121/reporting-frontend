import { call, put, select } from 'redux-saga/effects';

import { creators as FeesProjectionActions } from '../Reducers/FeesProjection';
import ApiFeesProjection from '../Api/ApiFeesProjection';

export function * getFeesProjectionSummary({payload}) {
  try {
    const response = yield call(ApiFeesProjection.getSummary, payload.selectedYears);

    if (response.status === 200) {
      yield put(FeesProjectionActions.feesprojectionSuccess({summaryData: response.data}));
    }
  } catch(e) {
    yield put(FeesProjectionActions.feesprojectionFailure(e));
  }
}

export function * getFeesProjectionDetail({payload}) {
  try {
    const response = yield call(ApiFeesProjection.getDetail, payload.selectedYears);

    if (response.status === 200) {
      yield put(FeesProjectionActions.feesprojectionSuccess({detailData: response.data}));
    }
  } catch(e) {
    yield put(FeesProjectionActions.feesprojectionFailure(e));
  }
}
