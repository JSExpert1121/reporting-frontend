import BaseApi from './BaseApi';

// Must be function instead of Object as Generators don't work with complex structure...I guess.
const BalanceSheet = () => {
  const _api = BaseApi.api;

  const getQuerys= (dimdate) => {
    let queryParams = '';

    var queryjson = [];
    queryjson[0] = dimdate;
    let filter = {DimDateKey: queryjson};

    queryParams += ('?filter=' + JSON.stringify(filter));
    return _api.get('v1.0/balancesheet/querys' + queryParams);
  };

  return {
    getQuerys
  }
};

export default BalanceSheet();
