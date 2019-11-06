import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import {
  Typography
} from '@material-ui/core'

import { BarStack, Bar } from '@vx/shape';
import { Group } from '@vx/group';
import { withTooltip, Tooltip } from "@vx/tooltip";
import { AxisLeft, AxisBottom } from '@vx/axis'
import { scaleBand, scaleLinear, scaleOrdinal } from '@vx/scale';

import {
  getParams, getMonths ,thousandFormat2 , convertMonth, getMonths2
} from "../../../../Utils/Functions";
import {
  enMonths,
  positiveActiveColor,
  positiveDisableColor,
  negativeActiveColor,
  negativeDisableColor,
   minusActiveColor,
  minusDisableColor,
  activeLabelColor,
  tooltip,

} from "../../../../Assets/js/constant";

import { styles } from './style';

// accessors
const x = d => d.month;

let tooltipTimeout;


class TopChart extends Component {

  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = {
      resize: false,

      hoverBar: null,
      selectedBars: [],

      data: [],
      totals: [],
      income: [],
      forecasts: [],
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
    const { summaryData, selectedYears } = this.props;

    let dictData = {};
    let dictTotals = {};
    let dictForecasts = {};
    let dictYeartodate= [];
    let dictIncome= [];
    let yeartodate=[];
    let data = [];
    let totals = [];
    let forecasts = [];
    let income = [];

    let colors = selectedYears.reduce((ret, year) => {
      ret.push(positiveActiveColor);
      return ret;
    }, []);

    let fiscalMonths = getMonths(this.props.defaultStartMonth);
    let fiscalMonths2 = getMonths2( this.props.defaultMonth, this.props.defaultStartMonth);

    fiscalMonths.forEach(month => {
      dictData[month] = {};
      dictData[month]['month'] = month;
      dictData[month]['value'] = {};
      dictData[month]['yeartodate'] = 0;
      dictIncome[month] = {};
      dictIncome[month]['total'] = 0;
      dictIncome[month]['income'] = 0;
      dictIncome[month]['profit'] = 0;

      dictYeartodate[month] = 0;
      selectedYears.forEach(year => {
        dictData[month][year] = 0;
      });

      dictTotals[month] = 0;
      dictForecasts[month] = 0;
      yeartodate[month] = 0;
    });

    let  prevalue = 0 , firstnode = 1;
    summaryData.forEach(item => {
      let month = convertMonth(item.MonthName);

      if(dictData[month] !== undefined)
      {
        if(fiscalMonths2.indexOf(month) > -1)
        {
          dictData[month][selectedYears[0]] = item.Profit;
          dictData[month]['value'][selectedYears[0]]= item;
          dictTotals[month] += item.Profit;
          dictForecasts[month] += item.ForecastProfit;

          dictIncome[month]['income'] += item.Income;
          dictIncome[month]['profit'] += item.Profit;

          if(firstnode === 1)
          {
            dictData[month]['yeartodate'] = item.Profit;
            prevalue = item.Profit;
            firstnode = 0;
          } else {
            dictData[month]['yeartodate'] =  prevalue + item.Profit;
            prevalue = dictData[month]['yeartodate'];
          }
        }
      }

    });

    fiscalMonths.forEach(month => {
      data.push(dictData[month]);
      totals.push(dictTotals[month]);
      forecasts.push(dictForecasts[month]);
      income.push(dictIncome[month]);
    });

    this.setState({
      data: data,
      totals: totals,
      forecasts: forecasts,
      colors: colors,
      income: income
    });
  };

  _getColor = (bar) => {
    const { selectedMonths, selectedTopItems } = this.props;

    const year = bar.key;
    const month = bar.bar.data.month;

    const actual = bar.bar.data.value[year] ? bar.bar.data.value[year].Profit : 0;
    const forecast = bar.bar.data.value[year] ? bar.bar.data.value[year].ForecastProfit : 0;

    let activeColor = actual < forecast ? negativeActiveColor : positiveActiveColor;
    let disableColor = actual < forecast ? negativeDisableColor : positiveDisableColor;
    if(actual < 0 )
    {
      activeColor = minusActiveColor;
      disableColor = minusDisableColor;
    }

    if (selectedTopItems.length === 0 && selectedMonths.length === 0) {
      return activeColor;
    }
    if (selectedMonths.indexOf(month) > -1) return activeColor;

    for (let i = 0; i < selectedTopItems.length ; i++) {
      if (selectedTopItems[i].month === month && selectedTopItems[i].year === year) {
        return activeColor;
      }
    }

    return disableColor;
  };

