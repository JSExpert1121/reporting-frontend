import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';

import YearSelector from "../../../Common/Selectors/YearSelector";
import PeriodSelector from "../../../Common/Selectors/PeriodSelector";

import { styles } from './style';
import { creators as WorkGeneratedActions } from '../../../Reducers/WorkGenerated';
import {
  financialMonth
} from "../../../Utils/Functions";

import {
  Grid,
} from "@material-ui/core";

import TopChart from "./TopChart";
import MiddleChart from "./MiddleChart";
import RightChart from "./RightChart";
import BottomChart from "./BottomChart";

class WorkGenerated extends Component {

  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = {
      mChartHeight: 200,
      bottomOffset : 0,
    };

    this.handleYear = this.handleYear.bind(this);
    this.handleFilter = this.handleFilter.bind(this);
    this.handleOffset = this.handleOffset.bind(this);
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
    this.props.getQuery([defaultYear]);
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
        this.props.getQuery([defaultYear]);
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

    this.props.getQuery(event.selectedYears);

    this.handleFilter(event);
  };

  handleFilter = (event) => {

    this.props.updateFilter(event);
  };

  handleOffset = (event) => {
    this.setState(event);
  };

  handlePos = (event) => {
    const {bottomOffset} = this.state;
    const _pos = event.currentTarget.getBoundingClientRect().top + window.scrollY;
    if( (bottomOffset !== _pos ) && this._isMounted === true)
    {
      this.setState({bottomOffset: _pos})
    }
  }

  render() {
    const { classes, dir , queryData, selectedMonths, period, selectedYears,
      label, selectedTopItems, selectedMiddleItems, filterName, selectedRightItems} = this.props;
    let {bottomOffset} = this.state;

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
          queryData={queryData}
          period={period}
          selectedYears={selectedYears}
          selectedMonths={selectedMonths}
          selectedTopItems={selectedTopItems}
          defaultStartMonth={this.props.defaultStartMonth}
          defaultMonth={this.props.defaultMonth}
          handleFilter={this.handleFilter}
        />

        <div>
          <div style={{textAlign: 'center'}}>
            <strong>Existing vs New</strong>
          </div>
          <div>
            <Grid container>
              <Grid item md={6} sm={6} xs={6}>
                
                <MiddleChart
                  queryData={queryData}
                  selectedYears={selectedYears}
                  selectedMonths={selectedMonths}
                  selectedTopItems={selectedTopItems}
                  selectedMiddleItems={selectedMiddleItems}
                  filterName={filterName}
                  handleOffset={this.handleOffset}
                  handleFilter={this.handleFilter}
                />
              </Grid>
              <Grid item md={6} sm={6} xs={6}>
                <RightChart
                  queryData={queryData}
                  selectedYears={selectedYears}
                  selectedMonths={selectedMonths}
                  selectedTopItems={selectedTopItems}
                  selectedRightItems={selectedRightItems}
                  filterName={filterName}
                  mChartHeight={this.state.mChartHeight}
                  handleFilter={this.handleFilter}
                />
              </Grid>
            </Grid>
          </div>
        </div>

        <div
          onMouseMove={event => this.handlePos(event)}
          onTouchMove={event => this.handlePos(event)}
        >

          <BottomChart
            queryData={queryData}
            selectedYears={selectedYears}
            selectedMonths={selectedMonths}
            selectedTopItems={selectedTopItems}
            selectedMiddleItems={selectedMiddleItems}
            selectedRightItems={selectedRightItems}
            bottomOffset={bottomOffset}
            filterName={filterName}
          />
        </div>

      </div>
    );
  }

}

WorkGenerated.propTypes = {
  classes: PropTypes.object.isRequired,
  dir: PropTypes.string.isRequired,

  queryData: PropTypes.object.isRequired,

  selectedYears: PropTypes.array.isRequired,
  label: PropTypes.string.isRequired,
  period: PropTypes.string.isRequired,
  filterName: PropTypes.string.isRequired,

  selectedMonths: PropTypes.array.isRequired,
  selectedTopItems: PropTypes.array.isRequired,
  selectedMiddleItems: PropTypes.array.isRequired,
  selectedRightItems:PropTypes.array.isRequired,
  defaultYear: PropTypes.number.isRequired,
  defaultMonth: PropTypes.number.isRequired,
  defaultStartMonth: PropTypes.number.isRequired,
  defaultDimDate: PropTypes.string.isRequired,
};

const mapStateToProps = state => {
  return {
    selectedYears: state.WorkGenerated.selectedYears,
    label: state.WorkGenerated.label,
    period: state.WorkGenerated.period,
    filterName: state.WorkGenerated.filterName,
    selectedMonths: state.WorkGenerated.selectedMonths,
    selectedTopItems: state.WorkGenerated.selectedTopItems,
    selectedMiddleItems: state.WorkGenerated.selectedMiddleItems,
    selectedRightItems: state.WorkGenerated.selectedRightItems,
    queryData: state.WorkGenerated.queryData,
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateFilter: (filter) => dispatch(WorkGeneratedActions.workgeneratedUpdateFilter(filter)),
    getQuery: (selectedYears) => dispatch(WorkGeneratedActions.workgeneratedQueryRequest(selectedYears)),
  }
};

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(WorkGenerated));
