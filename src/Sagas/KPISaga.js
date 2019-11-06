import { call, put, select } from 'redux-saga/effects';

import { creators as KPIActions } from '../Reducers/KPI';
import ApiKPI from '../Api/ApiKPI';

export function * getKPISummary({payload}) {
  try {
    const response = yield call(ApiKPI.getSummary, payload.selectedYears);

    if (response.status === 200) {
      yield put(KPIActions.kpiSuccess({summaryData: response.data}));
    }
  } catch(e) {
    yield put(KPIActions.kpiFailure(e));
  }
}