  _handleBar = (event, bar) => {

    const { selectedMonths, selectedTopItems } = this.props;
    const { selectedBars} = this.state;
    const { selectedYears} = this.props;
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
        _selectedTopItems.push({month: month, year: year});
      } else {
        event.target.classList.remove('barActive');
        _selectedBars.splice(index, 1);
        _selectedTopItems.splice(index, 1);
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
      } else {
        _selectedTopItems = [{month: month, year: year}];

        _selectedBars = [event.target];
        event.target.classList.add('barActive');
      }
    }

    let _selectedYearMonth ;
    let _selyear;
    let _month = bar.bar.data.month + 1;
    if(_month >= this.props.defaultStartMonth)
      _selyear = selectedYears[0] - 1;
    else
      _selyear = selectedYears[0];
     _selectedYearMonth = _selyear + (_month>9?_month.toString():("0" + _month.toString())) + "01";

    this.setState({
      selectedBars: _selectedBars,
    });

    this.props.handleFilter({
      selectedTopItems: _selectedTopItems,
      selectedMonths: _selectedMonths ,
      selectedYearMonth: _selectedYearMonth
    });

  };

  _handleLabel = (event, month) => {
    const { selectedMonths, selectedTopItems , selectedYears} = this.props;
    const { selectedBars } = this.state;
    let _selectedMonths, _selectedTopItems, _selectedBars;

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
        _selectedTopItems.push({year:selectedYears[0],month:month});
      } else {
        _selectedMonths.splice(index, 1)
        _selectedTopItems.splice(index, 1)
      }

    } else {
      _selectedBars = [];
      _selectedTopItems = [];

      selectedBars.forEach(selectedBar => {
        selectedBar.classList.remove('barActive');
      });

      if (!isNaN(index) && selectedMonths.length === 1) {
        _selectedMonths = [];
        _selectedTopItems = [];
      } else {
        _selectedMonths = [month];
        _selectedTopItems = [{year:selectedYears[0],month:month}];
      }
    }

    this.setState({
      selectedBars: _selectedBars,
    });


  let _selectedYearMonth ;
  let _selyear;
  let _month = month + 1;
  if(_month >= this.props.defaultStartMonth)
    _selyear = selectedYears[0] - 1;
  else
    _selyear = selectedYears[0];
   _selectedYearMonth = _selyear + (_month>9?_month.toString():("0" + _month.toString())) + "01";

    this.props.handleFilter({
      selectedMonths: _selectedMonths,
      selectedTopItems: _selectedTopItems,
      selectedYearMonth: _selectedYearMonth
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

  _showTooltip = (event, xScale, bar, isBar=true) => {
    if (tooltipTimeout) clearTimeout(tooltipTimeout);

    const { showTooltip, selectedTopItems , data } = this.props;
    let tooltipdata = {}, top, left;

    if (isBar) {
      const { hoverBar } = this.state;
      if (hoverBar) hoverBar.classList.remove('barHover');
      event.target.classList.add('barHover');
      this.setState({hoverBar: event.target});

      top = event.clientY - 120;
      left = event.clientX;
      tooltipdata = bar;
    } else {
      top = event.clientY - 120;
      left = event.clientX;
      tooltipdata['forecast'] = bar;
    }

    tooltipdata['isBar'] = isBar;

    // calculate mtdSum
    let selSum = 0;
    let mtdMonths = 0;

    if(this.state.data && selectedTopItems.length > 1)
      this.state.data.forEach(item => {

        selectedTopItems.forEach(subitem =>{

          if((item.month ) === subitem.month)
          {
            selSum += item[this.props.selectedYears[0]];
            mtdMonths++;
          }
        })
      });

    tooltipdata['selSum'] = selSum;
    tooltipdata['items'] = mtdMonths;

    showTooltip({
      tooltipData: tooltipdata,
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
      classes, selectedYears, selectedMonths,
      tooltipOpen, tooltipTop, tooltipLeft, tooltipData
    } = this.props;
    const { data, totals, forecasts, colors, income } = this.state;

    const width = window.innerWidth - 15;
    const height = (window.innerHeight - 100) / 4;
    const margin = {
      top: 5,
      right: 0,
      bottom: 20,
      left: 80
    };

    const { pageYOffset, xMax, yMax } = getParams(window, width, height, margin);
    const offsetX = 3.5;
    const offsetWidth = - 1.2;
    let minY = Math.min(Math.min(...totals), Math.min(...forecasts));
    minY = Math.min(0 , minY);
    let maxY = Math.max(Math.max(...totals), Math.max(...forecasts));
    maxY = Math.max(0 , maxY);

    // scales
    const xScale = scaleBand({
      domain: data.map(x),
      rangeRound: [0, xMax],
      padding: 0.2
    });
    const yScale = scaleLinear({
      domain: [minY * 1.3, maxY * 1.3 ],
      range: [yMax, 0],
      nice: true
    });

    const color = scaleOrdinal({
      domain: selectedYears,
      range: colors
    });

    let fiscalMonths = getMonths(this.props.defaultStartMonth);
    //let fiscalMonths = getMonths2( this.props.defaultMonth, this.props.defaultStartMonth);
    return (
      <div className={classes.root}>
        <div className="well">
          <Typography variant="h6" className="subtitle mb-10">Actual vs Forecast Profit</Typography>

          <div className="relative">
            <svg width={width} height={height}>
              <rect x={0} y={0} width={width} height={height} fill={'transparent'} onClick={this._deSelectAll} />

              <Group top={margin.top} left={margin.left}>
                <BarStack data={data} keys={selectedYears} x={x} xScale={xScale} yScale={yScale} color={color}>
                  {( barStacks ) => {
                    return barStacks.map(barStack => {
                      return barStack.bars.map(bar => {
                        return (
                          <rect
                            key={`bar-income-${barStack.index}-${bar.index}`}
                            x={bar.x}
                            y={isNaN(bar.height) ? 0: bar.height <= 0?yScale(0):bar.y}
                            height={isNaN(bar.height) ? 0 : bar.height <0 ? bar.y - yScale(0):bar.height}
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

                {income.map((item, index) => {
                  return (
                    <text key={`text-${index}`}
                      x={xScale.paddingInner() * xScale.step()  + index * xScale.step() + offsetX + (xScale.step() -  xScale.paddingInner() * xScale.step() / 2)/2 - 5}
                      fontSize={10} font={'Verdana'}
                    y={yScale(item.profit) >  yScale(0)?(yScale(item.profit) + 10):(yScale(item.profit) - 5) } textAnchor="middle">
                    { (item.income == 0)?'':(Math.round((item.profit / item.income) * 100).toString() + '%')}
                    </text>
                  );
                })}

                {forecasts.map((forecast, index) => {
                  return (
                    <Group key={`bar-forecast-${index}`}>
                      <Bar
                        width={(xMax - xScale.paddingInner() * xScale.step()) / fiscalMonths.length + offsetWidth}
                        height={0.5}
                        x={xScale.paddingInner() * xScale.step() / 2 + index * xScale.step() + offsetX}
                        y={yScale(forecast)}
                        fill={'black'}
                        stroke={"black"}
                        strokeWidth={0.5}
                        onMouseLeave={event => this._hideTooltip()}
                        onMouseMove={event => this._showTooltip(event, xScale, forecast, false)}
                        onTouchEnd={event => this._hideTooltip()}
                        onTouchMove={event => this._showTooltip(event, xScale, forecast, false)}
                      />
                    </Group>
                  );
                })}

                <Bar  width = {xMax}
                      height = {1}
                      y={yScale(0)} />

                <AxisLeft
                  numTicks={4}
                  scale={yScale}
                  stroke="black"

                  tickStroke="black"
                  tickLabelProps={(value, index) => ({
                    fill: 'black',
                    fontSize: 11,
                    textAnchor: 'end',
                    dy: '1.33em',
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
                  fiscalMonths.map((month, index) => {
                    return (
                      <rect
                        key={index}
                        x={xScale.paddingInner() * xScale.step() / 2 + index * xScale.step() + offsetX} y={yMax}
                        width={(xMax - xScale.paddingInner() * xScale.step() / 2 ) / fiscalMonths.length + offsetWidth} height={margin.bottom}
                        fill={selectedMonths.indexOf(month) > -1 ? activeLabelColor : 'transparent'}
                        onClick={(event) => this._handleLabel(event, month)}
                      />
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
                      {enMonths[formattedValue]}
                    </text>
                  )}
                />


              </Group>
            </svg>

            {tooltipOpen && (
              <Tooltip
                top={tooltipTop + pageYOffset}
                left={tooltipLeft}
                style={{padding:'0px', minWidth: 100,
                  backgroundColor: 'white',
                  color: 'black'}}
              >
                {tooltipData.isBar ?

                  <div style={{padding:'0px', margin:'0px' }}>
                    {
                      tooltipData.selSum!= 0?
                        <div className="ft-12" style={{backgroundColor:"#dddddd" , margin:'0px',minHeight:'25px'}}>
                          <div style={{padding:'5px'}}>
                            {tooltipData.items} items selected  SUM(ProfitMTD HistoricalOnly):&nbsp;
                            <strong>{thousandFormat2(tooltipData.selSum)}</strong>
                          </div>
                        </div>
                        :
                        ""
                    }
                    <div style={{margin:'5px'}}>
                      <div className="pdv-10">
                        <strong>FY {tooltipData.key} : {enMonths[x(tooltipData.bar.data)]}</strong>
                      </div>
                      <div className="ft-12">
                        Actual: <strong>{thousandFormat2(tooltipData.bar.data.value[tooltipData.key].Profit)}</strong>
                      </div>
                      <div className="ft-12">
                        Forecast: <strong>{thousandFormat2(tooltipData.bar.data.value[tooltipData.key].ForecastProfit)}</strong>
                      </div>
                      <br />
                      <div className="ft-12">
                        Year to Date: <strong>{thousandFormat2(tooltipData.bar.data["yeartodate"])}</strong>
                      </div>
                    </div>
                  </div>
                  :
                  <div style={{margin:'5px'}}>
                    Sum ProfitMTDForecast HistoricalOnly = {thousandFormat2(tooltipData.forecast)}
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
  handleFilter: PropTypes.func.isRequired
};

export default withStyles(styles)(withTooltip(TopChart));
