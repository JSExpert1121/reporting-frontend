import { call, put, select } from 'redux-saga/effects';

import { creators as ProjectedCashFlowActions } from '../Reducers/ProjectedCashFlow';
import ApiProjectedCashFlow from '../Api/ApiProjectedCashFlow';

export function * getPCFTopData({payload}) {
  try {
    const response = yield call(ApiProjectedCashFlow.getTop, payload.selectedYears, payload.DateKey);

    if (response.status === 200) {
      yield put(ProjectedCashFlowActions.projectedcashflowSuccess({topData: response.data}));
    }
  } catch(e) {
    yield put(ProjectedCashFlowActions.projectedcashflowFailure(e));
  }
}

export function * getPCFMiddleData({payload}) {
  try {
    const response = yield call(ApiProjectedCashFlow.getMiddle, payload.selectedYears, payload.DateKey);

    if (response.status === 200) {
      yield put(ProjectedCashFlowActions.projectedcashflowSuccess({middleData: response.data}));
    }
  } catch(e) {
    yield put(ProjectedCashFlowActions.projectedcashflowFailure(e));
  }
}

export function * getPCFBottomData({payload}) {
  try {
    const response = yield call(ApiProjectedCashFlow.getBottom, payload.selectedYears);

    if (response.status === 200) {
      yield put(ProjectedCashFlowActions.projectedcashflowSuccess({bottomData: response.data}));
    }
  } catch(e) {
    yield put(ProjectedCashFlowActions.projectedcashflowFailure(e));
  }
}
