import { createActions, handleActions, combineActions } from 'redux-actions';

const initState = {
  selectedYears: [],
  selectedMonths:[],
  dimDate: "",

  summary: [],
  content:"",
  label:'',
  month_label:'1',
  fetching: false,
  error: null,

};

export const creators = createActions({
    SUMMARY_UPDATE_FILTER: (filter) => (filter),
    SUMMARY_GET_REQUEST: (dimdate) => ({dimdate}),
    SUMMARY_SET_REQUEST:(dimdate , content) => ({dimdate , content}),
    SUMMARY_SUCCESS: (payload) => (payload),
    SUMMARY_FAILURE: (payload) => (payload)
  }
);

const updateFilterReducer = (state, {payload}) => {
  const nextState = Object.assign({}, state, payload);
  return nextState;
};

const getReducer = (state) => {
  return {...state, fetching: true, error: null}
};

const setReducer = (state) => {
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
    SUMMARY_UPDATE_FILTER: updateFilterReducer,
    SUMMARY_GET_REQUEST: getReducer,
    SUMMARY_SET_REQUEST: setReducer,
    SUMMARY_SUCCESS: successReducer,
    SUMMARY_FAILURE: failureReducer
  },
  initState
);
