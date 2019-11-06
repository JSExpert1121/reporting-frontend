import { createActions, handleActions, combineActions } from 'redux-actions';

const initState = {
  selectedYears: [2019],
  label: '2019',
  selectedTopLeftItems: [],
  selectedTopLeftLabels: [],
  selectedTopRightItems: [],
  selectedBottomLeftItems: [],
  selectedBottomRightItems: [],
  Probability: 'All',
  summaryData: {},
  detailData: {},
  fetching: false,
  error: null,

};

export const creators = createActions({
    OPPORTUNITY_UPDATE_FILTER: (filter) => (filter),
    OPPORTUNITY_SUMMARY_REQUEST: (selectedYears) => ({selectedYears}),
    OPPORTUNITY_DETAIL_REQUEST: (selectedYears) => ({selectedYears}),
    OPPORTUNITY_SUCCESS: (payload) => (payload),
    OPPORTUNITY_FAILURE: (payload) => (payload)
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
    OPPORTUNITY_UPDATE_FILTER: updateFilterReducer,
    OPPORTUNITY_SUMMARY_REQUEST: summaryReducer,
    OPPORTUNITY_DETAIL_REQUEST: detailReducer,
    OPPORTUNITY_SUCCESS: successReducer,
    OPPORTUNITY_FAILURE: failureReducer
  },
  initState
);
