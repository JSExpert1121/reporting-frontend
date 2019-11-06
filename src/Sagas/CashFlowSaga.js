import { call, put, select } from 'redux-saga/effects';

import { creators as CashFlowActions } from '../Reducers/CashFlow';
import ApiCashFlow from '../Api/ApiCashFlow';

export function * getTopData({payload}) {
  try {
    const response = yield call(ApiCashFlow.getTop, payload.selectedYears);

    if (response.status === 200) {
      yield put(CashFlowActions.cashflowSuccess({topData: response.data}));
    }
  } catch(e) {
    yield put(CashFlowActions.cashflowFailure(e));
  }
}

export function * getMiddleData({payload}) {
  try {
    const response = yield call(ApiCashFlow.getMiddle, payload.dimDate);

    if (response.status === 200) {
      yield put(CashFlowActions.cashflowSuccess({middleData: response.data}));
    }
  } catch(e) {
    yield put(CashFlowActions.cashflowFailure(e));
  }
}

export function * getBottomData({payload}) {
  try {
    const response = yield call(ApiCashFlow.getBottom, payload.selectedYears);

    if (response.status === 200) {
      yield put(CashFlowActions.cashflowSuccess({bottomData: response.data}));
    }
  } catch(e) {
    yield put(CashFlowActions.cashflowFailure(e));
  }
}
