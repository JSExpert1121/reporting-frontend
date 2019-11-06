import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import YearSelector from "../../../Common/Selectors/YearSelector";
import { withStyles } from '@material-ui/core/styles';
import TopChart from "./TopChart";
import BottomChart from "./BottomChart";
import { styles } from './style';
import {
  financialMonth,
  financialYear
} from "../../../Utils/Functions";
import { creators as YearlyFinancialYTDActions } from '../../../Reducers/YearlyFinancialYTD';

class YearlyFinancialPerformance extends Component {

  _isMounted = false;
  constructor(props) {
    super(props);

    this.state = {
      selectedLabels: [],
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
    const { defaultYear , defaultMonth , defaultStartMonth } = this.props;
    let _selectYears = [];
    let _selectTopItems = [];
    let _selectLabels = [];
    for(let i = defaultYear; i >= defaultYear - 4; i--)
    {
      if(i >= 2008)
      {
        _selectYears.push(i);
        _selectTopItems.push({year:i});
        _selectLabels.push(i);
      }
    }

    this.props.updateFilter({selectedYears:_selectYears,label:'Multi'/*defaultYear.toString()*/,
      selectedTopItems: _selectTopItems,
      selectedLabels:_selectLabels
    });
    let month = financialMonth(defaultMonth , defaultStartMonth);
    let year = financialYear(defaultYear, month, defaultStartMonth);

    this.props.getYearlyFinancialYTDSummary(_selectYears);
    this.props.getYearlyFinancialYTDDetail(_selectYears, year, month);

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

        const {defaultYear, defaultMonth, defaultStartMonth} = this.props;
        let _selectYears = [];
        let _selectTopItems = [];
        let _selectLabels = [];

        for(let i = defaultYear; i >= defaultYear - 4; i--)
        {

          if(i >= 2008)
          {
            _selectYears.push(i);
            _selectTopItems.push({year:i});
            _selectLabels.push(i);
          }
        }

        this.setState({});
        this.props.updateFilter({
          selectedYears: _selectYears,
          label: 'Multi'/*defaultYear.toString()*/,
          selectedTopItems: _selectTopItems,
          selectedLabels:_selectLabels
        });

        let month = financialMonth(defaultMonth , defaultStartMonth);
        let year = financialYear(defaultYear, month, defaultStartMonth);

        this.props.getYearlyFinancialYTDSummary(_selectYears);
        this.props.getYearlyFinancialYTDDetail(_selectYears, year, month);

      }
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  handleYear = (event) => {
    let _selectYears = [];
    let _selectTopItems = [];
    let _selectLabels = [];
    const {defaultYear, defaultMonth, defaultStartMonth} = this.props;
    let years = event.selectedYears;
    //years.sort((a,b)=>(-a + b));
    years.forEach(year=>{
      if(year != 'All')
      {
        _selectYears.push(year);
        _selectTopItems.push({year:year});
        _selectLabels.push(year);
      }
    })

    this.props.updateFilter({
      selectedYears: _selectYears,
      label: 'Multi'/*defaultYear.toString()*/,
      selectedTopItems: _selectTopItems,
      selectedLabels:_selectLabels
    });

    this.handleFilter(event);
    let month = financialMonth(defaultMonth , defaultStartMonth);
    let year = financialYear(defaultYear, month, defaultStartMonth);
    this.props.getYearlyFinancialYTDSummary(event.selectedYears);
    this.props.getYearlyFinancialYTDDetail(event.selectedYears, year, month);

  };

  handleFilter = (event) => {
    this.props.updateFilter(event);
  };

  render() {
    const { classes, dir
      , selectedYears , label , selectedTopItems,
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
          selectedTopItems={selectedTopItems}
          selectedLabels={this.props.selectedLabels}
          defaultStartMonth={this.props.defaultStartMonth}
          handleFilter={this.handleFilter}
        />
        <BottomChart
          detailData={detailData}
          selectedTopItems={selectedTopItems}
          selectedYears={selectedYears}

        />
      </div>
    );
  }

}

YearlyFinancialPerformance.propTypes = {
  classes: PropTypes.object.isRequired,
  dir: PropTypes.string.isRequired,
  selectedYears: PropTypes.array.isRequired,
  label: PropTypes.string.isRequired,
  summaryData: PropTypes.array.isRequired,
  detailData: PropTypes.object.isRequired,
  selectedTopItems: PropTypes.array.isRequired,
  selectedLabels: PropTypes.array.isRequired,
  defaultYear: PropTypes.number.isRequired,
  defaultMonth: PropTypes.number.isRequired,
  defaultStartMonth: PropTypes.number.isRequired,
  defaultDimDate: PropTypes.string.isRequired,
};

const mapStateToProps = state => {
  return {
    selectedYears: state.yearlyfinancialYTD.selectedYears,
    label: state.yearlyfinancialYTD.label,
    summaryData: state.yearlyfinancialYTD.summaryData,
    detailData: state.yearlyfinancialYTD.detailData,
    selectedTopItems: state.yearlyfinancialYTD.selectedTopItems,
    selectedLabels:state.yearlyfinancialYTD.selectedLabels,
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateFilter: (filter) => dispatch(YearlyFinancialYTDActions.yearlyytdUpdateFilter(filter)),
    getYearlyFinancialYTDSummary: (selectedYears) => dispatch(YearlyFinancialYTDActions.yearlyytdSummaryRequest(selectedYears)),
    getYearlyFinancialYTDDetail: (selectedYears, defaultYear , defaultMonth) => dispatch(YearlyFinancialYTDActions.yearlyytdDetailRequest(selectedYears, defaultYear, defaultMonth)),
  }
};


export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(YearlyFinancialPerformance));
