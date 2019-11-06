import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import YearSelector from "../../../Common/Selectors/YearSelectorSingle";
import { withStyles } from '@material-ui/core/styles';
import TopChart from "./TopChart";
import BottomChart from "./BottomChart";
import { styles } from './style';

import { creators as FinancialYTDActions } from '../../../Reducers/FinancialYTD';
import {financialMonth , makeDimDate} from "../../../Utils/Functions";

class FinancialPerformanceYTD extends Component {

  _isMounted = false;
  constructor(props) {
    super(props);

    this.state = {

    };

    this.handleYear = this.handleYear.bind(this);
    this.handleFilter = this.handleFilter.bind(this);
  }

  onResize() {
    if(this._isMounted === true)
      this.setState({resize: !this.state.resize});
  }

  componentDidMount() {

    this._isMounted = true;
    window.addEventListener('resize', this.onResize.bind(this));
    const { defaultYear , defaultMonth , defaultStartMonth , defaultDimDate} = this.props;
    this.props.updateFilter({selectedYears:[defaultYear],label:defaultYear.toString(),
      selectedMonths:[financialMonth(defaultMonth, defaultStartMonth) - 1],
      selectedTopItems: [{"year":defaultYear,"month":financialMonth(defaultMonth, defaultStartMonth) - 1}]
    });
    this.props.getFinancialYTDSummary([defaultYear]);
    this.props.getFinancialYTDDetail(defaultDimDate);

  }

  componentDidUpdate(prevProps, prevState)
  {
    if(/*prevState.summaryData !== this.props.summaryData ||
      prevState.detailData !== this.props.detailData ||*/
      prevProps.defaultYear !== this.props.defaultYear ||
      prevProps.defaultMonth !== this.props.defaultMonth
    )
    {
      if(this._isMounted) {

        const {defaultYear, defaultMonth, defaultStartMonth, defaultDimDate} = this.props;
        this.props.updateFilter({
          selectedYears: [defaultYear],
          label: defaultYear.toString(),
          selectedMonths: [financialMonth(defaultMonth, defaultStartMonth) - 1],
          selectedTopItems: [{"year":defaultYear,"month":financialMonth(defaultMonth, defaultStartMonth) - 1}]
        });
        this.props.getFinancialYTDSummary([defaultYear]);
        this.props.getFinancialYTDDetail(defaultDimDate);

      }
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  handleYear = (event) => {
    let _defaultdimdate;

    let printf = require('printf');
    if(this.props.defaultMonth <= this.props.defaultStartMonth)
      _defaultdimdate = printf("%04d%02d01" , event.selectedYears[0]-1 , financialMonth(this.props.defaultMonth , this.props.defaultStartMonth));
    else
      _defaultdimdate = printf("%04d%02d01" , event.selectedYears[0] , financialMonth(this.props.defaultMonth , this.props.defaultStartMonth));

    this.props.getFinancialYTDSummary(event.selectedYears);
    this.props.getFinancialYTDDetail(_defaultdimdate);
    this.props.updateFilter(event);
  };

  handleFilter = (event) => {
    this.props.updateFilter(event);
    if(event.selectedYearMonth){
      this.props.getFinancialYTDDetail(event.selectedYearMonth);
    }
  };

  render() {
    const { classes, dir
      , selectedYears , label , selectedMonths , selectedTopItems,
      summaryData, detailData
    }  = this.props;

    return (
      <div className={classes.root} dir={dir}>
        <div className="wrapper">
           <YearSelector
              selectedYears={selectedYears}
              label={label}
              onChange={this.handleYear}
            />
        </div>
        <TopChart
          summaryData={summaryData}
          selectedYears={selectedYears}
          selectedMonths={selectedMonths}
          selectedTopItems={selectedTopItems}
          defaultStartMonth={this.props.defaultStartMonth}
          defaultMonth={this.props.defaultMonth}
          handleFilter={this.handleFilter}
        />
        <BottomChart
          detailData={detailData}
          selectedMonths={selectedMonths}
          selectedYears={selectedYears}

        />
      </div>
    );
  }

}

FinancialPerformanceYTD.propTypes = {
  classes: PropTypes.object.isRequired,
  dir: PropTypes.string.isRequired,
  selectedYears: PropTypes.array.isRequired,
  label: PropTypes.string.isRequired,
  summaryData: PropTypes.array.isRequired,
  detailData: PropTypes.object.isRequired,
  selectedMonths: PropTypes.array.isRequired,
  selectedTopItems: PropTypes.array.isRequired,
  selectedYearMonth: PropTypes.string.isRequired,
  defaultYear: PropTypes.number.isRequired,
  defaultMonth: PropTypes.number.isRequired,
  defaultStartMonth: PropTypes.number.isRequired,
  defaultDimDate: PropTypes.string.isRequired,
};

const mapStateToProps = state => {
  return {
    selectedYears: state.financialYTD.selectedYears,
    selectedMonths: state.financialYTD.selectedMonths,
    label: state.financialYTD.label,
    summaryData: state.financialYTD.summaryData,
    detailData: state.financialYTD.detailData,
    selectedTopItems: state.financialYTD.selectedTopItems,
    selectedYearMonth: state.financialYTD.selectedYearMonth,
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateFilter: (filter) => dispatch(FinancialYTDActions.fytdUpdateFilter(filter)),
    getFinancialYTDSummary: (selectedYears) => dispatch(FinancialYTDActions.fytdSummaryRequest(selectedYears)),
    getFinancialYTDDetail: (selectedYearMonth) => dispatch(FinancialYTDActions.fytdDetailRequest(selectedYearMonth)),
  }
};


export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(FinancialPerformanceYTD));
