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
  getParams, getMonth, thousandFormat2,thousandFormat, getMonths2, getMonths
} from "../../../../Utils/Functions";
import {
  enMonths,
  positiveActiveColor,
  positiveDisableColor,
  negativeActiveColor,
  negativeDisableColor,
  tooltip,
  activeLabelColor
} from "../../../../Assets/js/constant";

import { styles } from './style';

// accessors
const x = d => d.month;
const y = d => d.year;

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
      || prevProps.period !== this.props.period
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
    var { summaryData, selectedYears, period } = this.props;

    let dictData = {};
    let dictTotals = {};
    let dictForecasts = {};
    let data = [];
    let totals = [];
    let forecasts = [];
    let yearData = {};
    let yearForecasts = {};
    let yearTotals = {};

    let colors = selectedYears.reduce((ret, year) => {
      ret.push(positiveActiveColor);
      return ret;
    }, []);

    if(period !== "month")
      selectedYears = selectedYears.sort((a,b) => ( (a - b) ));

    let fiscalMonths = getMonths(this.props.defaultStartMonth);
    let fiscalMonths2 = getMonths2( this.props.defaultMonth, this.props.defaultStartMonth);

    fiscalMonths.forEach(month => {
      dictData[month] = {};
      dictData[month]['month'] = month;
      dictData[month]['value'] = {};

      selectedYears.forEach(year => {
        dictData[month][year] = 0;
      });

      dictTotals[month] = 0;
      dictForecasts[month] = 0;
    });



    if(summaryData["byActual"])
      summaryData["byActual"].forEach(item => {
        let month = getMonth(item.Date);

        if(dictData[month] !== undefined)
        {
          let isInFianical = fiscalMonths2.indexOf(month) > -1;
          //if(fiscalMonths2.indexOf(month) > -1)
          {
            if(isInFianical)
            {
              dictData[month][item.FY] = item.ActualExpenses;
              dictTotals[month] += item.ActualExpenses;
            }
            dictData[month]['value'][item.FY] = item;

            dictForecasts[month] += item.ForecastExpenses;

            if(!yearData[item.FY])
            {
              yearTotals[item.FY] = 0;
              yearForecasts[item.FY] = 0;
              yearData[item.FY] = {};
              yearData[item.FY][item.FY] = 0;
              yearData[item.FY]['year'] =  item.FY;
              yearData[item.FY]["value"] = {};
              yearData[item.FY]["value"][item.FY] = {};
              yearData[item.FY]["value"][item.FY]["ActualExpenses"] = 0;
              yearData[item.FY]["value"][item.FY]["ForecastExpenses"] = 0;
            }
            if(isInFianical)
            {
              yearData[item.FY][item.FY] += item.ActualExpenses;
              yearTotals[item.FY] += item.ActualExpenses;
              yearData[item.FY]["value"][item.FY]["ActualExpenses"] += item.ActualExpenses;
              yearForecasts[item.FY] += item.ForecastExpenses;
              yearData[item.FY]["value"][item.FY]["ForecastExpenses"] += item.ForecastExpenses;
            }


          }
        }

      });

      if(period === "month")
      {
        fiscalMonths.forEach(month => {
          data.push(dictData[month]);
          totals.push(dictTotals[month]);
          forecasts.push(dictForecasts[month]);
        });
      } else {
        selectedYears.forEach(year => {
          data.push(yearData[year]);
          totals.push(yearTotals[year]);
          forecasts.push(yearForecasts[year]);
        });
      }

    this.setState({
      data: data,
      totals: totals,
      forecasts: forecasts,
      colors: colors
    });
  };

  _getColor = (bar) => {
    const { selectedMonths, selectedTopItems } = this.props;

    const year = bar.key;
    const month = bar.bar.data.month;

    const actual = bar.bar.data.value[year] ? bar.bar.data.value[year].ActualExpenses : 0;
    const forecast = bar.bar.data.value[year] ? bar.bar.data.value[year].ForecastExpenses : 0;

    const activeColor = actual > forecast ? negativeActiveColor : positiveActiveColor;
    const disableColor = actual > forecast ? negativeDisableColor : positiveDisableColor;

    if (selectedTopItems.length === 0 && selectedMonths.length === 0) {
      return activeColor;
    }

    if ( month!== undefined && selectedMonths.indexOf(month) > -1) return activeColor;

    for (let i = 0; i < selectedTopItems.length ; i++) {
      if ((selectedTopItems[i].month === month || selectedTopItems[i].month === undefined) && selectedTopItems[i].year === year) {
        return activeColor;
      }
    }


    return disableColor;
  };

  _handleBar = (event, bar) => {
    const { selectedMonths, selectedTopItems,period } = this.props;
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
        _selectedTopItems.push({month: month, year: year});
        if(period == "month")
          _selectedMonths.push(month);
        else
          _selectedMonths.push(year);
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
        if(period == "month")
          _selectedMonths = [month];
        else
          _selectedMonths = [year];

        event.target.classList.add('barActive');
      }
    }

    this.setState({
      selectedBars: _selectedBars,
    });

    this.props.handleFilter({
      selectedTopItems: _selectedTopItems,
      selectedMonths: _selectedMonths
    });
  };

  _handleLabel = (event, month) => {

    const { selectedMonths, selectedTopItems , selectedYears , period} = this.props;
    const { selectedBars } = this.state;
    let _selectedMonths, _selectedTopItems, _selectedBars;
    let _selectedYears = selectedYears.slice();
    const allIndex = _selectedYears.indexOf('All');
    if (allIndex > -1) _selectedYears.splice(allIndex, 1);

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
        if(period === "month")
        {
          _selectedYears.forEach(year=>{
            _selectedTopItems.push({year:year , month:month});
          });
        } else {
            _selectedTopItems.push({year:month , month:undefined});
        }

      } else {
        _selectedMonths.splice(index, 1);
        if(period === "month")
          _selectedTopItems.splice(index, _selectedYears.length);
        else
          _selectedTopItems.splice(index, 1);
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
        if(period === "month")
        {
          _selectedYears.forEach(year=>{
            _selectedTopItems.push({year:year , month:month});
          });
        }
        else {
          _selectedTopItems = [{year:month , month:undefined}];
        }
      }
    }

    this.setState({
      selectedBars: _selectedBars,
      selectedTopItems: _selectedTopItems
    });

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

  _showTooltip = (event, xScale, bar, isBar=true) => {
    if (tooltipTimeout) clearTimeout(tooltipTimeout);

    const { showTooltip, summaryData , selectedTopItems} = this.props;
    let data = {}, top, left;

    if (isBar) {
      const { hoverBar } = this.state;
      if (hoverBar) hoverBar.classList.remove('barHover');
      event.target.classList.add('barHover');
      this.setState({hoverBar: event.target});

      top = event.clientY - 120;
      left = event.clientX;
      data = bar;
    } else {
      top = event.clientY - 120;
      left = event.clientX;
      data['forecast'] = bar;
    }

    data['isBar'] = isBar;

    // calculate mtdSum
    let mtdSum = 0;
    let mtdMonths = 0;
    if(summaryData["byActual"] && selectedTopItems.length > 1)
      summaryData["byActual"].forEach(item => {
        let month = getMonth(item.Date);
        selectedTopItems.forEach(sel =>{
          if(month === sel.month)
          {
            mtdSum += item.ActualExpenses;
            mtdMonths++;
          }
        })
      });

    data['mtdSum'] = mtdSum;
    data['items'] = mtdMonths;

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
    let { data, totals, forecasts, colors } = this.state;

    const width = window.innerWidth - 15;
    const height = (window.innerHeight - 100) / 6;
    const margin = {
      top: 10,
      right: 0,
      bottom: 20,
      left: 80
    };

    const { pageYOffset, xMax, yMax } = getParams(window, width, height, margin);
    const offsetX = 3.5;
    const offsetWidth = - 1.2;

    // scales
    const xScale = scaleBand({
      domain: (period==="month"?data.map(x):data.map(y)),
      rangeRound: [0, xMax],
      padding: 0.2
    });

    const yScale = scaleLinear({
      domain: [0, Math.max(Math.max(...totals), Math.max(...forecasts))],
      range: [yMax, 0],
      nice: true
    });

    const color = scaleOrdinal({
      domain: selectedYears,
      range: colors
    });

    let fiscalMonths = getMonths( this.props.defaultStartMonth);
    let bottomItems = (period==="month"?data.map(x):data.map(y));
    return (
      <div className={classes.root}>
        <div className="well">
          <Typography variant="h6" className="subtitle mb-10">Actual vs Forecast</Typography>

          <div className="relative">
            <svg width={width} height={height}>
              <rect x={0} y={0} width={width} height={height} fill={'transparent'} onClick={this._deSelectAll} />

              <Group top={margin.top} left={margin.left}>
                <BarStack data={data} keys={selectedYears} x={period==="month"?x:y} xScale={xScale} yScale={yScale} color={color}>
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

                {forecasts.map((forecast, index) => {
                  return (
                    <Group key={`bar-forecast-${index}`}>
                      <Bar
                        width={(xMax - xScale.paddingInner() * xScale.step()) / (period==="month"?fiscalMonths.length:selectedYears.length) + offsetWidth}
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
                bottomItems.map((oneItem, index) => {
                    return (
                      <rect
                        key={index}
                        x={xScale.paddingInner() * xScale.step() / 2 + index * xScale.step() + offsetX} y={yMax}
                        width={(xMax - xScale.paddingInner() * xScale.step() / 2 ) / ( period=="month"?bottomItems.length:selectedYears.length) + offsetWidth} height={margin.bottom}
                        fill={selectedMonths.indexOf(oneItem) > -1 ? activeLabelColor : 'transparent'}
                        onClick={(event) => this._handleLabel(event, oneItem)}
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
                      { period==="month"? enMonths[formattedValue] :formattedValue}
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
                      tooltipData.mtdSum>0?
                        <div className="ft-12" style={{backgroundColor:"#dddddd" , margin:'0px',minHeight:'25px'}}>
                          <div style={{padding:'5px'}}>
                            {tooltipData.items} items selected  SUM(ExpenseMTD HistoricalOnly):
                            <strong>{thousandFormat2(tooltipData.mtdSum)}</strong>
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
                        Actual: <strong>{thousandFormat2(tooltipData.bar.data.value[tooltipData.key].ActualExpenses)}</strong>
                      </div>
                      <div className="ft-12">
                        Forecast: <strong>{thousandFormat2(tooltipData.bar.data.value[tooltipData.key].ForecastExpenses)}</strong>
                      </div>
                    </div>
                  </div>
                  :
                  <div style={{margin:'5px'}}>
                    Sum ExpenseMTDForecast HistoricalOnly = {thousandFormat(tooltipData.forecast)}
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

  summaryData: PropTypes.object.isRequired,

  period: PropTypes.string.isRequired,
  selectedYears: PropTypes.array.isRequired,
  selectedMonths: PropTypes.array.isRequired,
  selectedTopItems: PropTypes.array.isRequired,
  defaultStartMonth: PropTypes.number.isRequired,
  defaultMonth: PropTypes.number.isRequired,
  handleFilter: PropTypes.func.isRequired
};

export default withStyles(styles)(withTooltip(TopChart));
