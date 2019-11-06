import { createActions, handleActions, combineActions } from 'redux-actions';

const initState = {
  selectedYears: [2019],
  label: '2019',
  period: 'month',

  selectedMonths: [],
  selectedTopItems: [],
  selectedYearMonth: "20190101",
  selectedMiddleItems: [],

  summaryData: [],
  detailData: {},

  fetching: false,
  error: null,

};

export const creators = createActions({
    FYTD_UPDATE_FILTER: (filter) => (filter),
    FYTD_SUMMARY_REQUEST: (selectedYears) => ({selectedYears}),
    FYTD_DETAIL_REQUEST: (selectedYearMonth) => ({selectedYearMonth}),
    FYTD_SUCCESS: (payload) => (payload),
    FYTD_FAILURE: (payload) => (payload)
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
    FYTD_UPDATE_FILTER: updateFilterReducer,
    FYTD_SUMMARY_REQUEST: summaryReducer,
    FYTD_DETAIL_REQUEST: detailReducer,
    FYTD_SUCCESS: successReducer,
    FYTD_FAILURE: failureReducer
  },
  initState
);
