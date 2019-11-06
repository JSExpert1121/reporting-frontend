import { createActions, handleActions, combineActions } from 'redux-actions';

const initState = {
  selectedYears: [2019],
  label: '2019',

  selectedMonths: [],
  selectedTopItems: [],

  selectedMiddleItems: [],

  summaryData: [],
  detailData: {},

  fetching: false,
  error: null,

};

export const creators = createActions({
    PEOPLE_UPDATE_FILTER: (filter) => (filter),
    PEOPLE_SUMMARY_REQUEST: (selectedYears) => ({selectedYears}),
    PEOPLE_DETAIL_REQUEST: (DimDate) => ({DimDate}),
    PEOPLE_SUCCESS: (payload) => (payload),
    PEOPLE_FAILURE: (payload) => (payload)
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
    PEOPLE_UPDATE_FILTER: updateFilterReducer,
    PEOPLE_SUMMARY_REQUEST: summaryReducer,
    PEOPLE_DETAIL_REQUEST: detailReducer,
    PEOPLE_SUCCESS: successReducer,
    PEOPLE_FAILURE: failureReducer
  },
  initState
);
