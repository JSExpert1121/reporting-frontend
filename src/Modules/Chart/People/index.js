import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';

import { styles } from './style';
import { creators as PeopleActions } from '../../../Reducers/People';

import YearSelector from "../../../Common/Selectors/YearSelector";
import TopChart from "./TopChart";
import BottomChart from "./BottomChart"
import {financialMonth, makeDimDate} from "../../../Utils/Functions";

class People extends Component {

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
        this.props.getPeopleSummary([defaultYear]);
        this.props.getPeopleDetail([defaultDimDate]);

      }
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this.onResize.bind(this));

    const { selectedYears , defaultYear , defaultMonth , defaultDimDate, defaultStartMonth} = this.props;
    this.props.updateFilter({
      selectedYears: [defaultYear],
      label: defaultYear.toString(),
      selectedMonths: [financialMonth(defaultMonth, defaultStartMonth) - 1],
      selectedTopItems: [{"year":defaultYear,"month":financialMonth(defaultMonth, defaultStartMonth) - 1}]
    });

    this.props.getPeopleSummary([defaultYear]);
    this.props.getPeopleDetail([defaultDimDate]);
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
    window.removeEventListener('resize', this.onResize.bind(this));
  }

  handleYear = (event) => {
    let _defaultdimdate = makeDimDate(event.selectedYears[0] , this.props.defaultMonth , this.props.defaultStartMonth);
    this.props.getPeopleSummary(event.selectedYears);
    this.props.getPeopleDetail([_defaultdimdate]);
    this.handleFilter(event);
  };

  handleFilter = (event) => {
    this.props.updateFilter(event);
  };

  render() {
    const { classes, dir, summaryData, detailData,
    selectedYears, label, selectedMonths, selectedTopItems, selectedMiddleItems} = this.props;
    console.log(selectedMonths);
    console.log(selectedTopItems);
    return (
      <div className={classes.root} dir={dir}>
        <div className="wrapper">
          <YearSelector
            selectedYears={selectedYears}
            label={label}
            onChange={this.handleYear}
          />
          <div className="right well"></div>
        </div>

        <TopChart
          summaryData={summaryData}
          selectedYears={selectedYears}
          selectedMonths={selectedMonths}
          selectedTopItems={selectedTopItems}
          defaultStartMonth={this.props.defaultStartMonth}
          defaultMonth={this.props.defaultMonth}
          defaultYear={this.props.defaultYear}
          handleFilter={this.handleFilter}
          getPeopleDetail={this.props.getPeopleDetail}
        />
        <BottomChart
            detailData={detailData}
            selectedTopItems={selectedTopItems}
            defaultStartMonth={this.props.defaultStartMonth}
            defaultMonth={this.props.defaultMonth}
            selectedYears={selectedYears}
            updateFilter={this.handleFilter}
          />
      </div>
    );
  }

}

People.propTypes = {
  classes: PropTypes.object.isRequired,
  dir: PropTypes.string.isRequired,

  summaryData: PropTypes.array.isRequired,
  detailData: PropTypes.object.isRequired,

  selectedYears: PropTypes.array.isRequired,
  label: PropTypes.string.isRequired,

  selectedMonths: PropTypes.array.isRequired,
  selectedTopItems: PropTypes.array.isRequired,

  selectedMiddleItems: PropTypes.array.isRequired,
  defaultYear: PropTypes.number.isRequired,
  defaultMonth: PropTypes.number.isRequired,
  defaultDimDate: PropTypes.string.isRequired,
  defaultStartMonth: PropTypes.number.isRequired,
};

const mapStateToProps = state => {
  return {
    selectedYears: state.People.selectedYears,
    label: state.People.label,

    selectedMonths: state.People.selectedMonths,
    selectedTopItems: state.People.selectedTopItems,

    selectedMiddleItems: state.People.selectedMiddleItems,

    summaryData: state.People.summaryData,
    detailData: state.People.detailData,

  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateFilter: (filter) => dispatch(PeopleActions.peopleUpdateFilter(filter)),
    getPeopleSummary: (selectedYears) => dispatch(PeopleActions.peopleSummaryRequest(selectedYears)),
    getPeopleDetail: (DimDate) => dispatch(PeopleActions.peopleDetailRequest(DimDate)),
  }
};

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(People));
