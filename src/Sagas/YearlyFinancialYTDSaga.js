import { call, put, select } from 'redux-saga/effects';

import { creators as YearlyFinancialYTDActions } from '../Reducers/YearlyFinancialYTD';
import ApiYearlyFinancialYTD from '../Api/ApiYearlyFinancialYTD';

export function * getYearlyFinancialYTDSummary({payload}) {
  try {
    const response = yield call(ApiYearlyFinancialYTD.getSummary, payload.selectedYears);

    if (response.status === 200) {
      yield put(YearlyFinancialYTDActions.yearlyytdSuccess({summaryData: response.data}));
    }
  } catch(e) {
    yield put(YearlyFinancialYTDActions.yearlyytdFailure(e));
  }
}

export function * getYearlyFinancialYTDDetail({payload}) {
  try {
    const response = yield call(ApiYearlyFinancialYTD.getDetail, payload.selectedYears , payload.defaultYear, payload.defaultMonth);

    if (response.status === 200) {
      yield put(YearlyFinancialYTDActions.yearlyytdSuccess({detailData: response.data}));
    }
  } catch(e) {
    yield put(YearlyFinancialYTDActions.yearlyytdFailure(e));
  }
}
