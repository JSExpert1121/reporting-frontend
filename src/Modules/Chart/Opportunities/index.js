import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import YearSelector from "../../../Common/Selectors/YearSelector";
import { styles } from './style';
import { creators as OpportunityActions } from '../../../Reducers/Opportunity';
import {
  financialMonth
} from "../../../Utils/Functions";
import {
  Grid,
} from "@material-ui/core";

import TopChart from "./TopChart";
import TopRightChart from "./TopRightChart";
import BottomChart from "./BottomChart";
import BottomRightChart from "./BottomRightChart";

class Opportunities extends Component {

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
    const { defaultYear , defaultMonth , defaultStartMonth} = this.props;
    this.props.updateFilter({selectedYears:[defaultYear],label:defaultYear.toString(),
      selectedTopLeftLabels:[financialMonth(defaultMonth, defaultStartMonth) - 1],
      selectedTopLeftItems: [{"month":financialMonth(defaultMonth, defaultStartMonth) - 1}]
    });
    this.props.getSummary([defaultYear]);
    this.props.getDetail([defaultYear]);
  }

  componentDidUpdate(prevProps, prevState)
  {
    if(prevProps.defaultYear !== this.props.defaultYear ||
      prevProps.defaultMonth !== this.props.defaultMonth
     )
    {
      if(this._isMounted) {

        const {defaultYear, defaultMonth, defaultStartMonth} = this.props;
        this.props.updateFilter({
          selectedYears: [defaultYear],
          label: defaultYear.toString(),
          selectedTopLeftLabels: [financialMonth(defaultMonth, defaultStartMonth) - 1],
          selectedTopLeftItems: [{"month":financialMonth(defaultMonth, defaultStartMonth) - 1}]
        });
        this.props.getSummary([defaultYear]);
        this.props.getDetail([defaultYear]);
      }
    }
  }

  handleYear = (event) => {

    this.props.getSummary(event.selectedYears);
    this.props.getDetail(event.selectedYears);
    this.handleFilter(event);
  };

  componentWillUnmount() {
    this._isMounted = false;
    window.removeEventListener('resize', this.onResize.bind(this));
  }


  handleFilter = (event) => {

    this.props.updateFilter(event);
  };

  render() {
    const { classes, dir , selectedTopLeftItems, selectedTopLeftLabels, selectedTopRightItems, selectedBottomLeftItems, selectedBottomRightItems,
    label, selectedYears, summaryData, detailData, Probability} = this.props;

    return (
      <div className={classes.root} dir={dir}>
        <div>
          <YearSelector
            selectedYears={selectedYears}
            label={label}
            onChange={this.handleYear}
          />
        </div>

        <div className="wrapper">
          <div className="right">
            <Grid container>
              <Grid item md={7} sm={7} xs={7}>
                <TopChart
                  summaryData={summaryData}
                  selectedYears={selectedYears}
                  selectedTopLeftItems={selectedTopLeftItems}
                  selectedTopLeftLabels={selectedTopLeftLabels}
                  defaultStartMonth={this.props.defaultStartMonth}
                  defaultMonth={this.props.defaultMonth}
                  handleFilter={this.handleFilter}
                />
              </Grid>
              <Grid item md={5} sm={5} xs={5}>
                <TopRightChart
                  summaryData={summaryData}
                  selectedYears={selectedYears}
                  selectedTopRightItems={selectedTopRightItems}
                  selectedTopLeftItems={selectedTopLeftItems}
                  defaultStartMonth={this.props.defaultStartMonth}
                  defaultMonth={this.props.defaultMonth}
                  handleFilter={this.handleFilter}
                />
              </Grid>
            </Grid>
            <Grid container>
              <Grid item md={7} sm={7} xs={7}>
                <BottomChart
                  detailData={detailData}
                  selectedYears={selectedYears}
                  selectedTopLeftItems={selectedTopLeftItems}
                  defaultStartMonth={this.props.defaultStartMonth}
                  defaultMonth={this.props.defaultMonth}
                  handleFilter={this.handleFilter}
                  />
              </Grid>
              <Grid item md={5} sm={5} xs={5}>
                <BottomRightChart
                  detailData={detailData}
                  selectedYears={selectedYears}
                  selectedTopRightItems={selectedTopRightItems}
                  selectedTopLeftItems={selectedTopLeftItems}
                  defaultStartMonth={this.props.defaultStartMonth}
                  defaultMonth={this.props.defaultMonth}
                  handleFilter={this.handleFilter}
                  Probability={Probability}
                />
              </Grid>
            </Grid>
          </div>
        </div>
      </div>
    );
  }

}


Opportunities.propTypes = {
  classes: PropTypes.object.isRequired,
  dir: PropTypes.string.isRequired,

  summaryData: PropTypes.object.isRequired,
  detailData: PropTypes.object.isRequired,

  selectedYears: PropTypes.array.isRequired,
  label: PropTypes.string.isRequired,

  selectedTopLeftLabels: PropTypes.array.isRequired,
  selectedTopLeftItems: PropTypes.array.isRequired,
  selectedTopRightItems: PropTypes.array.isRequired,
  selectedBottomLeftItems:PropTypes.array.isRequired,
  selectedBottomRightItems:PropTypes.array.isRequired,
  Probability:PropTypes.string.isRequired,
  defaultYear: PropTypes.number.isRequired,
  defaultMonth: PropTypes.number.isRequired,
  defaultStartMonth: PropTypes.number.isRequired,
  defaultDimDate: PropTypes.string.isRequired,
};

const mapStateToProps = state => {
  return {
    selectedYears: state.Opportunity.selectedYears,
    label: state.Opportunity.label,
    selectedTopLeftLabels: state.Opportunity.selectedTopLeftLabels,
    selectedTopLeftItems: state.Opportunity.selectedTopLeftItems,
    selectedTopRightItems: state.Opportunity.selectedTopRightItems,
    selectedBottomLeftItems: state.Opportunity.selectedBottomLeftItems,
    selectedBottomRightItems: state.Opportunity.selectedBottomRightItems,
    Probability: state.Opportunity.Probability,
    summaryData: state.Opportunity.summaryData,
    detailData: state.Opportunity.detailData,
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateFilter: (filter) => dispatch(OpportunityActions.opportunityUpdateFilter(filter)),
    getSummary: (selectedYears) => dispatch(OpportunityActions.opportunitySummaryRequest(selectedYears)),
    getDetail: (selectedYears) => dispatch(OpportunityActions.opportunityDetailRequest(selectedYears)),
  }
};

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(Opportunities));
