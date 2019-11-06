import { createActions, handleActions, combineActions } from 'redux-actions';

const initState = {
  dimDate: "",
  filterName: "Project Type",

  selectedTopItems: [],
  summaryData: [],
  detailData: [],

  fetching: false,
  error: null,

};

export const creators = createActions({
    WORKINHAND_UPDATE_FILTER: (filter) => (filter),
    WORKINHAND_SUMMARY_REQUEST: (dimDate) => ({dimDate}),
    WORKINHAND_DETAIL_REQUEST: (dimDate) => ({dimDate}),
    WORKINHAND_SUCCESS: (payload) => (payload),
    WORKINHAND_FAILURE: (payload) => (payload)
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
    WORKINHAND_UPDATE_FILTER: updateFilterReducer,
    WORKINHAND_SUMMARY_REQUEST: summaryReducer,
    WORKINHAND_DETAIL_REQUEST: detailReducer,
    WORKINHAND_SUCCESS: successReducer,
    WORKINHAND_FAILURE: failureReducer
  },
  initState
);
