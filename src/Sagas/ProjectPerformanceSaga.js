import { call, put, select } from 'redux-saga/effects';

import { creators as ProjectPerformanceActions } from '../Reducers/ProjectPerformance';
import ApiProjectPerformance from '../Api/ApiProjectPerformance';

export function * getProjectPerformanceSummary({payload}) {
  try {
    const response = yield call(ApiProjectPerformance.getSummary, payload.selectedYear);

    if (response.status === 200) {
      yield put(ProjectPerformanceActions.projectperformanceSuccess({summaryData: response.data}));
    }
  } catch(e) {
    yield put(ProjectPerformanceActions.projectperformanceFailure(e));
  }
}

export function * getProjectPerformanceDetail({payload}) {
  try {
    const response = yield call(ApiProjectPerformance.getDetail, payload.selectedYear);

    if (response.status === 200) {
      yield put(ProjectPerformanceActions.projectperformanceSuccess({detailData: response.data}));
    }
  } catch(e) {
    yield put(ProjectPerformanceActions.projectperformanceFailure(e));
  }
}
