import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';

import { styles } from './style';
import YearSelector from "../../../Common/Selectors/YearSelector";
import PeriodSelector from "../../../Common/Selectors/PeriodSelector";
import TopChart from "./TopChart";
import ByChart from "./ByChart";
import TrendChart from "./TrendChart";
import BottomChart from "./BottomChart";
import { creators as ExpensesActions } from '../../../Reducers/Expenses';
import {
  financialMonth
} from "../../../Utils/Functions";

class Expenses extends Component {

  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = {
      resize: false
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
    const { defaultYear , defaultMonth , defaultStartMonth} = this.props;
    this.props.updateFilter({selectedYears:[defaultYear],label:defaultYear.toString(),
      selectedMonths:[financialMonth(defaultMonth, defaultStartMonth) - 1],
      selectedTopItems: [{"year":defaultYear,"month":financialMonth(defaultMonth, defaultStartMonth) - 1}]
    });
    this.props.getExpensesSummary([defaultYear]);
    this.props.getExpensesDetail([defaultYear]);
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
        this.props.updateFilter({
          selectedYears: [defaultYear],
          label: defaultYear.toString(),
          selectedMonths: [financialMonth(defaultMonth, defaultStartMonth) - 1],
          selectedTopItems: [{"year":defaultYear,"month":financialMonth(defaultMonth, defaultStartMonth) - 1}]
        });
        this.props.getExpensesSummary([defaultYear]);
        this.props.getExpensesDetail([defaultYear]);

      }
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
    window.removeEventListener('resize', this.onResize.bind(this));
  }

  handleYear = (event) => {

    this.props.updateFilter({
      selectedMonths:[],
      selectedTopItems: []
    });

    this.props.getExpensesSummary(event.selectedYears);
    this.props.getExpensesDetail(event.selectedYears);

    this.handleFilter(event);
  };

  handleFilter = (event) => {
    this.props.updateFilter(event);
    if(this.props.period !== event.period && event.period !== undefined)
      this.props.updateFilter({selectedTopItems:[],selectedMonths:[]});
  };

  render() {
    const { classes, dir,
    summaryData, detailData,
    selectedYears, label, period, selectedMonths, selectedTopItems, selectedMiddleItems} = this.props;

    return (
      <div className={classes.root} dir={dir} >
        <div className="wrapper">
          <PeriodSelector
            period={period}
            onChange={this.handleFilter}
          />
          <YearSelector
            selectedYears={selectedYears}
            label={label}
            onChange={this.handleYear}
          />
          <div className="right well"></div>
        </div>

        <TopChart
          summaryData={summaryData}
          period={period}
          selectedYears={selectedYears}
          selectedMonths={selectedMonths}
          selectedTopItems={selectedTopItems}
          defaultStartMonth={this.props.defaultStartMonth}
          defaultMonth={this.props.defaultMonth}
          handleFilter={this.handleFilter}
        />
        <ByChart
          summaryData={summaryData}
          period={period}
          selectedYears={selectedYears}
          selectedMonths={selectedMonths}
          selectedTopItems={selectedTopItems}
          selectedMiddleItems={selectedMiddleItems}
          defaultStartMonth={this.props.defaultStartMonth}
          handleFilter={this.handleFilter}
        />
        <TrendChart
          detailData={detailData}
          period={period}
          selectedYears={selectedYears}
          selectedMonths={selectedMonths}
          selectedTopItems={selectedTopItems}
          selectedMiddleItems={selectedMiddleItems}
          handleFilter={this.handleFilter}
          defaultStartMonth={this.props.defaultStartMonth}
          defaultMonth={this.props.defaultMonth}
        />
        <BottomChart
            detailData={detailData}
            period={period}
            selectedYears={selectedYears}
            selectedMonths={selectedMonths}
            selectedTopItems={selectedTopItems}
            selectedMiddleItems={selectedMiddleItems}
            handleFilter={this.handleFilter}
            defaultStartMonth={this.props.defaultStartMonth}
          />
      </div>
    );
  }

}


Expenses.propTypes = {
  classes: PropTypes.object.isRequired,
  dir: PropTypes.string.isRequired,

  summaryData: PropTypes.object.isRequired,
  detailData: PropTypes.array.isRequired,

  selectedYears: PropTypes.array.isRequired,
  label: PropTypes.string.isRequired,
  period: PropTypes.string.isRequired,

  selectedMonths: PropTypes.array.isRequired,
  selectedTopItems: PropTypes.array.isRequired,
  selectedMiddleItems: PropTypes.array.isRequired,

  defaultYear: PropTypes.number.isRequired,
  defaultMonth: PropTypes.number.isRequired,
  defaultStartMonth: PropTypes.number.isRequired,
  defaultDimDate: PropTypes.string.isRequired,
};

const mapStateToProps = state => {
  return {
    selectedYears: state.Expenses.selectedYears,
    label: state.Expenses.label,
    period: state.Expenses.period,
    selectedMonths: state.Expenses.selectedMonths,
    selectedTopItems: state.Expenses.selectedTopItems,
    selectedMiddleItems: state.Expenses.selectedMiddleItems,
    summaryData: state.Expenses.summaryData,
    detailData: state.Expenses.detailData,
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateFilter: (filter) => dispatch(ExpensesActions.expensesUpdateFilter(filter)),
    getExpensesSummary: (selectedYears) => dispatch(ExpensesActions.expensesSummaryRequest(selectedYears)),
    getExpensesDetail: (selectedYears) => dispatch(ExpensesActions.expensesDetailRequest(selectedYears)),
  }
};

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(Expenses));
