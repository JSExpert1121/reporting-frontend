import BaseApi from './BaseApi';

// Must be function instead of Object as Generators don't work with complex structure...I guess.
const ApiDefault = () => {
  const _api = BaseApi.api;

  const getDefaultInfo = (OrgName) => {
    let queryParams = '';

    let filter = {OrgName: OrgName};

    queryParams += ('?filter=' + JSON.stringify(filter));
    return _api.get('v1.0/default/Info' + queryParams);
  };


  return {
    getDefaultInfo
  }
}


export default ApiDefault();
