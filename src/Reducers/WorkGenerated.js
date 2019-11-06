import { createActions, handleActions, combineActions } from 'redux-actions';

const initState = {
  selectedYears: [2019],
  label: '2019',
  period: 'month',
  filterName: 'EmployeeName',
  selectedMonths: [],
  selectedTopItems: [],
  selectedMiddleItems: [],
  selectedRightItems: [],
  queryData: {},

  fetching: false,
  error: null,

};

export const creators = createActions({
    WORKGENERATED_UPDATE_FILTER: (filter) => (filter),
    WORKGENERATED_QUERY_REQUEST: (selectedYears) => ({selectedYears}),
    WORKGENERATED_SUCCESS: (payload) => (payload),
    WORKGENERATED_FAILURE: (payload) => (payload)
  }
);

const updateFilterReducer = (state, {payload}) => {
  const nextState = Object.assign({}, state, payload);
  return nextState;
};

const queryReducer = (state) => {
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
    WORKGENERATED_UPDATE_FILTER: updateFilterReducer,
    WORKGENERATED_QUERY_REQUEST: queryReducer,
    WORKGENERATED_SUCCESS: successReducer,
    WORKGENERATED_FAILURE: failureReducer
  },
  initState
);
