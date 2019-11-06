import { call, put, select } from 'redux-saga/effects';

import { creators as OpportunityActions } from '../Reducers/Opportunity';
import ApiOpportunity from '../Api/ApiOpportunity';

export function * getOpportunitySummary({payload}) {
  try {
    const response = yield call(ApiOpportunity.getSummary, payload.selectedYears);

    if (response.status === 200) {
      yield put(OpportunityActions.opportunitySuccess({summaryData: response.data}));
    }
  } catch(e) {
    yield put(OpportunityActions.opportunityFailure(e));
  }
}

export function * getOpportunityDetail({payload}) {
  try {
    const response = yield call(ApiOpportunity.getDetail, payload.selectedYears);

    if (response.status === 200) {
      yield put(OpportunityActions.opportunitySuccess({detailData: response.data}));
    }
  } catch(e) {
    yield put(OpportunityActions.opportunityFailure(e));
  }
}
