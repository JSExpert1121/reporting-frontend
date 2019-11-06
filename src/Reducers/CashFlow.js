import { createActions, handleActions, combineActions } from 'redux-actions';

const initState = {
  selectedYears: [2019],
  dimDate: ["20181201"],
  label: '2019',
  selectedTopItems: [],
  selectedBottomItems: [],
  topData: [],
  middleData: [],
  bottomData: [],
  fetching: false,
  error: null,

};

export const creators = createActions({
    CASHFLOW_UPDATE_FILTER: (filter) => (filter),
    CASHFLOW_TOP_REQUEST: (selectedYears) => ({selectedYears}),
    CASHFLOW_MIDDLE_REQUEST: (dimDate) => ({dimDate}),
    CASHFLOW_BOTTOM_REQUEST: (selectedYears) => ({selectedYears}),
    CASHFLOW_SUCCESS: (payload) => (payload),
    CASHFLOW_FAILURE: (payload) => (payload)
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
    CASHFLOW_UPDATE_FILTER: updateFilterReducer,
    CASHFLOW_TOP_REQUEST: topReducer,
    CASHFLOW_MIDDLE_REQUEST: middleReducer,
    CASHFLOW_BOTTOM_REQUEST: bottomReducer,
    CASHFLOW_SUCCESS: successReducer,
    CASHFLOW_FAILURE: failureReducer
  },
  initState
);
