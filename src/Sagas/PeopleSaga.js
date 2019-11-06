import { call, put, select } from 'redux-saga/effects';

import { creators as PeopleActions } from '../Reducers/People';
import ApiPeople from '../Api/ApiPeople';

export function * getPeopleSummary({payload}) {
  try {
    const response = yield call(ApiPeople.getSummary, payload.selectedYears);

    if (response.status === 200) {
      yield put(PeopleActions.peopleSuccess({summaryData: response.data}));
    }
  } catch(e) {
    yield put(PeopleActions.peopleFailure(e));
  }
}

export function * getPeopleDetail({payload}) {
  try {
    const response = yield call(ApiPeople.getDetail, payload.DimDate);

    if (response.status === 200) {
      yield put(PeopleActions.peopleSuccess({detailData: response.data}));
    }
  } catch(e) {
    yield put(PeopleActions.peopleFailure(e));
  }
}
