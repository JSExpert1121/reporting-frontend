import { call, put, select } from 'redux-saga/effects';

import { creators as FinancialYTDActions } from '../Reducers/FinancialYTD';
import ApiFinancialYTD from '../Api/ApiFinancialYTD';

export function * getFinancialYTDSummary({payload}) {
  try {
    const response = yield call(ApiFinancialYTD.getSummary, payload.selectedYears);

    if (response.status === 200) {
      yield put(FinancialYTDActions.fytdSuccess({summaryData: response.data}));
    }
  } catch(e) {
    yield put(FinancialYTDActions.fytdFailure(e));
  }
}

export function * getFinancialYTDDetail({payload}) {
  try {
    const response = yield call(ApiFinancialYTD.getDetail, payload.selectedYearMonth);

    if (response.status === 200) {
      yield put(FinancialYTDActions.fytdSuccess({detailData: response.data}));
    }
  } catch(e) {
    yield put(FinancialYTDActions.fytdFailure(e));
  }
}
