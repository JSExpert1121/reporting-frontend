import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import { creators as ProjectPerformanceActions } from '../../../Reducers/ProjectPerformance';
import { connect } from 'react-redux';

import { styles } from './style';
import TopChart from "./TopChart";
import BottomChart from "./BottomChart";
class ProjectPerformance extends Component {

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
    const { selectedYears , defaultYear , defaultMonth} = this.props;
    this.props.updateFilter({selectedYears:[defaultYear] , label:defaultYear.toString()});
    this.props.getProjectPerformanceSummary(defaultYear.toString() /*selectedYear*/);
    this.props.getProjectPerformanceDetail(defaultYear.toString()  /*selectedYear*/);
  }

  handleFilter = (event) => {
    this.props.updateFilter(event);
  };

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    const { classes, dir , summaryData , detailData , profitType , profitSubType , selectedYears , label, selectedTopItems } = this.props;

    return (
      <div className={classes.root} dir={dir}>
        <TopChart
           summaryData={summaryData}
           selectedYears={selectedYears}
           label={label}
           profitType={profitType}
           profitSubType={profitSubType}
           selectedTopItems={selectedTopItems}
           handleFilter={this.handleFilter}
           getProjectPerformanceSummary={this.props.getProjectPerformanceSummary}
           getProjectPerformanceDetail={this.props.getProjectPerformanceDetail}
           topchartHeight={this.props.topchartHeight}
         />
       <BottomChart
            detailData={detailData}
            selectedYears ={selectedYears}
            profitType={profitType}
            profitSubType={profitSubType}
            selectedTopItems={selectedTopItems}
            handleFilter={this.handleFilter}
            getProjectPerformanceDetail={this.props.getProjectPerformanceDetail}
            topchartHeight={this.props.topchartHeight}
          />
      </div>
    );
  }

}


ProjectPerformance.propTypes = {
  classes: PropTypes.object.isRequired,
  dir: PropTypes.string.isRequired,
  summaryData: PropTypes.array.isRequired,
  detailData: PropTypes.array.isRequired,
  selectedYears: PropTypes.array.isRequired,
  label: PropTypes.string.isRequired,
  profitType: PropTypes.string.isRequired,
  profitSubType: PropTypes.string.isRequired,
  selectedTopItems: PropTypes.array.isRequired,
  topchartHeight: PropTypes.number.isRequired,
  defaultYear: PropTypes.number.isRequired,
  defaultMonth: PropTypes.number.isRequired,
  defaultDimDate: PropTypes.string.isRequired,
};

const mapStateToProps = state => {
  return {
    selectedYears: state.ProjectPerformance.selectedYears,
    label: state.ProjectPerformance.label,
    selectedTopItems: state.ProjectPerformance.selectedTopItems,
    profitType: state.ProjectPerformance.profitType,
    profitSubType: state.ProjectPerformance.profitSubType,
    summaryData: state.ProjectPerformance.summaryData,
    detailData: state.ProjectPerformance.detailData,
    topchartHeight: state.ProjectPerformance.topchartHeight,
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateFilter: (filter) => dispatch(ProjectPerformanceActions.projectperformanceUpdateFilter(filter)),
    getProjectPerformanceSummary: (selectedYear) => dispatch(ProjectPerformanceActions.projectperformanceSummaryRequest(selectedYear)),
    getProjectPerformanceDetail: (selectedYear) => dispatch(ProjectPerformanceActions.projectperformanceDetailRequest(selectedYear)),
  }
};

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(ProjectPerformance));
