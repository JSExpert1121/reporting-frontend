import BaseApi from './BaseApi';

// Must be function instead of Object as Generators don't work with complex structure...I guess.
const ApiProjectPerformance = () => {
  const _api = BaseApi.api;

  const getSummary = (selectedYear) => {
    let queryParams = '';

    var queryjson = [];
    queryjson[0] = selectedYear;
    let filter = {FYs: queryjson};

    queryParams += ('?filter=' + JSON.stringify(filter));
    return _api.get('v1.0/projectperformance/summary' + queryParams);
  };

  const getDetail = (selectedYear) => {
    let queryParams = '';

    var queryjson = [];
    queryjson[0] = selectedYear;
    let filter = {FYs: queryjson};

    queryParams += ('?filter=' + JSON.stringify(filter));
    return _api.get('v1.0/projectperformance/detail' + queryParams);
  };

  return {
    getSummary,
    getDetail,
  }
};

export default ApiProjectPerformance();
