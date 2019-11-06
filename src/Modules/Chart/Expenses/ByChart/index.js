import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Text } from '@vx/text';
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
  getParams, thousandFormat, isEqualObjList, thousandFormat2
} from "../../../../Utils/Functions";
import {
  positiveActiveColor,
  positiveDisableColor,
  negativeActiveColor,
  negativeDisableColor,
  activeLabelColor,
  tooltip
} from "../../../../Assets/js/constant";

import { styles } from './style';

let tooltipTimeout;

class ByChart extends Component {
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
      colors: []
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
      || !isEqualObjList(prevProps.selectedTopItems, this.props.selectedTopItems)
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
    var { summaryData, selectedYears,selectedTopItems, period } = this.props;

    let dictData = {};
    let dictTotals = {};
    let dictForecasts = {};
    let data = [];
    let totals = [];
    let forecasts = [];

    let colors = selectedYears.reduce((ret, year) => {
      ret.push(positiveActiveColor);
      return ret;
    }, []);

    let printf = require('printf');

    if(summaryData["byType"])
      summaryData["byType"].forEach(item => {
        let isInFilter = false;
        if(selectedTopItems.length === 0)
        {
          isInFilter = true;
        } else {
          selectedTopItems.forEach(topitem=>{
            if(topitem.year === item.FY)
            {
              if(topitem.month === undefined)
              {
                isInFilter = true;
              } else {
                let selYear = topitem.year;
                let selYearMonth = "";
                if(topitem.month >= this.props.defaultStartMonth - 1)
                  selYear -= 1;
                selYearMonth = printf("%d-%02d-01" ,  selYear , topitem.month + 1);

                if(selYearMonth === item.Date)
                {
                  isInFilter = true;
                }
              }
            }

          });
        }
        if(isInFilter && item.AccountType !== "Bonuses" && item.AccountType !== "Other Income" && item.AccountType !== "Extra Ordinary")
        {
          if(!dictData[item.AccountType])
          {
            dictData[item.AccountType] = {};
            dictData[item.AccountType]["data"] = item.AccountType;
            dictData[item.AccountType]["year"] = item.FY;
            dictData[item.AccountType]["ActualExpenses"] = 0;
            dictData[item.AccountType]["ForecastExpenses"] = 0;

            dictTotals[item.AccountType] = 0;
            dictForecasts[item.AccountType] = 0;
          }

          dictData[item.AccountType]["ActualExpenses"] += item.ActualExpenses;
          dictData[item.AccountType]["ForecastExpenses"] += item.ForecastExpenses;

          dictTotals[item.AccountType] += item.ActualExpenses;
          dictForecasts[item.AccountType] += item.ForecastExpenses;
        }
      });

      Object.keys(dictData).map( item => {
          data.push(dictData[item]);
      });

      Object.keys(dictTotals).map( item => {
          totals.push(dictTotals[item]);
      });

      Object.keys(dictForecasts).map( item => {
          forecasts.push(dictForecasts[item]);
      });

