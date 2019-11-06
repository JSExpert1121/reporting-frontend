import { createActions, handleActions, combineActions } from 'redux-actions';

const initState = {
  selectedYears: [2019],
  label: '2019',
  period: 'month',

  selectedTopItems: [],
  selectedLabels: [],
  dimDateKeys: [],

  summaryData: [],
  detailData: {},

  fetching: false,
  error: null,

};

export const creators = createActions({
    PRJFINANCIALPERF_UPDATE_FILTER: (filter) => (filter),
    PRJFINANCIALPERF_SUMMARY_REQUEST: (selectedYears) => ({selectedYears}),
    PRJFINANCIALPERF_DETAIL_REQUEST: (dimDateKeys) => ({dimDateKeys}),
    PRJFINANCIALPERF_SUCCESS: (payload) => (payload),
    PRJFINANCIALPERF_FAILURE: (payload) => (payload)
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
    PRJFINANCIALPERF_UPDATE_FILTER: updateFilterReducer,
    PRJFINANCIALPERF_SUMMARY_REQUEST: summaryReducer,
    PRJFINANCIALPERF_DETAIL_REQUEST: detailReducer,
    PRJFINANCIALPERF_SUCCESS: successReducer,
    PRJFINANCIALPERF_FAILURE: failureReducer
  },
  initState
);
