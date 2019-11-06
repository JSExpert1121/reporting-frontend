import { createActions, handleActions } from 'redux-actions';

const initState = {
  defaultInfo: {'FiscalYearStartMonth':7,'SafetyBankBalance':500000},
  OrgName: "Unreal.Com",
  fetching: false,
  error: null,

};

export const creators = createActions({
    DEFAULT_UPDATE_FILTER: (filter) => (filter),
    DEFAULT_GET_REQUEST: (OrgName) => ({OrgName}),
    DEFAULT_SUCCESS: (payload) => (payload),
    DEFAULT_FAILURE: (payload) => (payload)
  }
);

const updateFilterReducer = (state, {payload}) => {
  const nextState = Object.assign({}, state, payload);
  return nextState;
};

const getReducer = (state) => {
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
    DEFAULT_UPDATE_FILTER: updateFilterReducer,
    DEFAULT_GET_REQUEST: getReducer,
    DEFAULT_SUCCESS: successReducer,
    DEFAULT_FAILURE: failureReducer,
  },
  initState
);
