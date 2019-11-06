import { call, put, select } from 'redux-saga/effects';

import { creators as ProjectedFinancialPerformanceActions } from '../Reducers/ProjectedFinancialPerformance';
import ApiProjectedFinancialPerformance from '../Api/ApiProjectedFinancialPerformance';

export function * getProjectedFinancialPerformanceSummary({payload}) {
  try {
    const response = yield call(ApiProjectedFinancialPerformance.getSummary, payload.selectedYears);

    if (response.status === 200) {
      yield put(ProjectedFinancialPerformanceActions.prjfinancialperfSuccess({summaryData: response.data}));
    }
  } catch(e) {
    yield put(ProjectedFinancialPerformanceActions.prjfinancialperfFailure(e));
  }
}

export function * getProjectedFinancialPerformanceDetail({payload}) {
  try {
    const response = yield call(ApiProjectedFinancialPerformance.getDetail, payload.dimDateKeys);

    if (response.status === 200) {
      yield put(ProjectedFinancialPerformanceActions.prjfinancialperfSuccess({detailData: response.data}));
    }
  } catch(e) {
    yield put(ProjectedFinancialPerformanceActions.prjfinancialperfFailure(e));
  }
}
