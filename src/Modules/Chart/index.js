import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import { creators as DefaultActions } from '../../Reducers/Default';
import SwipeableViews from 'react-swipeable-views';

import { withStyles } from '@material-ui/core/styles';
import {
  AppBar,
  Tabs,
  Tab,
} from '@material-ui/core';
import {
  fMonths,
  enMonths,

} from "../../Assets/js/constant"
import Intro from "./Intro";
import ExecutiveSummary from "./ExecutiveSummary";
import Fees from "./Fees";
import Expenses from "./Expenses";
import FinancialPerformanceYTD from "./FinancialPerformanceYTD";
import YearlyFinancialPerformance from "./YearlyFinancialPerformance";
import BalanceSheet from "./BalanceSheet";
import CashFlow from "./CashFlow";
import Debtors from "./Debtors";
import ProjectPerformance from "./ProjectPerformance";
import WorkInHand from "./WorkInHand";
import WIHDetailList from "./WIHDetailList";
import Opportunities from "./Opportunities";
import WorkGenerated from "./WorkGenerated";
import FeeProjection from "./FeeProjection";
import ProjectedFinancialPerformance from "./ProjectedFinancialPerformance";
import FinancialPerformanceProjDetail from "./FinancialPerformanceProjDetail";
import ProjectedCashFlow from "./ProjectedCashFlow";
import People from "./People";
import KPI from "./KPI";
import {
  financialMonth, makeDimDate
} from "../../Utils/Functions";
import {
  chartTypes
} from "../../Assets/js/constant";

import {styles} from './style';
import {connect} from "react-redux";


class Chart extends Component {

  constructor(props) {
    super(props);

    this.state = {
      tabIndex: 0,
      defaultYear: 2019,
      defaultMonth: 1,
      defaultDimDate: '20190101',
    };

    this.handleChangeTab = this.handleChangeTab.bind(this);
    this.defaultHandler = this.defaultHandler.bind(this)
  }

  defaultHandler(event)
  {
    this.setState(event);
  }

  onResize() {
    this.setState({resize: !this.state.resize});
  }

  componentDidMount() {

    this.props.defaultGetRequest("Unreal");

    const { type } = this.props.match.params;
    this.setState({tabIndex: chartTypes.indexOf(type),});
    window.addEventListener('resize', this.onResize.bind(this));
  }

