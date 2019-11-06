import { createActions, handleActions, combineActions } from 'redux-actions';

const initState = {
  selectedYears: [2019],
  dimDate: ["20181201"],
  label: '2019',
  selectedTopItems: [],
  selectedMiddleItems: [],
  selectedBottomItems: [],
  topData: [],
  middleData: [],
  bottomData: [],
  fetching: false,
  error: null,

};

export const creators = createActions({
    PROJECTEDCASHFLOW_UPDATE_FILTER: (filter) => (filter),
    PROJECTEDCASHFLOW_TOP_REQUEST: (selectedYears, DateKey) => ({selectedYears, DateKey}),
    PROJECTEDCASHFLOW_MIDDLE_REQUEST: (selectedYears, DateKey) => ({selectedYears,DateKey}),
    PROJECTEDCASHFLOW_BOTTOM_REQUEST: (selectedYears) => ({selectedYears}),
    PROJECTEDCASHFLOW_SUCCESS: (payload) => (payload),
    PROJECTEDCASHFLOW_FAILURE: (payload) => (payload)
  }
);

const updateFilterReducer = (state, {payload}) => {
  const nextState = Object.assign({}, state, payload);
  return nextState;
};

const topReducer = (state) => {
  return {...state, fetching: true, error: null}
};

const middleReducer = (state) => {
  return {...state, fetching: true, error: null}
};

const bottomReducer = (state) => {
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
    PROJECTEDCASHFLOW_UPDATE_FILTER: updateFilterReducer,
    PROJECTEDCASHFLOW_TOP_REQUEST: topReducer,
    PROJECTEDCASHFLOW_MIDDLE_REQUEST: middleReducer,
    PROJECTEDCASHFLOW_BOTTOM_REQUEST: bottomReducer,
    PROJECTEDCASHFLOW_SUCCESS: successReducer,
    PROJECTEDCASHFLOW_FAILURE: failureReducer
  },
  initState
);