    this.setState({
      data: data,
      totals: totals,
      forecasts: forecasts,
      colors: colors
    });
  };

  _getColor = (bar) => {
    const { selectedMiddleItems } = this.props;

    const subtype = bar.bar.data.data;

    const actual = bar.bar.data.ActualExpenses ? bar.bar.data.ActualExpenses : 0;
    const forecast = bar.bar.data.ForecastExpenses ? bar.bar.data.ForecastExpenses : 0;

    const activeColor = actual > forecast ? negativeActiveColor : positiveActiveColor;
    const disableColor = actual > forecast ? negativeDisableColor : positiveDisableColor;

    if (selectedMiddleItems.length === 0 ) {
      return activeColor;
    }

    for (let i = 0; i < selectedMiddleItems.length ; i++) {
      if (selectedMiddleItems[i] === subtype) {
        return activeColor;
      }
    }

    return disableColor;
  };

  _handleBar = (event, bar) => {
    const { selectedMiddleItems } = this.props;
    const { selectedBars } = this.state;

    let _selectedBars, _selectedMiddleItems;

    const subtype = bar.bar.data.data;

    if (event.shiftKey) {
      _selectedBars = selectedBars.slice();
      _selectedMiddleItems = selectedMiddleItems.slice();

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
        _selectedMiddleItems.push(subtype);
      } else {
        event.target.classList.remove('barActive');
        _selectedBars.splice(index, 1);
        _selectedMiddleItems.splice(index, 1);
      }

    } else {

      let exist = false;

      selectedBars.forEach(selectedBar => {
        selectedBar.classList.remove('barActive');
        if (selectedBar === event.target) exist = true;
      });

      if (exist && selectedBars.length === 1) {
        _selectedMiddleItems = [];
        _selectedBars = [];
      } else {
        _selectedMiddleItems = [subtype];
        _selectedBars = [event.target];
        event.target.classList.add('barActive');
      }
    }

    this.setState({
      selectedBars: _selectedBars,
    });

    this.props.handleFilter({
      selectedMiddleItems: _selectedMiddleItems,
    });

  };

  _handleLabel = (event, data) => {
    const { selectedMiddleItems} = this.props;
    const { selectedBars } = this.state;
    let _selectedMiddleItems, _selectedBars;

    let index = NaN;
    for (let i = 0; i < selectedMiddleItems.length; i++) {
      if (selectedMiddleItems[i] === data) {
        index = i;
        break;
      }
    }

    if (event.shiftKey) {
      _selectedBars = selectedBars.slice();
      _selectedMiddleItems = selectedMiddleItems.slice();

      if (isNaN(index)) {
        _selectedMiddleItems.push(data);
      } else {
        _selectedMiddleItems.splice(index, 1)
      }

    } else {
      _selectedBars = [];
      _selectedMiddleItems = [];

      selectedBars.forEach(selectedBar => {
        selectedBar.classList.remove('barActive');
      });

      if (!isNaN(index) && selectedMiddleItems.length === 1) {
        _selectedMiddleItems = [];
      } else {
        _selectedMiddleItems = [data];
      }
    }

    this.setState({
      selectedBars: _selectedBars,
    });

    this.props.handleFilter({
      selectedMiddleItems: _selectedMiddleItems,
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
      selectedMiddleItems: [],
    });
  };

  handlePos = (event) => {
    const {PageOffset} = this.state;
    const _pos = event.currentTarget.getBoundingClientRect().top + window.scrollY;
    if( (PageOffset !== _pos ) && this._isMounted === true)
    {
      this.setState({PageOffset: _pos})
    }
  }

  _showTooltip = (event, xScale, bar, isBar=true) => {
    if (tooltipTimeout) clearTimeout(tooltipTimeout);

    const { showTooltip , selectedMiddleItems, summaryData} = this.props;
    let data = {}, top, left;

    if (isBar) {
      const { hoverBar } = this.state;
      if (hoverBar) hoverBar.classList.remove('barHover');
      event.target.classList.add('barHover');
      this.setState({hoverBar: event.target});
      top = event.pageY - this.state.PageOffset - 100;
      if(event.clientX > window.innerWidth * 2 / 3)
        left = event.clientX - 200;
      else
        left = event.clientX;
      data = bar;
    } else {
      top = event.pageY - this.state.PageOffset - 100;
      left = event.clientX;
      data['forecast'] = bar;
    }

    data['isBar'] = isBar;

    // calculate mtdSum
    let selSum = 0;
    let mtdMonths = 0;

    if(this.state.data && selectedMiddleItems.length > 1)
      this.state.data.forEach(item => {

        selectedMiddleItems.forEach(type =>{
          if(item.data === type)
          {
            selSum += item.ActualExpenses;
            mtdMonths++;
          }
        })
      });

    data['selSum'] = selSum;
    data['items'] = mtdMonths;
    if(selSum > 0 && mtdMonths > 1 && isBar)
      top = event.pageY - this.state.PageOffset - 150;

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
      tooltipOpen, tooltipTop, tooltipLeft, tooltipData,
      selectedMiddleItems
    } = this.props;
    var { data, totals, forecasts, colors } = this.state;

    const width = window.innerWidth - 15;
    const height = (window.innerHeight - 150) / 6;
    const margin = {
      top: 10,
      right: 0,
      bottom: 20,
      left: 80
    };

    const { pageYOffset, xMax, yMax } = getParams(window, width, height, margin);
    const offsetX = 3.5;
    const offsetWidth = - 1.2;

    // accessors
    const x = d => d.data;

    // scales
    const xScale = scaleBand({
      domain:data.map(x),
      rangeRound: [0, xMax],
      padding: 0.2
    });

    let totalmax = Math.max(0,Math.max(...totals), Math.max(...forecasts));
    const yScale = scaleLinear({
      domain: [0, totalmax * 1.2 ],
      range: [yMax , 0],
      nice: true
    });

    const color = scaleOrdinal({
      domain: selectedYears,
      range: colors
    });

    data.sort( (a,b) => (a.data[0] - b.data[0]));
    let keys =  [];
    keys.push("ActualExpenses");

    const sumTotal = totals.reduce((a,b) =>{
        return a + b;
    } , 0);
    var printf = require('printf');

    return (
      <div className={classes.root}
        onMouseMove={event => this.handlePos(event)}
        onTouchMove={event => this.handlePos(event)}
      >
        <div className="well">
          <Typography variant="h6" className="subtitle mb-10">By Type</Typography>

          <div className="relative">
            <svg width={width} height={height}>
              <rect x={0} y={0} width={width} height={height} fill={'transparent'} onClick={this._deSelectAll} />

              <Group top={margin.top} left={margin.left}>
                <BarStack data={data} keys={keys} x={x} xScale={xScale} yScale={yScale} color={color}>
                  {( barStacks ) => {
                    return barStacks.map(barStack => {
                      return barStack.bars.map(bar => {
                        if(bar.height < 0) bar.height = 0;

                        return (
                          <Group key={`bar-income-${barStack.index}-${bar.index}`}>
                            <rect

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

                            <Text
                              x={ bar.x + bar.width / 2 }
                              y={bar.bar.data.ForecastExpenses?(yScale(bar.bar.data.ForecastExpenses) - 3):yScale(0)}
                              verticalAnchor="end"
                              textAnchor="start"
                              fontSize={10}
                              dx={-5}
                              dy={-5}
                            >
                              {  printf( "%2d%%" , Math.round( (bar.bar.data.ActualExpenses/sumTotal) * 100 )) }
                            </Text>

                      </Group>
                        );
                      });
                    });
                  }}
                </BarStack>

                {forecasts.map((forecast, index) => {

                  return (
                    <Group key={`bar-forecast-${index}`}>
                      <Bar
                        width={(xMax - xScale.paddingInner() * xScale.step()) / (forecasts.length) + offsetWidth}
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
                  data.map(x).map((oneItem, index) => {
                    return (
                      <rect
                        key={index}
                        x={xScale.paddingInner() * xScale.step() / 2 + index * xScale.step() + offsetX} y={yMax}
                        width={(xMax - xScale.paddingInner() * xScale.step() / 2 ) / ( data.map(x).length) + offsetWidth} height={margin.bottom}
                        fill={selectedMiddleItems.indexOf(oneItem) > -1 ? activeLabelColor : 'transparent'}
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
                      {...tickProps} fill={selectedMiddleItems.indexOf(formattedValue) > -1 ? 'white' : 'black'}
                      onClick={(event) => this._handleLabel(event, formattedValue)}
                    >
                      {formattedValue}
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
                      tooltipData.selSum>0?
                        <div className="ft-12" style={{backgroundColor:"#dddddd" , margin:'0px',minHeight:'25px'}}>
                          <div style={{padding:'5px'}}>
                            {tooltipData.items} items selected  SUM(ChangeDuringPeriod_HistoricalOnly):&nbsp;
                            <strong>{thousandFormat2(tooltipData.selSum)}</strong>
                          </div>
                        </div>
                        :
                        ""
                    }
                    <div style={{margin:'5px'}}>
                      <div className="pdv-10">
                        <strong>{tooltipData.bar.data.data}</strong>
                      </div>
                      <div className="ft-12">
                        Actual: <strong>${thousandFormat(tooltipData.bar.data.ActualExpenses)}</strong>
                      </div>
                      <div className="ft-12">
                        Forecast: <strong>${thousandFormat(tooltipData.bar.data.ForecastExpenses)}</strong>
                      </div>
                    </div>
                  </div>
                  :
                  <div style={{margin:'5px'}}>
                    Sum ForecastMonth HistoricalOnly = ${thousandFormat(tooltipData.forecast)}
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


ByChart.propTypes = {
  classes: PropTypes.object.isRequired,

  summaryData: PropTypes.object.isRequired,

  period: PropTypes.string.isRequired,
  selectedYears: PropTypes.array.isRequired,
  selectedMonths: PropTypes.array.isRequired,
  selectedTopItems: PropTypes.array.isRequired,
  selectedMiddleItems: PropTypes.array.isRequired,
  defaultStartMonth: PropTypes.number.isRequired,
  handleFilter: PropTypes.func.isRequired
};

export default withStyles(styles)(withTooltip(ByChart));
