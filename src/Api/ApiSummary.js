import BaseApi from './BaseApi';

// Must be function instead of Object as Generators don't work with complex structure...I guess.
const ApiSummary = () => {
  const _api = BaseApi.api;

  const getSummary= (dimdate) => {
    let queryParams = '';

    var queryjson = [];
    queryjson[0] = dimdate;
    let filter = {DimDateKey: queryjson};

    queryParams += ('?filter=' + JSON.stringify(filter));
    return _api.get('v1.0/summary/summary' + queryParams);
  };

  const setSummary= (dimdate , content) => {
    let queryParams = '';

    var queryjson = [];
    queryjson[0] = dimdate;
    let filter = {DimDateKey: queryjson};
    queryParams += ('?filter=' + JSON.stringify(filter));
    return _api.get('v1.0/summary/setsummary' + queryParams + "&content=" + content);
  };

  return {
    getSummary,
    setSummary
  }
}


export default ApiSummary();
