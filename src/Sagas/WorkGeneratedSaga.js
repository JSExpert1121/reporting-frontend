import { call, put, select } from 'redux-saga/effects';

import { creators as WorkGeneratedActions } from '../Reducers/WorkGenerated';
import ApiWorkGenerated from '../Api/ApiWorkGenerated';

export function * getWorkGeneratedQuery({payload}) {
  try {
    const response = yield call(ApiWorkGenerated.getQuery, payload.selectedYears);

    if (response.status === 200) {
      yield put(WorkGeneratedActions.workgeneratedSuccess({queryData: response.data}));
    }
  } catch(e) {
    yield put(WorkGeneratedActions.workgeneratedFailure(e));
  }
}
