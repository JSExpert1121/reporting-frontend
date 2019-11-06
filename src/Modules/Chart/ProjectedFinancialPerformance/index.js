import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';

import { styles } from './style';
import {connect} from "react-redux";
import {creators as ProjectedFinancialPerformanceActions} from "../../../Reducers/ProjectedFinancialPerformance";
import YearSelector from "../../../Common/Selectors/YearSelectorSingle";
import {financialMonth, makeDimDate} from "../../../Utils/Functions";
import TopChart from "./TopChart";
import BottomChart from "./BottomChart";


class ProjectedFinancialPerformance extends Component {

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
    this.props.getProjectedFinancialPerfSummary([defaultYear]);
    this.props.getProjectedFinancialPerfDetail([defaultDimDate]);
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
        this.props.getProjectedFinancialPerfSummary([defaultYear]);
        this.props.getProjectedFinancialPerfDetail([defaultDimDate]);

      }
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  handleYear = (event) => {
    let _defaultdimdate = makeDimDate(event.selectedYears[0] , this.props.defaultMonth , this.props.defaultStartMonth);
    this.props.getProjectedFinancialPerfSummary(event.selectedYears);
    this.props.getProjectedFinancialPerfDetail([_defaultdimdate]);
    this.props.updateFilter(event);
  };

  handleFilter = (event) => {
    this.props.updateFilter(event);
    if(event.selectedLabels){
      let _dimDateKeys = [] , _dimDateKey = 0;
      event.selectedLabels.forEach( (d) =>{
        _dimDateKey = makeDimDate(this.props.selectedYears[0] , d + 1 , 1);
        _dimDateKeys.push(_dimDateKey)
      })
      if(_dimDateKeys.length > 0)
        this.props.getProjectedFinancialPerfDetail(_dimDateKeys);
    }
  };

  render() {
    const { classes, dir
      , selectedYears , label , selectedLabels , selectedTopItems,
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
          selectedLabels={selectedLabels}
          selectedTopItems={selectedTopItems}
          defaultStartMonth={this.props.defaultStartMonth}
          defaultMonth={this.props.defaultMonth}
          defaultYear={this.props.defaultYear}
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

ProjectedFinancialPerformance.propTypes = {
  classes: PropTypes.object.isRequired,
  dir: PropTypes.string.isRequired,
  selectedYears: PropTypes.array.isRequired,
  selectedLabels: PropTypes.array.isRequired,
  label: PropTypes.string.isRequired,
  summaryData: PropTypes.array.isRequired,
  detailData: PropTypes.object.isRequired,

  selectedTopItems: PropTypes.array.isRequired,
  dimDateKeys: PropTypes.array.isRequired,
  defaultYear: PropTypes.number.isRequired,
  defaultMonth: PropTypes.number.isRequired,
  defaultStartMonth: PropTypes.number.isRequired,
  defaultDimDate: PropTypes.string.isRequired,
};

const mapStateToProps = state => {
  return {
    selectedYears: state.projectedfinancialPerformance.selectedYears,
    selectedLabels: state.projectedfinancialPerformance.selectedLabels,
    label: state.projectedfinancialPerformance.label,
    summaryData: state.projectedfinancialPerformance.summaryData,
    detailData: state.projectedfinancialPerformance.detailData,
    selectedTopItems: state.projectedfinancialPerformance.selectedTopItems,
    dimDateKeys: state.projectedfinancialPerformance.dimDateKeys,
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateFilter: (filter) => dispatch(ProjectedFinancialPerformanceActions.prjfinancialperfUpdateFilter(filter)),
    getProjectedFinancialPerfSummary: (selectedYears) => dispatch(ProjectedFinancialPerformanceActions.prjfinancialperfSummaryRequest(selectedYears)),
    getProjectedFinancialPerfDetail: (dimDateKeys) => dispatch(ProjectedFinancialPerformanceActions.prjfinancialperfDetailRequest(dimDateKeys)),
  }
};

ProjectedFinancialPerformance.propTypes = {
  classes: PropTypes.object.isRequired,
  dir: PropTypes.string.isRequired,
};

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(ProjectedFinancialPerformance));

