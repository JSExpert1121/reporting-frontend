import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import YearSelector from "../../../Common/Selectors/YearSelector";
import { styles } from './style';
import { creators as ProjectedCashFlowActions } from '../../../Reducers/ProjectedCashFlow';

import TopChart from "./TopChart";
import MiddleChart from "./MiddleChart";
import BottomChart from "./BottomChart";

class ProjectedCashFlow extends Component {

  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = {
      resize: false,
      bottomOffset : 0,
    };
    this.handleYear = this.handleYear.bind(this);
  }

  componentDidMount() {

    this._isMounted = true;

    window.addEventListener('resize', this._onResize.bind(this));
    let { defaultYear , defaultDimDate } = this.props;

    this.props.updateFilter({selectedYears:[defaultYear], dimDate:[defaultDimDate],label:defaultYear.toString()});
    this.props.cashflowTopRequest([defaultYear], [defaultDimDate]);
    this.props.cashflowMiddleRequest([defaultYear], [defaultDimDate]);
    this.props.cashflowBottomRequest([defaultYear] );
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
          dimDate:[defaultDimDate]
          //selectedMonths: [financialMonth(defaultMonth, defaultStartMonth) - 1],
          //selectedTopItems: [{"year":defaultYear,"month":financialMonth(defaultMonth, defaultStartMonth) - 1}]
        });

        this.props.cashflowTopRequest([defaultYear],[defaultDimDate]);
        this.props.cashflowMiddleRequest([defaultYear],[defaultDimDate]);
        this.props.cashflowBottomRequest([defaultYear] /*selectedYears*/);

      }
    }
  }

  _onResize() {
    if(this._isMounted === true)
      this.setState({resize: !this.state.resize});

  }

  componentWillUnmount() {

    window.removeEventListener('resize', this._onResize.bind(this));
    this._isMounted = false;
  }


  handlePos = (event) => {
    const {bottomOffset} = this.state;
    const _pos = event.currentTarget.getBoundingClientRect().top + window.scrollY;
    if( (bottomOffset !== _pos ) && this._isMounted === true)
    {
      this.setState({bottomOffset: _pos})
    }
  }

  handleYear = (event) => {
    const {defaultYear, defaultMonth, defaultStartMonth, defaultDimDate} = this.props;
    this.props.updateFilter(event);
    this.props.updateFilter({selectedTopItems:[]});
    this.props.cashflowTopRequest(event.selectedYears , [defaultDimDate]);
    this.props.cashflowBottomRequest(event.selectedYears);
    const { dimDate } = this.props;
    this.props.cashflowMiddleRequest(event.selectedYears, [defaultDimDate]);

  };

  render() {
    const { classes, dir , selectedYears, dimDate, selectedTopItems, topData,
      middleData, bottomData, label,cashflowMiddleRequest,
      cashflowBottomRequest,selectedBottomItems, selectedMiddleItems} = this.props;

    let {bottomOffset} = this.state;

    return (
      <div dir={dir}>
        <div className="wrapper">
          <YearSelector
            selectedYears={selectedYears}
            label={label}
            onChange={this.handleYear}
          />
          <div className="right well"></div>
        </div>
        <TopChart
          topData={topData}
          selectedYears={selectedYears}
          selectedTopItems={selectedTopItems}
          selectedBottomItems={selectedBottomItems}
          cashflowMiddleRequest={cashflowMiddleRequest}
          cashflowBottomRequest={cashflowBottomRequest}
          dimDate={dimDate}
          defaultStartMonth={this.props.defaultStartMonth}
          defaultMonth={this.props.defaultMonth}
          defaultYear={this.props.defaultYear}
          updateFilter={this.props.updateFilter}
        />
        <MiddleChart
          middleData={middleData}
          updateFilter={this.props.updateFilter}
          selectedMiddleItems={selectedMiddleItems}
        />
        <div
          onMouseMove={event => this.handlePos(event)}
          onTouchMove={event => this.handlePos(event)}
        >
          <BottomChart
            bottomOffset={bottomOffset}
            bottomData={bottomData}
            selectedYears={selectedYears}
            selectedTopItems={selectedTopItems}
            selectedBottomItems={selectedBottomItems}
            selectedMiddleItems={selectedMiddleItems}
            updateFilter={this.props.updateFilter}
            cashflowMiddleRequest={cashflowMiddleRequest}
            defaultStartMonth={this.props.defaultStartMonth}
            defaultMonth={this.props.defaultMonth}
          />
        </div>

      </div>
    );
  }

}


ProjectedCashFlow.propTypes = {
  classes: PropTypes.object.isRequired,
  dir: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  selectedYears: PropTypes.array.isRequired,
  dimDate: PropTypes.array.isRequired,
  selectedTopItems: PropTypes.array.isRequired,
  topData:  PropTypes.array.isRequired,
  middleData:  PropTypes.array.isRequired,
  bottomData:  PropTypes.array.isRequired,
  selectedBottomItems:  PropTypes.array.isRequired,
  selectedMiddleItems:  PropTypes.array.isRequired,
  defaultYear: PropTypes.number.isRequired,
  defaultMonth: PropTypes.number.isRequired,
  defaultDimDate: PropTypes.string.isRequired,
};

const mapStateToProps = state => {
  return {
    selectedYears: state.ProjectedCashFlow.selectedYears,
    dimDate: state.ProjectedCashFlow.dimDate,
    selectedTopItems: state.ProjectedCashFlow.selectedTopItems,
    topData: state.ProjectedCashFlow.topData,
    middleData: state.ProjectedCashFlow.middleData,
    bottomData: state.ProjectedCashFlow.bottomData,
    selectedBottomItems: state.ProjectedCashFlow.selectedBottomItems,
    selectedMiddleItems: state.ProjectedCashFlow.selectedMiddleItems,
    label: state.ProjectedCashFlow.label,
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateFilter: (filter) => dispatch(ProjectedCashFlowActions.projectedcashflowUpdateFilter(filter)),
    cashflowTopRequest: (selectedYears, DateKey) => dispatch(ProjectedCashFlowActions.projectedcashflowTopRequest(selectedYears, DateKey)),
    cashflowMiddleRequest: (selectedYears, DateKey) => dispatch(ProjectedCashFlowActions.projectedcashflowMiddleRequest(selectedYears, DateKey)),
    cashflowBottomRequest: (selectedYears) => dispatch(ProjectedCashFlowActions.projectedcashflowBottomRequest(selectedYears)),
  }
};

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(ProjectedCashFlow));
