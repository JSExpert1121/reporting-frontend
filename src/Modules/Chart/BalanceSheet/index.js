import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';

import { styles } from './style';

import { creators as BalanceSheetActions } from '../../../Reducers/BalanceSheet';
import TopChart from "./TopChart";
import MiddleChart from "./MiddleChart";
import BottomChart from "./BottomChart";
import {Typography} from "@material-ui/core";
import {formatedStyle} from "../../../Assets/js/constant";

class BalanceSheet extends Component {

  constructor(props) {
    super(props);

    this.state = {
      currentAsset:0,
      currentLiability:0,
      YTDProfit:0,
      totalAsset:0
    };

    this.handleFilter = this.handleFilter.bind(this);
    this.updateFilter = this.updateFilter.bind(this);
  }

  componentDidMount() {
    console.log('Balance Sheet');
    const { defaultDimDate } = this.props;
    this.props.updateFilter({dimDate:defaultDimDate});
    this.props.getBalanceSheetQuerys(defaultDimDate);
   }

  componentWillUnmount() {

  }

  handleFilter = (event) => {

    this.props.updateFilter(event);
    console.log(event)
  };

  updateFilter = (event) =>{
    this.setState(event);
  }


  render() {
    const { classes, dir,queryResult, dimDate} = this.props;
    const {currentAsset,currentLiability , YTDProfit, totalAsset} = this.state;
    console.log("___");
    console.log(this.state);
    let ratioA = 1;
    let ratioB = 1;
    if(currentAsset > currentLiability)
      ratioA = Math.round(currentAsset / currentLiability);
    else
      ratioB = Math.round(currentLiability / currentAsset );

    let roi = Math.round((YTDProfit / totalAsset) * 100);

    return (
      <div className={classes.root} dir={dir}>

          <p style={formatedStyle(-1 , 12,0,1)} align = {"right"} className={`grayHover`}>

            Current Ratio:&nbsp;&nbsp;&nbsp;&nbsp;{ratioA}:{ratioB} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ROI:&nbsp;&nbsp;&nbsp;&nbsp;{roi}%&nbsp;&nbsp;&nbsp;&nbsp;
          </p>


          <TopChart 
              queryData={queryResult}
              dimDate={dimDate}
              handleFilter={this.handleFilter}
              updateFilter={this.updateFilter}
            />
            <MiddleChart 
              queryData={queryResult}
              dimDate={dimDate}
              handleFilter={this.handleFilter}
              updateFilter={this.updateFilter}
            />
            <BottomChart 
              queryData={queryResult}
              dimDate={dimDate}
              handleFilter={this.handleFilter}
              updateFilter={this.updateFilter}
            />

        
      </div>
    );
  }

}


BalanceSheet.propTypes = {
  classes: PropTypes.object.isRequired,
  dir: PropTypes.string.isRequired,
  dimDate: PropTypes.string.isRequired,
  queryResult: PropTypes.object.isRequired,
  defaultYear: PropTypes.number.isRequired,
  defaultMonth: PropTypes.number.isRequired,
  defaultDimDate: PropTypes.string.isRequired,
};

const mapStateToProps = state => {
  return {
    queryResult: state.BalanceSheet.queryResult,
    dimDate: state.BalanceSheet.dimDate,
  }
}; 

const mapDispatchToProps = (dispatch) => {
  return {
    updateFilter: (filter) => dispatch(BalanceSheetActions.glbsUpdateFilter(filter)),
    getBalanceSheetQuerys: (dimDate) => dispatch(BalanceSheetActions.glbsQuerysRequest(dimDate)),
  }
};

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(BalanceSheet));
