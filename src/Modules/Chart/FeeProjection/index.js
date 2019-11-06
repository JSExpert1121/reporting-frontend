import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';

import { creators as FeesProjectionActions } from '../../../Reducers/FeesProjection';

import YearSelector from "../../../Common/Selectors/YearSelector";
import PeriodSelector from "../../../Common/Selectors/PeriodSelector";
import TopChart from "./TopChart";
import MiddleChart from "./MiddleChart";
import BottomChart from "./BottomChart";
import { styles } from './style';
import {financialMonth} from "../../../Utils/Functions";


class FeeProjection extends Component {

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

    window.addEventListener('resize', this.onResize.bind(this));

    const { selectedYears , defaultYear , defaultMonth , defaultStartMonth} = this.props;
    this.props.updateFilter({
      selectedYears: [defaultYear],
      label: defaultYear.toString(),
      selectedMonths: [financialMonth(defaultMonth, defaultStartMonth) - 1],
      selectedTopItems: [{"year":defaultYear,"month":financialMonth(defaultMonth, defaultStartMonth) - 1}]
    });

    this.props.getFeesProjectionSummary([defaultYear]);
    this.props.getFeesProjectionDetail([defaultYear]);
    this._isMounted = true;
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
        this.props.getFeesProjectionSummary([defaultYear]);
        this.props.getFeesProjectionDetail([defaultYear]);

      }
    }
  }


  componentWillUnmount() {
    this._isMounted = false;
    window.removeEventListener('resize', this.onResize.bind(this));
  }

  handleYear = (event) => {
    this.props.getFeesProjectionSummary(event.selectedYears);
    this.props.getFeesProjectionDetail(event.selectedYears);
    this.handleFilter(event);
  };

  handleFilter = (event) => {
    this.props.updateFilter(event);
  };

  render() {
    const {
      classes, dir,
      summaryData, detailData,
      selectedYears, label, period, selectedMonths, selectedTopItems, selectedMiddleItems, filterName
    } = this.props;

    return (
      <div className={classes.root} dir={dir}>

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
          defaultYear={this.props.defaultYear}
          handleFilter={this.handleFilter}
        />

        <MiddleChart
          detailData={detailData}
          selectedYears={selectedYears}
          selectedMonths={selectedMonths}
          selectedTopItems={selectedTopItems}
          selectedMiddleItems={selectedMiddleItems}
          filterName={filterName}
          handleFilter={this.handleFilter}
        />

        <BottomChart
          detailData={detailData}
          selectedYears={selectedYears}
          selectedMonths={selectedMonths}
          selectedTopItems={selectedTopItems}
          selectedMiddleItems={selectedMiddleItems}
          filterName={filterName}
        />

      </div>
    );
  }

}


FeeProjection.propTypes = {
  classes: PropTypes.object.isRequired,
  dir: PropTypes.string.isRequired,

  summaryData: PropTypes.array.isRequired,
  detailData: PropTypes.array.isRequired,

  selectedYears: PropTypes.array.isRequired,
  label: PropTypes.string.isRequired,
  period: PropTypes.string.isRequired,

  selectedMonths: PropTypes.array.isRequired,
  selectedTopItems: PropTypes.array.isRequired,

  selectedMiddleItems: PropTypes.array.isRequired,
  filterName: PropTypes.string.isRequired,
  defaultYear: PropTypes.number.isRequired,
  defaultMonth: PropTypes.number.isRequired,
  defaultDimDate: PropTypes.string.isRequired,
  defaultStartMonth: PropTypes.number.isRequired,
};

const mapStateToProps = state => {
  return {
    selectedYears: state.feesprojection.selectedYears,
    label: state.feesprojection.label,
    period: state.feesprojection.period,

    selectedMonths: state.feesprojection.selectedMonths,
    selectedTopItems: state.feesprojection.selectedTopItems,

    selectedMiddleItems: state.feesprojection.selectedMiddleItems,
    filterName: state.feesprojection.filterName,

    summaryData: state.feesprojection.summaryData,
    detailData: state.feesprojection.detailData,

  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateFilter: (filter) => dispatch(FeesProjectionActions.feesprojectionUpdateFilter(filter)),
    getFeesProjectionSummary: (selectedYears) => dispatch(FeesProjectionActions.feesprojectionSummaryRequest(selectedYears)),
    getFeesProjectionDetail: (selectedYears) => dispatch(FeesProjectionActions.feesprojectionDetailRequest(selectedYears)),
  }
};

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(FeeProjection));
