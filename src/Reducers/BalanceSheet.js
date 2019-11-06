import { createActions, handleActions, combineActions } from 'redux-actions';

const initState = {

  dimDate: "",
  queryResult: {},
  fetching: false,
  error: null,

};

export const creators = createActions({
    GLBS_UPDATE_FILTER: (filter) => (filter),
    GLBS_QUERYS_REQUEST: (dimdate) => ({dimdate}),
    GLBS_SUCCESS: (payload) => (payload),
    GLBS_FAILURE: (payload) => (payload)
  }
);

const updateFilterReducer = (state, {payload}) => {
  const nextState = Object.assign({}, state, payload);
  return nextState;
};

const querysReducer = (state) => {
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
    GLBS_UPDATE_FILTER: updateFilterReducer,
    GLBS_QUERYS_REQUEST: querysReducer,
    GLBS_SUCCESS: successReducer,
    GLBS_FAILURE: failureReducer
  },
  initState
);
