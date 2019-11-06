import { createActions, handleActions, combineActions } from 'redux-actions';

const initState = {
  selectedYears: [2019],
  selectedTopItems: [],
  selectedTopLabels: [],
  selectedRightLabels: [],
  selectedLeftItems: [],
  selectedRightItems: [],
  choice:'Group',
  summaryData: [],

  fetching: false,
  error: null,

};

export const creators = createActions({
    KPI_UPDATE_FILTER: (filter) => (filter),
    KPI_SUMMARY_REQUEST: (selectedYears) => ({selectedYears}),
    KPI_SUCCESS: (payload) => (payload),
    KPI_FAILURE: (payload) => (payload)
  }
);

const updateFilterReducer = (state, {payload}) => {
  const nextState = Object.assign({}, state, payload);
  return nextState;
};

const summaryReducer = (state) => {
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
    KPI_UPDATE_FILTER: updateFilterReducer,
    KPI_SUMMARY_REQUEST: summaryReducer,
    KPI_SUCCESS: successReducer,
    KPI_FAILURE: failureReducer
  },
  initState
);
