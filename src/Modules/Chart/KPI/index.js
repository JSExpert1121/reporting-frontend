import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';

import { styles } from './style';
import { creators as KPIActions } from '../../../Reducers/KPI';

import TopChart from "./TopChart";
import BottomChart from "./BottomChart";
import {financialMonth} from "../../../Utils/Functions";

class KPI extends Component {

  _isMounted = false;
  constructor(props) {
    super(props);

    this.state = {
      resize: false
    };
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
    this.props.updateFilter({selectedYears:[defaultYear],selectedRightItems:[financialMonth(defaultMonth, defaultStartMonth) - 1]
    });
    this.props.getKpiSummary([defaultYear]);
  }

  componentDidUpdate(prevProps, prevState)
  {
    if(
      prevProps.defaultYear !== this.props.defaultYear ||
      prevProps.defaultMonth !== this.props.defaultMonth
     )
    {
      if(this._isMounted) {

        const {defaultYear, defaultMonth, defaultStartMonth} = this.props;
        this.props.updateFilter({
          selectedYears: [defaultYear],
          selectedRightItems:[financialMonth(defaultMonth, defaultStartMonth) - 1]
        });
        this.props.getKpiSummary([defaultYear]);

      }
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
    window.removeEventListener('resize', this.onResize.bind(this));
  }

  handleFilter = (event) => {
    this.props.updateFilter(event);
  };

  render() {
    const { classes, dir, selectedYears, choice, selectedTopItems,
      selectedLeftItems, selectedRightItems, summaryData, selectedTopLabels } = this.props;

    return (
      <div className={classes.root} dir={dir}>
        <TopChart
          summaryData={summaryData}
          choice={choice}
          selectedTopLabels={selectedTopLabels}
          selectedTopItems={selectedTopItems}
          selectedLeftItems={selectedLeftItems}
          selectedRightItems={selectedRightItems}
          defaultStartMonth={this.props.defaultStartMonth}
          defaultMonth={this.props.defaultMonth}
          selectedYears={selectedYears}
          updateFilter={this.handleFilter}
        />

      <BottomChart
          summaryData={summaryData}
          choice={choice}
          selectedTopItems={selectedTopItems}
          selectedLeftItems={selectedLeftItems}
          selectedRightItems={selectedRightItems}
          defaultStartMonth={this.props.defaultStartMonth}
          defaultMonth={this.props.defaultMonth}
          selectedYears={selectedYears}
          updateFilter={this.handleFilter}
        />


      </div>
    );
  }

}


KPI.propTypes = {
  classes: PropTypes.object.isRequired,
  dir: PropTypes.string.isRequired,

  summaryData: PropTypes.array.isRequired,
  selectedYears: PropTypes.array.isRequired,
  choice: PropTypes.string.isRequired,

  selectedTopLabels:PropTypes.array.isRequired,
  selectedTopItems: PropTypes.array.isRequired,
  selectedLeftItems: PropTypes.array.isRequired,
  selectedRightItems: PropTypes.array.isRequired,

  defaultYear: PropTypes.number.isRequired,
  defaultMonth: PropTypes.number.isRequired,
  defaultStartMonth: PropTypes.number.isRequired,
  defaultDimDate: PropTypes.string.isRequired,
};

const mapStateToProps = state => {
  return {
    selectedYears: state.KPI.selectedYears,
    choice: state.KPI.choice,
    selectedTopLabels: state.KPI.selectedTopLabels,
    selectedLeftItems: state.KPI.selectedLeftItems,
    selectedTopItems: state.KPI.selectedTopItems,
    selectedRightItems: state.KPI.selectedRightItems,
    summaryData: state.KPI.summaryData,
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateFilter: (filter) => dispatch(KPIActions.kpiUpdateFilter(filter)),
    getKpiSummary: (selectedYears) => dispatch(KPIActions.kpiSummaryRequest(selectedYears)),
  }
};

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(KPI));
