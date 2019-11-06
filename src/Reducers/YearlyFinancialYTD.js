import { createActions, handleActions, combineActions } from 'redux-actions';

const initState = {
  selectedYears: [2019],
  label: '2019',
  period: 'month',

  selectedTopItems: [],
  selectedLabels: [],

  summaryData: [],
  detailData: {},

  fetching: false,
  error: null,

};

export const creators = createActions({
    YEARLYYTD_UPDATE_FILTER: (filter) => (filter),
    YEARLYYTD_SUMMARY_REQUEST: (selectedYears) => ({selectedYears}),
    YEARLYYTD_DETAIL_REQUEST: (selectedYears, defaultYear, defaultMonth) => ({selectedYears, defaultYear, defaultMonth}),
    YEARLYYTD_SUCCESS: (payload) => (payload),
    YEARLYYTD_FAILURE: (payload) => (payload)
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
    YEARLYYTD_UPDATE_FILTER: updateFilterReducer,
    YEARLYYTD_SUMMARY_REQUEST: summaryReducer,
    YEARLYYTD_DETAIL_REQUEST: detailReducer,
    YEARLYYTD_SUCCESS: successReducer,
    YEARLYYTD_FAILURE: failureReducer
  },
  initState
);
