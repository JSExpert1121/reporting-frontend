import { createActions, handleActions, combineActions } from 'redux-actions';

const initState = {
  selectedYears: [2019],
  label: '2019',
  period: 'month',

  selectedMonths: [],
  selectedTopItems: [],

  selectedMiddleItems: [],

  summaryData: {},
  detailData: [],

  fetching: false,
  error: null,

};

export const creators = createActions({
    EXPENSES_UPDATE_FILTER: (filter) => (filter),
    EXPENSES_SUMMARY_REQUEST: (selectedYears) => ({selectedYears}),
    EXPENSES_DETAIL_REQUEST: (selectedYears) => ({selectedYears}),
    EXPENSES_SUCCESS: (payload) => (payload),
    EXPENSES_FAILURE: (payload) => (payload)
  }
);

const updateFilterReducer = (state, {payload}) => {
  const nextState = Object.assign({}, state, payload);
  return nextState;
};

const summaryReducer = (state) => {
  return {...state, fetching: true, error: null}
};

const detailReducer = (state) => {
  return {...state, fetching: true, error: null}
};

const successReducer = (state, {payload}) => {
  const nextState = Object.assign({}, state, payload);
  nextState.fetching = false;
  return nextState;
};

const failureReducer = (state, {payload}) => {
  return {...state, fetching: false, error: payload};
};

export default handleActions (
  {
    EXPENSES_UPDATE_FILTER: updateFilterReducer,
    EXPENSES_SUMMARY_REQUEST: summaryReducer,
    EXPENSES_DETAIL_REQUEST: detailReducer,
    EXPENSES_SUCCESS: successReducer,
    EXPENSES_FAILURE: failureReducer
  },
  initState
);
