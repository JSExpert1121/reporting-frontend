import { createActions, handleActions, combineActions } from 'redux-actions';

const initState = {
  selectedYears: [2019],
  label: '2019',
  period: 'month',

  selectedMonths: [],
  selectedTopItems: [],

  selectedMiddleItems: [],
  filterName: 'Director',

  summaryData: [],
  detailData: [],

  fetching: false,
  error: null,

};

export const creators = createActions({
    FEESPROJECTION_UPDATE_FILTER: (filter) => (filter),
    FEESPROJECTION_SUMMARY_REQUEST: (selectedYears) => ({selectedYears}),
    FEESPROJECTION_DETAIL_REQUEST: (selectedYears) => ({selectedYears}),
    FEESPROJECTION_SUCCESS: (payload) => (payload),
    FEESPROJECTION_FAILURE: (payload) => (payload)
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
    FEESPROJECTION_UPDATE_FILTER: updateFilterReducer,
    FEESPROJECTION_SUMMARY_REQUEST: summaryReducer,
    FEESPROJECTION_DETAIL_REQUEST: detailReducer,
    FEESPROJECTION_SUCCESS: successReducer,
    FEESPROJECTION_FAILURE: failureReducer
  },
  initState
);