  componentDidUpdate(prevProps, prevState) {

    let today = new Date();
    let month = today.getMonth() + 1;
    let year = today.getFullYear();
    let startMonth = this.props.defaultInfo['FiscalYearStartMonth'];
    let dimDate;

    if(prevProps.defaultInfo !== this.props.defaultInfo)
    {
      dimDate = makeDimDate(year,month,startMonth ) ;
      this.setState({defaultYear: year, defaultMonth:month , defaultDimDate:dimDate});

    }

  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize.bind(this));
  }

  handleChangeTab = (event, tabIndex) => {
    this.props.history.push('/chart/' + chartTypes[tabIndex]);
    this.setState({ tabIndex });
  };

  handleChangeIndex = tabIndex => {
    this.props.history.push('/chart/' + chartTypes[tabIndex]);
    this.setState({ tabIndex });
  };

  render() {
    const { classes, theme } = this.props;
    const { tabIndex , defaultYear , defaultMonth , defaultDimDate,} = this.state;

    return (
      <div id="page-container" >
        <div id="content-wrap" >
        {!isNaN(tabIndex) && tabIndex > -1 &&
          <Fragment >
            <AppBar position="static" color="default">
              <Tabs
                value={tabIndex}
                onChange={this.handleChangeTab}
                indicatorColor="primary"
                textColor="primary"
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="Intro" className="ft-bold" />
                <Tab label="Executive Summary" className="ft-bold" />
                <Tab label="Fees" className="ft-bold" />
                <Tab label="Expenses" className="ft-bold" />
                <Tab label="Financial Performance YTD" className="ft-bold" />
                <Tab label="Yearly Financial Performance" className="ft-bold" />
                <Tab label="Balance Sheet" className="ft-bold" />
                <Tab label="Cash Flow" className="ft-bold" />
                <Tab label="Debtors" className="ft-bold" />
                <Tab label="Project Performance" className="ft-bold" />
                <Tab label="Work in Hand" className="ft-bold" />
                <Tab label="Opportunities" className="ft-bold" />
                <Tab label="Work Generated" className="ft-bold" />
                <Tab label="Fee Projection" className="ft-bold" />
                <Tab label="Projected Financial Performance" className="ft-bold" />
                <Tab label="Projected Cash Flow" className="ft-bold" />
                <Tab label="People" className="ft-bold" />
                <Tab label="KPI" className="ft-bold" />
              </Tabs>
            </AppBar>

            <div className={classes.slider} >
              <SwipeableViews
                axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                index={tabIndex}
                onChangeIndex={this.handleChangeIndex}
              >
                {tabIndex === 0 ? <Intro dir={theme.direction}/> : <div></div> }
                {tabIndex === 1 ? <ExecutiveSummary dir={theme.direction}
                                                    defaultYear={defaultYear}
                                                    defaultStartMonth={this.props.defaultInfo['FiscalYearStartMonth']}
                                                    defaultMonth={defaultMonth}
                                                    defaultDimDate={defaultDimDate}
                                                    defaultHandler={this.defaultHandler}
                /> : <div></div> }
                {tabIndex === 2 ? <Fees dir={theme.direction}
                                        defaultYear={defaultYear}
                                        defaultMonth={defaultMonth}
                                        defaultDimDate={defaultDimDate}
                                        defaultStartMonth={this.props.defaultInfo['FiscalYearStartMonth']}
                /> : <div></div>}
                {tabIndex === 3 ? <Expenses dir={theme.direction}
                                            defaultYear={defaultYear}
                                            defaultMonth={defaultMonth}
                                            defaultDimDate={defaultDimDate}
                                            defaultStartMonth={this.props.defaultInfo['FiscalYearStartMonth']}
                /> : <div></div>}
                {tabIndex === 4 ? <FinancialPerformanceYTD dir={theme.direction}
                                                           defaultYear={defaultYear}
                                                           defaultMonth={defaultMonth}
                                                           defaultDimDate={defaultDimDate}
                                                           defaultStartMonth={this.props.defaultInfo['FiscalYearStartMonth']}
                /> : <div></div>}
                {tabIndex === 5 ? <YearlyFinancialPerformance dir={theme.direction}
                                                              defaultYear={defaultYear}
                                                              defaultMonth={defaultMonth}
                                                              defaultDimDate={defaultDimDate}
                                                              defaultStartMonth={this.props.defaultInfo['FiscalYearStartMonth']}
                /> : <div></div>}
                {tabIndex === 6 ? <BalanceSheet dir={theme.direction}
                                                defaultYear={defaultYear}
                                                defaultMonth={defaultMonth}
                                                defaultDimDate={defaultDimDate}
                                                defaultStartMonth={this.props.defaultInfo['FiscalYearStartMonth']}
                /> : <div></div>}
                {tabIndex === 7 ? <CashFlow dir={theme.direction}
                                            defaultYear={defaultYear}
                                            defaultMonth={defaultMonth}
                                            defaultDimDate={defaultDimDate}
                                            defaultStartMonth={this.props.defaultInfo['FiscalYearStartMonth']}
                /> : <div></div>}
                {tabIndex === 8 ? <Debtors dir={theme.direction}
                                           defaultYear={defaultYear}
                                           defaultMonth={defaultMonth}
                                           defaultDimDate={defaultDimDate}
                                           defaultStartMonth={this.props.defaultInfo['FiscalYearStartMonth']}
                /> : <div></div>}
                {tabIndex === 9 ? <ProjectPerformance dir={theme.direction}
                                                      defaultYear={defaultYear}
                                                      defaultMonth={defaultMonth}
                                                      defaultDimDate={defaultDimDate}
                                                      defaultStartMonth={this.props.defaultInfo['FiscalYearStartMonth']}
                /> : <div></div>}
                {tabIndex === 10 ? <WorkInHand dir={theme.direction}
                                               defaultYear={defaultYear}
                                               defaultMonth={defaultMonth}
                                               defaultDimDate={defaultDimDate}
                                               defaultStartMonth={this.props.defaultInfo['FiscalYearStartMonth']}
                /> : <div></div>}

                {tabIndex === 11 ? <Opportunities dir={theme.direction}
                                                  defaultYear={defaultYear}
                                                  defaultStartMonth={this.props.defaultInfo['FiscalYearStartMonth']}
                                                  defaultMonth={defaultMonth}
                                                  defaultDimDate={defaultDimDate}
                                                  defaultHandler={this.defaultHandler}
                /> : <div></div>}
                {tabIndex === 12 ? <WorkGenerated dir={theme.direction}
                                              defaultYear={defaultYear}
                                              defaultStartMonth={this.props.defaultInfo['FiscalYearStartMonth']}
                                              defaultMonth={defaultMonth}
                                              defaultDimDate={defaultDimDate}
                                              defaultHandler={this.defaultHandler}
                /> : <div></div>}
                {tabIndex === 13 ? <FeeProjection dir={theme.direction}
                                                  defaultYear={defaultYear}
                                                  defaultStartMonth={this.props.defaultInfo['FiscalYearStartMonth']}
                                                  defaultMonth={defaultMonth}
                                                  defaultDimDate={defaultDimDate}
                                                  defaultHandler={this.defaultHandler}

                /> : <div></div>}
                {tabIndex === 14 ? <ProjectedFinancialPerformance dir={theme.direction}
                                                                  defaultYear={defaultYear}
                                                                  defaultMonth={defaultMonth}
                                                                  defaultDimDate={defaultDimDate}
                                                                  defaultStartMonth={this.props.defaultInfo['FiscalYearStartMonth']}
                /> : <div></div>}
                {tabIndex === 15 ? <ProjectedCashFlow dir={theme.direction}
                                                      defaultYear={defaultYear}
                                                      defaultMonth={defaultMonth}
                                                      defaultDimDate={defaultDimDate}
                                                      defaultStartMonth={this.props.defaultInfo['FiscalYearStartMonth']}

                /> : <div></div>}
                {tabIndex === 16 ? <People dir={theme.direction}
                                                      defaultYear={defaultYear}
                                                      defaultMonth={defaultMonth}
                                                      defaultDimDate={defaultDimDate}
                                                      defaultStartMonth={this.props.defaultInfo['FiscalYearStartMonth']}
                /> : <div></div>}
                {tabIndex === 17 ? <KPI dir={theme.direction}
                                                    defaultYear={defaultYear}
                                                    defaultStartMonth={this.props.defaultInfo['FiscalYearStartMonth']}
                                                    defaultMonth={defaultMonth}
                                                    defaultDimDate={defaultDimDate}
                                                    defaultHandler={this.defaultHandler}
                /> : <div></div>}

              </SwipeableViews>
            </div>

          </Fragment>
        }
        </div>
        <div id="js-gdpr-consent-banner" className="p16 bg-black-700 ff-sans fc-grey ps-fixed b0 l0 r0 z-banner"  aria-hidden="false">
        <div className=" mx-auto grid jc-center f-small" >
            Unreal Architecture Pty Ltd | {enMonths[financialMonth(this.state.defaultMonth, this.props.defaultInfo['FiscalYearStartMonth']) - 1]} {this.state.defaultYear} {tabIndex==0?'':'| '+ tabIndex}
        </div>
        <div className=" mx-auto grid jc-center f-small" >
          <svg width = {320} height={20}>
            <rect width={8} y={0} x={8} height={15} fill={'#eb008b'}/>
            <rect width={8} y={0} x={16} height={15} fill={'#2a3890'}/>
            <rect width={8} y={0} x={24} height={15} fill={'#8bc43f'}/>
            <rect width={8} y={0} x={32} height={15} fill={'#2a3890'}/>
            <rect width={8} y={0} x={40} height={15} fill={'#26a9e1'}/>
            <rect width={8} y={0} x={48} height={15} fill={'#909598'}/>
            <rect width={8} y={0} x={56} height={15} fill={'#eb008b'}/>
            <rect width={8} y={0} x={64} height={15} fill={'#909598'}/>
            <rect width={8} y={0} x={72} height={15} fill={'#8bc43f'}/>
            <rect width={8} y={0} x={80} height={15} fill={'#c31c2b'}/>
            <rect width={8} y={0} x={88} height={15} fill={'#1a75bb'}/>
            <rect width={8} y={0} x={96} height={15} fill={'#f9ec00'}/>
            <rect width={8} y={0} x={104} height={15} fill={'#90278e'}/>
            <rect width={8} y={0} x={112} height={15} fill={'#652d90'}/>
            <rect width={8} y={0} x={120} height={15} fill={'#909598'}/>
            <rect width={8} y={0} x={128} height={15} fill={'#29b473'}/>
            <rect width={8} y={0} x={136} height={15} fill={'#f15a23'}/>
            <rect width={8} y={0} x={144} height={15} fill={'#26a9e1'}/>
            <rect width={8} y={0} x={152} height={15} fill={'#8bc43f'}/>
            <text dx={165} dy={10} fill={'#444'} fontSize={10} font={'Verdana'}>
              © MANAGEMENT FOR DESIGN</text>
          </svg>
        </div>
    </div>


      </div>
    );
  };
}

Chart.propTypes = {
  classes: PropTypes.object.isRequired,
  defaultInfo: PropTypes.object.isRequired
}

const mapStateToProps = state => {
  return {
    defaultInfo: state.Default.defaultInfo,
  }
};


const mapDispatchToProps = (dispatch) => {
  return {
    updateFilter: (filter) => dispatch(DefaultActions.defaultUpdateFilter(filter)),
    defaultGetRequest: (OrgName) => dispatch(DefaultActions.defaultGetRequest(OrgName)),
  }
};

export default withStyles(styles, {withTheme: true})(connect(mapStateToProps, mapDispatchToProps)(Chart));
