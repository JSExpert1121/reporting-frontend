import BaseApi from './BaseApi';

// Must be function instead of Object as Generators don't work with complex structure...I guess.
const ApiWorkInHand = () => {
  const _api = BaseApi.api;

  const getSummary = (dimDate) => {
    let queryParams = '';

    var queryjson = [];
    queryjson[0] = dimDate;
    let filter = {DimDateKey: queryjson};

    queryParams += ('?filter=' + JSON.stringify(filter));
    return _api.get('v1.0/workinhand/summary' + queryParams);
  };

  const getDetail = (dimDate) => {
    let queryParams = '';

    var queryjson = [];
    queryjson[0] = dimDate;
    let filter = {DimDateKey: queryjson};

    queryParams += ('?filter=' + JSON.stringify(filter));
    return _api.get('v1.0/workinhand/detail' + queryParams);
  };

  return {
    getSummary,
    getDetail,
  }
};

export default ApiWorkInHand();
