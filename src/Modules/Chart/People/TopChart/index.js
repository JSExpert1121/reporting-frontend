import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import {
  Typography
} from '@material-ui/core'
import Truncate from 'react-truncate';
import { BarStack, Bar } from '@vx/shape';
import { Group } from '@vx/group';
import { withTooltip, Tooltip } from "@vx/tooltip";
import { AxisLeft, AxisBottom } from '@vx/axis'
import { scaleBand, scaleLinear, scaleOrdinal } from '@vx/scale';

import {
  getParams, getMonth, thousandFormat , getMonths , getMonths2, financialMonth, getFinancialIndex, makeDimDate
  , getMonthForPoeplePage
} from "../../../../Utils/Functions";
import {
  enMonths,
  positiveActiveColor,
  positiveDisableColor,
  negativeActiveColor,
  negativeDisableColor,
  activeLabelColor,
  tooltip
} from "../../../../Assets/js/constant";

import { styles } from './style';

// accessors
const x = d => d.month;

let tooltipTimeout;
let humantooltipTimeout;

class TopChart extends Component {

  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = {
      resize: false,

      hoverBar: null,
      hoverHuman: null,
      selectedBars: [],

      data: [],
      totals: [],
      forcasts: [],
      colors: [],
    };

    this._prepareData = this._prepareData.bind(this);
    this._handleBar = this._handleBar.bind(this);
    this._handleLabel = this._handleLabel.bind(this);
    this._deSelectAll = this._deSelectAll.bind(this);
  }

  _onResize() {
    if(this._isMounted === true)
      this.setState({resize: !this.state.resize});
  }

  componentDidMount() {
    this._isMounted = true;
    this._prepareData();
    window.addEventListener('resize', this._onResize.bind(this));
  }

  componentDidUpdate(prevProps, prevState){
    if (
      prevProps.summaryData !== this.props.summaryData
    ) {
      if(this._isMounted === true)
        this._prepareData();
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
    window.removeEventListener('resize', this._onResize.bind(this));
  }

  _prepareData = () => {
    const { summaryData, selectedYears, period, defaultYear  , defaultMonth, defaultStartMonth } = this.props;

    let dictData = {};
    let dictTotals = {};
    let dictForcasts = {};
    let data = [];
    let totals = [];
    let forcasts = [];

    let colors = selectedYears.reduce((ret, year) => {
      ret.push(positiveActiveColor);
      return ret;
    }, []);

    let fiscalMonths2 = getMonths2( this.props.defaultMonth, this.props.defaultStartMonth);
    let fiscalMonths = getMonths(this.props.defaultStartMonth);
    /*fiscalMonths.forEach(month => {
      dictData[month] = {};
      dictData[month]['month'] = month;
      dictData[month]['value'] = {};
      dictData[month]['future'] = false;
      selectedYears.forEach(year => {
        dictData[month][year] = 0;
      });

      dictTotals[month] = 0;
      dictForcasts[month] = 0;
    });*/

    summaryData.forEach(item => {
      let month = getMonth(item.Date);
      let boundaryMonth = financialMonth(defaultMonth, defaultStartMonth);
      let monthIndex= getFinancialIndex(month + 1, this.props.defaultStartMonth);
      let boundaryIndex= getFinancialIndex(boundaryMonth, this.props.defaultStartMonth);

      let key;
      key = (boundaryIndex < monthIndex && item.FY == defaultYear ||
                                item.FY > defaultYear)?"feature":"past";
      key = key + "_" + item.WorkDaysInPeriod + "_" + month;
      //console.log(item.FY + "," + (month + 1) + "," + month + "," + boundaryMonth + "," + key);
      if(dictData[key] === undefined)
      {
        dictData[key] = {};
        dictTotals[key] = 0;
        dictForcasts[key] = 0;
        dictData[key]['value'] = {};
      }
      if(dictData[key][item.FY] === undefined)
      {
        dictData[key][item.FY] = 0;
        dictData[key]['month'] = month;
      }

      if(dictData[key]['value'][item.FY] === undefined)
        dictData[key]['value'][item.FY] = item;

      if(boundaryIndex < monthIndex && item.FY === defaultYear ||item.FY > defaultYear)
      {
        dictData[key]['future'] = true;
        dictData[key][item.FY] += item.ForecastFees;
      } else {
        dictData[key]['future'] = false;
        dictData[key][item.FY] += item.ActualFees;
      }

      dictTotals[key] += dictData[key][item.FY];
      dictForcasts[key] += item.ForecastFees;

    });

    // sorted by fasical years and past items
    fiscalMonths.forEach(month => {
      let multip = 100;
      let duplicatedMonth = -1;

      Object.keys(dictData).map(inx=>{
        if(dictData[inx]['month'] === month && dictData[inx]['future'] === false)
        {
          if(duplicatedMonth === month)
          {
            dictData[inx]['month'] = dictData[inx]['month'] + multip;
            multip *= 100;
          } else {
            multip = 100;
            duplicatedMonth = month;
          }

          data.push(dictData[inx]);
        }
      })
    });

    // sorted by fasical years and future items
    fiscalMonths.forEach(month => {
      let multip = 100;
      let duplicatedMonth = -1;

      Object.keys(dictData).map(inx=>{
        if(dictData[inx]['month'] === month && dictData[inx]['future'] === true)
        {
          // this is for ensuring that the month field does not duplicated for scale process.
          if(duplicatedMonth === month)
          {
            dictData[inx]['month'] = (dictData[inx]['month'] + multip) * -1;
            multip *= 100;
          } else {
            multip = 100;
            dictData[inx]['month'] = (dictData[inx]['month'] + multip) * -1;
            duplicatedMonth = month;
          }
          data.push(dictData[inx]);
        }
      })

    });

    // data items is sorted but total and forcast is not sorted.
    // so you need to use only for min , max calculation.
    Object.keys(dictData).map(inx=>{
        totals.push(dictTotals[inx]);
        forcasts.push(dictForcasts[inx]);
    })

    this.setState({
      data: data,
      totals: totals,
      forcasts: forcasts,
      colors: colors
    });
  };

  _getColor = (bar) => {
    const { selectedMonths, selectedTopItems } = this.props;

    const year = bar.key;
    const month = bar.bar.data.month;

    if (selectedTopItems.length === 0 && selectedMonths.length === 0) {
      return negativeActiveColor;
    }
    if (selectedMonths.indexOf(month) > -1) return negativeActiveColor;

    for (let i = 0; i < selectedTopItems.length ; i++) {
      if (selectedTopItems[i].month === month && selectedTopItems[i].year === year) {
        return negativeActiveColor;
      }
    }

    return negativeDisableColor;
  };

  _handleBar = (event, bar) => {
    const { selectedMonths, selectedTopItems } = this.props;
    const { selectedBars } = this.state;

    let _selectedBars, _selectedMonths, _selectedTopItems;

    const month = bar.bar.data.month;
    const year = bar.key;

    if (event.shiftKey) {
      _selectedBars = selectedBars.slice();
      _selectedTopItems = selectedTopItems.slice();
      _selectedMonths = selectedMonths.slice();

      let index = NaN;
      for (let i = 0; i < selectedBars.length; i++) {
        if (selectedBars[i] === event.target) {
          index = i;
          break;
        }
      }

      if (isNaN(index)) {
        event.target.classList.add('barActive');
        _selectedBars.push(event.target);
        _selectedMonths.push(month);
        _selectedTopItems.push({month: month, year: year});
      } else {
        event.target.classList.remove('barActive');
        _selectedBars.splice(index, 1);
        _selectedTopItems.splice(index, 1);
        _selectedMonths.splice(index, 1);
      }

    } else {
      _selectedMonths = [];
      let exist = false;

      selectedBars.forEach(selectedBar => {
        selectedBar.classList.remove('barActive');
        if (selectedBar === event.target) exist = true;
      });

      if (exist && selectedBars.length === 1) {
        _selectedTopItems = [];
        _selectedBars = [];
        _selectedMonths = [];
      } else {
        _selectedTopItems = [{month: month, year: year}];
        _selectedBars = [event.target];
        _selectedMonths = [month];
        event.target.classList.add('barActive');
      }
    }

    let printf = require('printf');
    let dimDate = [];
    _selectedTopItems.map((item , key)=> {

      let _DimDate = printf("%04d%02d01" ,
        (getMonthForPoeplePage(item.month) + 1)>= this.props.defaultStartMonth? item.year-1:item.year ,
        (getMonthForPoeplePage(item.month) + 1));
      dimDate.push(_DimDate);
    });

    if(dimDate.length > 0)
      this.props.getPeopleDetail(dimDate);

    this.setState({
      selectedBars: _selectedBars,
    });

    this.props.handleFilter({
      selectedTopItems: _selectedTopItems,
      selectedMonths: _selectedMonths
    });

  };

  _handleLabel = (event, month , all = '') => {
    let { selectedMonths, selectedTopItems, selectedYears } = this.props;
    const { selectedBars } = this.state;
    let _selectedMonths, _selectedTopItems, _selectedBars;

    selectedYears = selectedYears.slice();
    const allIndex = selectedYears.indexOf('All');
    if (allIndex > -1) selectedYears.splice(allIndex, 1);

    let index = NaN;
    for (let i = 0; i < selectedMonths.length; i++) {
      if (selectedMonths[i] === month) {
        index = i;
        break;
      }
    }

    if (event.shiftKey) {
      _selectedBars = selectedBars.slice();
      _selectedMonths = selectedMonths.slice();
      _selectedTopItems = selectedTopItems.slice();

      if (isNaN(index)) {
        _selectedMonths.push(month);
        _selectedTopItems.push({month: month, year: selectedYears[0]});
      } else {
        _selectedMonths.splice(index, 1)
      }

    } else {
      _selectedBars = [];
      _selectedTopItems = [];

      selectedBars.forEach(selectedBar => {
        selectedBar.classList.remove('barActive');
      });

      if (!isNaN(index) && selectedMonths.length === 1) {
        _selectedMonths = [];
      } else {
        _selectedMonths = [month];
        _selectedTopItems.push({month: month, year: selectedYears[0]});
      }
    }

    this.setState({
      selectedBars: _selectedBars,
    });

    if(all != '')
    {
      let {data} = this.state;
      _selectedMonths = [];
      _selectedTopItems = [];
      data.map(item=>{
        _selectedMonths.push(item.month);
        _selectedTopItems.push({month: item.month, year: selectedYears[0]});
      })
    }

    let printf = require('printf');
    let dimDate = [];

    _selectedTopItems.map((item , key)=> {

        let _DimDate = printf("%04d%02d01" ,
          (getMonthForPoeplePage(item.month) + 1)>= this.props.defaultStartMonth? item.year-1:item.year ,
          (getMonthForPoeplePage(item.month) + 1));
        dimDate.push(_DimDate);

    });

    if(dimDate.length > 0)
      this.props.getPeopleDetail(dimDate);

    this.props.handleFilter({
      selectedMonths: _selectedMonths,
      selectedTopItems: _selectedTopItems,
    });
  };

  _deSelectAll = () => {
    const { hoverBar, selectedBars } = this.state;

    if (hoverBar) hoverBar.classList.remove('barHover');

    selectedBars.forEach(selectedBar => {
      selectedBar.classList.remove('barActive');
    });

    this.setState({
      hoverBar: null,
      selectedBars: [],
    });

    this.props.handleFilter({
      selectedMonths: [],
      selectedTopItems: [],
    });
  };

  _humanTooltip = (event) => {
    if (humantooltipTimeout) clearTimeout(humantooltipTimeout);
    const { hoverHuman } = this.state;
    event.target.classList.add('barHover');
    this.setState({hoverHuman: event.target});
  }

  _hidehumanTooltip = () => {
    const { hoverHuman } = this.state;
    const { hideTooltip } = this.props;

    humantooltipTimeout = setTimeout(() => {
      if (hoverHuman) hoverHuman.classList.remove('barHover');
      this.setState({hoverHuman: null});

      hideTooltip();
    }, 300);
  };

  _showTooltip = (event, xScale, bar, isBar=true) => {
    if (tooltipTimeout) clearTimeout(tooltipTimeout);

    const { showTooltip } = this.props;
    let data = {}, top, left;

    if (isBar) {
      const { hoverBar } = this.state;
      if (hoverBar) hoverBar.classList.remove('barHover');
      event.target.classList.add('barHover');
      this.setState({hoverBar: event.target});

      top = event.clientY - 200;
      left = event.clientX;
      data = bar;
    } else {
      top = event.clientY - 200;
      left = event.clientX;
      data['month'] = bar;
    }

    data['isBar'] = isBar;

    showTooltip({
      tooltipData: data,
      tooltipTop: top,
      tooltipLeft: left
    });
  };

  _hideTooltip = () => {
    const { hoverBar } = this.state;
    const { hideTooltip } = this.props;

    tooltipTimeout = setTimeout(() => {
      if (hoverBar) hoverBar.classList.remove('barHover');
      this.setState({hoverBar: null});

      hideTooltip();
    }, 300);
  };

  render() {
    const {
      classes, selectedYears, period, selectedMonths,
      tooltipOpen, tooltipTop, tooltipLeft, tooltipData
    } = this.props;
    const { data, totals, forcasts, colors } = this.state;
    const width = window.innerWidth - 30;
    const height = 350;
    const margin = {
      top: 10,
      right: 0,
      bottom: 20,
      left: 80
    };

    const { pageYOffset, xMax, yMax } = getParams(window, width, height, margin);
    const offsetX = 3.5;
    const offsetWidth = - 1.2;
    let minY = Math.min(Math.min(...totals), Math.min(...forcasts));
    minY = Math.min(0 , minY);
    let maxY = Math.max(Math.max(...totals), Math.max(...forcasts));
    maxY = Math.max(0 , maxY);

    // scales
    const xScale = scaleBand({
      domain: data.map(x),
      rangeRound: [0, xMax],
      padding: 0.2
    });

    const yScale = scaleLinear({
      domain: [minY * 1.1, maxY * 1.1 ],
      range: [yMax, 0],
      nice: true
    });

    const color = scaleOrdinal({
      domain: selectedYears,
      range: colors
    });

    //let fiscalMonths = getMonths2( this.props.defaultMonth, this.props.defaultStartMonth);
    let fiscalMonths = getMonths(this.props.defaultStartMonth);
    let futureWidth , futureX = 0;
    let pastWidth , existPastMonth = false;
    // find first future month
    data.forEach(item=>{
      if(item.future === true && futureX === 0)
      {
        futureX = xScale(item.month)- xScale.paddingInner() * xScale.step() / 2;
        futureWidth = xMax - futureX;
      }
      if(item.future === false)
      {
        existPastMonth = true;
      }
    })

    return (
      <div className={classes.root}>
        <div className="well">
          <div className="flex">
            <Typography variant="h6" className="subtitle mb-10">Requirements</Typography>
            <div>
              <svg width={400} height={30}>
                <Group top={0} left={20}>
                  <Bar
                    width={10}
                    height={10}
                    x={10}
                    y={10}
                    fill={'grey'}
                    stroke={"grey"}
                    strokeWidth={0.5}
                  />
                  <text
                    fontSize={12}
                    x={40} y={20}
                    textAnchor="middle"
                  >
                  Fees
                  </text>
                  <Group  top={0} left={60}>
                      <g transform={'scale(0.021  0.021)'} fill={'#1c75bc'}>
                        <path d="M576 96c0 53.019-42.981 96-96 96s-96-42.981-96-96c0-53.019 42.981-96 96-96s96 42.981 96 96z"></path>
                        <path d="M576 256h-192c-35.346 0-64 28.654-64 64v320h64v384h80v-384h32v384h80v-384h64v-320c0-35.346-28.652-64-64-64z"></path>
                      </g>
                  </Group>
                  <text
                    fontSize={12}
                    x={120} y={20}
                    textAnchor="middle"
                  >
                  Actual People
                  </text>
                  <Group  top={0} left={170}>
                      <g transform={'scale(0.021  0.021)'} fill={'black'}>
                        <path d="M576 96c0 53.019-42.981 96-96 96s-96-42.981-96-96c0-53.019 42.981-96 96-96s96 42.981 96 96z"></path>
                        <path d="M576 256h-192c-35.346 0-64 28.654-64 64v320h64v384h80v-384h32v384h80v-384h64v-320c0-35.346-28.652-64-64-64z"></path>
                      </g>
                  </Group>
                  <text
                    fontSize={12}
                    x={280} y={20}
                    textAnchor="middle"
                  >
                  Forecast People Based on Fees
                  </text>
                </Group>
              </svg>
            </div>
          </div>
          <div className="relative">
            <svg width={width} height={height}>

              <Group top={margin.top} left={margin.left}>
                {
                  futureX && existPastMonth > 0?
                    <Group>
                      <Bar
                        width={futureWidth}
                        height={height}
                        x={futureX}
                        y={0}
                        fill={'#f3f3f3'}
                        stroke={"black"}
                        strokeWidth={0.5}
                      />
                    </Group>
                    :
                    ""
                }

                <rect x={0} y={0} width={width} height={height} fill={'transparent'} onClick={this._deSelectAll} />

                <BarStack data={data} keys={selectedYears} x={x} xScale={xScale} yScale={yScale} color={color}>
                  {( barStacks ) => {
                    return barStacks.map(barStack => {
                      return barStack.bars.map(bar => {

                        return (
                          <rect
                            key={`bar-income-${barStack.index}-${bar.index}`}

                            x={bar.x}
                            y={bar.y}
                            height={isNaN(bar.height) ? 0 : bar.height}
                            width={bar.width}
                            fill={this._getColor(bar)}
                            onClick={event => this._handleBar(event, bar)}
                            onMouseLeave={event => this._hideTooltip()}
                            onMouseMove={event => this._showTooltip(event, xScale, bar)}
                            onTouchEnd={event => this._hideTooltip()}
                            onTouchMove={event => this._showTooltip(event, xScale, bar)}
                          />
                        );
                      });
                    });
                  }}
                </BarStack>


                <AxisLeft
                  numTicks={4}
                  scale={yScale}
                  stroke="black"
                  tickStroke="black"
                  tickLabelProps={(value, index) => ({
                    fill: 'black',
                    fontSize: 11,
                    textAnchor: 'end',
                    dy: '0.33em',
                    dx: '-0.33em'
                  })}
                  tickComponent={({ formattedValue, ...tickProps }) => (
                    <text
                      {...tickProps} fill={'black'}
                    >
                      ${formattedValue}
                    </text>
                  )}
                />

                {
                  data.map((item, index) => {
                    let x = 0;
                    x = xScale(item.month) - (xScale.step() * xScale.paddingInner()) / 2;

                    return (
                      <rect
                        key={`label-${index}`}
                        x={x} y={yMax}
                        width={xScale.step()}
                        height={margin.bottom}
                        fill={selectedMonths.indexOf(item.month) > -1 ? activeLabelColor : 'transparent'}
                        onClick={(event) => this._handleLabel(event, item.month)}
                      />
                    )
                  })
                }

                {
                  data.map((item, index) => {
                    let fullTime = 0;
                    let workTime = 0;
                    let percent = 0;
                    Object.keys(item.value).map(subitemkey=>{
                        fullTime += item.value[subitemkey].ActualFullTimeEmployees;
                        workTime += item.value[subitemkey].WorkDaysInPeriod;
                    });

                    percent = Number( ((workTime/fullTime) * 100).toFixed(2));
                    if(percent == Infinity)
                      percent = 100.0

                    let left = xScale(item.month);
                    let width = xScale.step() -  xScale.paddingInner() * xScale.step() / 2;
                    let iconRatioX = 0.03 ;
                    let iconRatioY = 0.03 ;
                    // 1c75bc , ccdce9 <- past
                    // c7c7c7: disable future
                    return(

                        <Group key={`human-${index}`} top={yMax - 50} left={left + width* 1/2 - 20}>
                            <g transform={`scale(${iconRatioX}  ${iconRatioY})`}
                            fill={item.future===false?
                              tooltipOpen && tooltipData.isBar === false&&tooltipData.month===item.month
                              ?'#0c058c':'#1c75bc'
                              :tooltipOpen && tooltipData.isBar === false&&tooltipData.month===item.month
                              ?'grey':'black'}
                            onMouseLeave={event => this._hideTooltip()}
                            onMouseMove={event => this._showTooltip(event, null, item.month, false)}
                            onTouchEnd={event => this._hideTooltip()}
                            onTouchMove={event => this._showTooltip(event, null, item.month , false)}
                            onClick={(event) => this._handleLabel(event, item.month , 'all')}
                            >
                              <path d="M576 96c0 53.019-42.981 96-96 96s-96-42.981-96-96c0-53.019 42.981-96 96-96s96 42.981 96 96z"></path>
                              <path d="M576 256h-192c-35.346 0-64 28.654-64 64v320h64v384h80v-384h32v384h80v-384h64v-320c0-35.346-28.652-64-64-64z"></path>
                            </g>
                            <text
                              key={index}
                              fontSize={10}
                              x={15} y={45}
                              textAnchor="middle"
                            >
                            {percent}
                            </text>
                          </Group>


                    )
                  })
                }
                <AxisBottom
                  hideTicks={true}
                  numTicks={6}
                  scale={xScale}
                  top={yMax}
                  stroke="black"
                  tickStroke="black"
                  tickLabelProps={(value, index) => ({
                    fontSize: 11,
                    textAnchor: 'middle',
                    dy: '-0.5em',
                  })}
                  tickComponent={({ formattedValue, ...tickProps }) => (

                    <text
                      {...tickProps} fill={selectedMonths.indexOf(formattedValue) > -1 ? 'white' : 'black'}
                      onClick={(event) => this._handleLabel(event, formattedValue)}
                    >
                      {enMonths[getMonthForPoeplePage(formattedValue)]}
                    </text>
                  )}
                />

              </Group>
            </svg>

            {tooltipOpen && tooltipData.isBar === true && (
              <Tooltip
                top={tooltipTop + pageYOffset}
                left={tooltipLeft}
                style={tooltip}
              >
                {tooltipData.isBar ?
                  <div>
                    <div className="pdv-10">
                      <strong>FY {tooltipData.key} : {enMonths[x(tooltipData.bar.data)]}</strong>
                    </div>

                    <div className="ft-12">
                      Income: <strong>${thousandFormat(tooltipData.bar.data.value[tooltipData.key].ActualFees)}</strong>
                    </div>
                  </div>
                  :
                  <div>
                    empty
                  </div>
                }
              </Tooltip>
            )}

          </div>
        </div>
      </div>
    );
  }

}


TopChart.propTypes = {
  classes: PropTypes.object.isRequired,

  summaryData: PropTypes.array.isRequired,

  selectedYears: PropTypes.array.isRequired,
  selectedMonths: PropTypes.array.isRequired,
  selectedTopItems: PropTypes.array.isRequired,
  defaultStartMonth: PropTypes.number.isRequired,
  defaultMonth: PropTypes.number.isRequired,
  defaultYear: PropTypes.number.isRequired,
  handleFilter: PropTypes.func.isRequired,
  getPeopleDetail: PropTypes.func.isRequired,
};

export default withStyles(styles)(withTooltip(TopChart));
