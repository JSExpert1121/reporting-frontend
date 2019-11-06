import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import { creators as WorkInHandActions } from '../../../Reducers/WorkInHand';
import { styles } from './style';
import { connect } from 'react-redux';

import TopChart from "./TopChart";
import BottomChart from "./BottomChart";

class WorkInHand extends Component {

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

    const { defaultDimDate } = this.props;
    this.props.updateFilter({dimDate:defaultDimDate});
    this.props.getWorkInHandSummary(defaultDimDate);
    this.props.getWorkInHandDetail(defaultDimDate);
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  handleFilter = (event) => {
    this.props.updateFilter(event);
  };


  render() {
    const { classes, dir
      ,summaryData, detailData, dimDate , filterName , selectedTopItems ,
    } = this.props;

    return (
      <div className={classes.root} dir={dir}>
       <TopChart
          summaryData={summaryData}
          filterName={filterName}
          selectedTopItems={selectedTopItems}
          detailData={detailData}
          handleFilter={this.handleFilter}
        />
        <BottomChart
          detailData={detailData}
          filterName={filterName}
          selectedTopItems={selectedTopItems}
          handleFilter={this.handleFilter}
        />
      </div>
    );
  }

}


WorkInHand.propTypes = {
  classes: PropTypes.object.isRequired,
  dir: PropTypes.string.isRequired,
  summaryData: PropTypes.array.isRequired,
  detailData: PropTypes.array.isRequired,
  dimDate: PropTypes.string.isRequired ,
  filterName: PropTypes.string.isRequired,
  selectedTopItems: PropTypes.array.isRequired,
  defaultYear: PropTypes.number.isRequired,
  defaultMonth: PropTypes.number.isRequired,
  defaultDimDate: PropTypes.string.isRequired,
};

const mapStateToProps = state => {
  return {
    dimDate: state.WorkInHand.dimDate,
    selectedTopItems: state.WorkInHand.selectedTopItems,
    filterName: state.WorkInHand.filterName,
    summaryData: state.WorkInHand.summaryData,
    detailData: state.WorkInHand.detailData,
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateFilter: (filter) => dispatch(WorkInHandActions.workinhandUpdateFilter(filter)),
    getWorkInHandSummary: (dimDate) => dispatch(WorkInHandActions.workinhandSummaryRequest(dimDate)),
    getWorkInHandDetail: (dimDate) => dispatch(WorkInHandActions.workinhandDetailRequest(dimDate)),
  }
};

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(WorkInHand));
