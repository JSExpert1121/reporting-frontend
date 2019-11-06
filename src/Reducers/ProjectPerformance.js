import { createActions, handleActions, combineActions } from 'redux-actions';

const initState = {
  selectedYears: ['2019'],
  label:'2019',
  profitType: "Director",
  profitSubType: "MTD",
  selectedTopItems: [],
  summaryData: [],
  detailData: [],
  topchartHeight: 300,
  fetching: false,
  error: null,

};

export const creators = createActions({
    PROJECTPERFORMANCE_UPDATE_FILTER: (filter) => (filter),
    PROJECTPERFORMANCE_SUMMARY_REQUEST: (selectedYear) => ({selectedYear}),
    PROJECTPERFORMANCE_DETAIL_REQUEST: (selectedYear) => ({selectedYear}),
    PROJECTPERFORMANCE_SUCCESS: (payload) => (payload),
    PROJECTPERFORMANCE_FAILURE: (payload) => (payload)
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
    PROJECTPERFORMANCE_UPDATE_FILTER: updateFilterReducer,
    PROJECTPERFORMANCE_SUMMARY_REQUEST: summaryReducer,
    PROJECTPERFORMANCE_DETAIL_REQUEST: detailReducer,
    PROJECTPERFORMANCE_SUCCESS: successReducer,
    PROJECTPERFORMANCE_FAILURE: failureReducer
  },
  initState
);
