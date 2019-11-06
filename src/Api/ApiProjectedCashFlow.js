import BaseApi from './BaseApi';

// Must be function instead of Object as Generators don't work with complex structure...I guess.
const CashFlow = () => {
  const _api = BaseApi.api;

  const getTop= (selectedYears , DateKey) => {
    let queryParams = '';

    let _selectedYears = selectedYears.slice();
    const allIndex = _selectedYears.indexOf('All');
    if (allIndex > -1) _selectedYears.splice(allIndex, 1);
    let _selectedDimDate = DateKey.slice();
    const filter = {FYs: _selectedYears, DateKey: _selectedDimDate};

    queryParams += ('?filter=' + JSON.stringify(filter));

    return _api.get('v1.0/projectedcashflow/topdata' + queryParams);
  };

  const getMiddle= (selectedYears, DateKey) => {
    let queryParams = '';

    let _selectedYears = selectedYears.slice();
    const allIndex = _selectedYears.indexOf('All');
    if (allIndex > -1) _selectedYears.splice(allIndex, 1);

    let _selectedDimDate = DateKey.slice();
    const filter = {FYs: _selectedYears, DateKey: _selectedDimDate};

    queryParams += ('?filter=' + JSON.stringify(filter));

    return _api.get('v1.0/projectedcashflow/middledata' + queryParams);
  };

  const getBottom= (selectedYears) => {
    let queryParams = '';

    let _selectedYears = selectedYears.slice();
    const allIndex = _selectedYears.indexOf('All');
    if (allIndex > -1) _selectedYears.splice(allIndex, 1);
    const filter = {FYs: _selectedYears};

    queryParams += ('?filter=' + JSON.stringify(filter));

    return _api.get('v1.0/projectedcashflow/bottomdata' + queryParams);
  };
  return {
    getTop,
    getMiddle,
    getBottom,
  }
};

export default CashFlow();
