import { call, put, select } from 'redux-saga/effects';

import { creators as ExpensesActions } from '../Reducers/Expenses';
import ApiExpenses from '../Api/ApiExpenses';

export function * getExpensesSummary({payload}) {
  try {
    const response = yield call(ApiExpenses.getSummary, payload.selectedYears);

    if (response.status === 200) {
      yield put(ExpensesActions.expensesSuccess({summaryData: response.data}));
    }
  } catch(e) {
    yield put(ExpensesActions.expensesFailure(e));
  }
}

export function * getExpensesDetail({payload}) {
  try {
    const response = yield call(ApiExpenses.getDetail, payload.selectedYears);

    if (response.status === 200) {
      yield put(ExpensesActions.expensesSuccess({detailData: response.data}));
    }
  } catch(e) {
    yield put(ExpensesActions.expensesFailure(e));
  }
}
