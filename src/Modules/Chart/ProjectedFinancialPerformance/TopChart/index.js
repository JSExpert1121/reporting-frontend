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
  getParams, getMonths, thousandFormat2, convertMonth, getMonths2, financialMonth, getFinancialIndex
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
      budgets: [],
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
    let dictBudgets = {};
    let data = [];
    let totals = [];
    let budgets = [];

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
      dictData[month]['future'] = false;
      selectedYears.forEach(year => {
        dictData[month][year] = 0;
      });

      dictTotals[month] = 0;
      dictBudgets[month] = 0;

    });

    summaryData.forEach(item => {
      let month = convertMonth(item.MonthName);

      if(dictData[month] !== undefined)
      {
        //if(fiscalMonths2.indexOf(month) > -1)
        {
          let defIndex= getFinancialIndex(month + 1, this.props.defaultStartMonth);

          if(this.props.defaultYear >= selectedYears[0] &&
            defIndex >= this.props.defaultMonth)
          {
            dictData[month][selectedYears[0]] = item.ForecastProfit;
            dictData[month]['future'] = true;
          } else {
            dictData[month][selectedYears[0]] = item.ActualProfit;
          }
          dictData[month]['value'][selectedYears[0]]= item;
          dictTotals[month] += dictData[month][selectedYears[0]];
          dictBudgets[month] += item.BudgetProfit;
        }
      }

    });

    fiscalMonths.forEach(month => {
      data.push(dictData[month]);
      totals.push(dictTotals[month]);
      budgets.push(dictBudgets[month]);
    });

    this.setState({
      data: data,
      totals: totals,
      budgets: budgets,
      colors: colors
    });
  };

  _getColor = (bar) => {
    const { selectedLabels, selectedTopItems } = this.props;

    const year = bar.key;
    const month = bar.bar.data.month;

    const actual = bar.bar.data.value[year] ? bar.bar.data.value[year].ActualProfit : 0;
    const budget = bar.bar.data.value[year] ? bar.bar.data.value[year].BudgetProfit : 0;

    let activeColor = actual < budget ? negativeActiveColor : positiveActiveColor;
    let disableColor = actual < budget ? negativeDisableColor : positiveDisableColor;
    if(actual < 0 )
    {
      activeColor = minusActiveColor;
      disableColor = minusDisableColor;
    }

    if (selectedTopItems.length === 0 && selectedLabels.length === 0) {
      return activeColor;
    }
    if (selectedLabels.indexOf(month) > -1) return activeColor;

    for (let i = 0; i < selectedTopItems.length ; i++) {
      if (selectedTopItems[i].month === month && selectedTopItems[i].year === year) {
        return activeColor;
      }
    }

    return disableColor;
  };

  _handleBar = (event, bar) => {

    const { selectedLabels, selectedTopItems } = this.props;
    const { selectedBars} = this.state;
    const { selectedYears} = this.props;
    let _selectedBars, _selectedLabels, _selectedTopItems;

    const month = bar.bar.data.month;
    const year = bar.key;

    if (event.shiftKey) {
      _selectedBars = selectedBars.slice();
      _selectedTopItems = selectedTopItems.slice();
      _selectedLabels = selectedLabels.slice();

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
        _selectedLabels.push(month);
      } else {
        event.target.classList.remove('barActive');
        _selectedBars.splice(index, 1);
        _selectedTopItems.splice(index, 1);
        _selectedLabels.splice(index, 1);
      }

    } else {
      _selectedLabels = [];
      let exist = false;

      selectedBars.forEach(selectedBar => {
        selectedBar.classList.remove('barActive');
        if (selectedBar === event.target) exist = true;
      });

      if (exist && selectedBars.length === 1) {
        _selectedTopItems = [];
        _selectedBars = [];
        _selectedLabels = [];
      } else {
        _selectedTopItems = [{month: month, year: year}];
        _selectedLabels = [month];
        _selectedBars = [event.target];
        event.target.classList.add('barActive');
      }
    }


    this.setState({
      selectedBars: _selectedBars,
    });

    this.props.handleFilter({
      selectedTopItems: _selectedTopItems,
      selectedLabels: _selectedLabels
    });

  };

  _handleLabel = (event, month) => {
    const { selectedLabels, selectedTopItems , selectedYears } = this.props;
    const { selectedBars } = this.state;
    let _selectedMonths, _selectedTopItems, _selectedBars;

    let index = NaN;
    for (let i = 0; i < selectedLabels.length; i++) {
      if (selectedLabels[i] === month) {
        index = i;
        break;
      }
    }

    if (event.shiftKey) {
      _selectedBars = selectedBars.slice();
      _selectedMonths = selectedLabels.slice();
      _selectedTopItems = selectedTopItems.slice();

      if (isNaN(index)) {
        _selectedMonths.push(month);
        _selectedTopItems.push({month: month, year: selectedYears[0]});

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

      if (!isNaN(index) && selectedLabels.length === 1) {
        _selectedMonths = [];
        _selectedTopItems = [];
      } else {
        _selectedMonths = [month];
        _selectedTopItems.push({month: month, year: selectedYears[0]});
      }
    }

    this.setState({
      selectedBars: _selectedBars,
    });

    this.props.handleFilter({
      selectedLabels: _selectedMonths,
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
      selectedLabels: [],
      selectedTopItems: [],
    });
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

      top = event.clientY - 120;
      left = event.clientX;
      data = bar;
    } else {
      top = event.clientY - 120;
      left = event.clientX;
      data['budget'] = bar;
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
      classes, selectedYears, selectedLabels,
      tooltipOpen, tooltipTop, tooltipLeft, tooltipData
    } = this.props;
    const { data, totals, budgets, colors } = this.state;

    const width = window.innerWidth - 15;
    const height = 300;
    const margin = {
      top: 10,
      right: 0,
      bottom: 20,
      left: 80
    };

    const { pageYOffset, xMax, yMax } = getParams(window, width, height, margin);
    const offsetX = 3.5;
    const offsetWidth = - 1.2;
    let minY = Math.min(Math.min(...totals), Math.min(...budgets));
    minY = Math.min(0 , minY);
    let maxY = Math.max(Math.max(...totals), Math.max(...budgets));
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

    let fiscalMonths = getMonths(this.props.defaultStartMonth);
    //let fiscalMonths = getMonths2( this.props.defaultMonth, this.props.defaultStartMonth);

    let futureLabelx , futureWidth , futureX;
    let pastLabelx , pastWidth ;
    if(this.props.defaultYear < selectedYears[0])
    {
      futureLabelx = width / 2;
      futureWidth = width;
      futureX = 0;
    }
    else if(this.props.defaultYear === selectedYears[0])
    {
      futureLabelx = xScale.step() * (this.props.defaultMonth ) + (width  - xScale.step() * (this.props.defaultMonth )) / 2;
      pastLabelx = xScale.step() * (this.props.defaultMonth ) / 2;

      futureX = xScale.paddingInner() * xScale.step() / 2 + this.props.defaultMonth * xScale.step() + offsetX;

      futureWidth = width;
      pastWidth = (xScale.paddingInner() * xScale.step() / 2 + this.props.defaultMonth * xScale.step() + offsetX);

    } else {
      pastLabelx = width / 2;
      pastWidth = width;

    }

    if(isNaN(futureLabelx)) futureLabelx = 0;
    if(isNaN(pastLabelx)) pastLabelx = 0;
    return (
      <div className={classes.root}>
        <div className="well">
          <Typography variant="h6" className="subtitle mb-10">Actual vs Forecast Profit</Typography>

          <div className="relative">
            <svg width={width} height={height}>

              <Group top={margin.top} left={margin.left}>
                {
                  selectedYears[0] >= this.props.defaultYear?
                    <Group>
                      <Bar
                        width={futureWidth}
                        height={height}
                        x={futureX}
                        y={0}
                        fill={selectedYears[0]===this.props.defaultYear?'#f3f3f3':'#ffffff'}
                        stroke={"black"}
                        strokeWidth={0.5}
                      />

                      <text
                        fill={'black'} dx={futureLabelx} dy = {12} fontSize={12}
                      >
                        Future
                      </text>
                    </Group>
                    :
                    ""
                }
                {
                  selectedYears[0] <= this.props.defaultYear?
                    <Group>
                      <Bar
                        width={pastWidth}
                        height={height}
                        x={0}
                        y={0}
                        fill={selectedYears[0]===this.props.defaultYear?'#ffffff':'#ffffff'}
                        stroke={"black"}
                        strokeWidth={0.5}
                      />
                      <text
                        fill={'black'} dx={pastLabelx} dy={12} fontSize={12}
                      >
                      Past
                    </text>
                    </Group>
                    :
                    ""
                }

                <rect
                  x={0} y={0} width={width} height={height} fill={'transparent'} onClick={this._deSelectAll} />

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

                {/*totals.map((totals, index) => {
                  return (
                    <text x={xScale.paddingInner() * xScale.step() * 2  + index * xScale.step() + offsetX}
                    y={  yScale(totals) >  yScale(0)?(yScale(totals) - 10):(yScale(totals) + 10) }>  12%
                    </text>
                  );
                })*/}

                {budgets.map((budget, index) => {
                  return (
                    <Group key={`bar-forecast-${index}`}>
                      <Bar
                        width={(xMax - xScale.paddingInner() * xScale.step()) / fiscalMonths.length + offsetWidth}
                        height={0.5}
                        x={xScale.paddingInner() * xScale.step() / 2 + index * xScale.step() + offsetX}
                        y={yScale(budget)}
                        fill={'black'}
                        stroke={"black"}
                        strokeWidth={0.5}
                        onMouseLeave={event => this._hideTooltip()}
                        onMouseMove={event => this._showTooltip(event, xScale, budget, false)}
                        onTouchEnd={event => this._hideTooltip()}
                        onTouchMove={event => this._showTooltip(event, xScale, budget, false)}
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
                        fill={selectedLabels.indexOf(month) > -1 ? activeLabelColor : 'transparent'}
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
                      {...tickProps} fill={selectedLabels.indexOf(formattedValue) > -1 ? 'white' : 'black'}
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
                style={tooltip}
              >
                {tooltipData.isBar ?
                  <div>
                    <div className="pdv-10">
                      <strong>FY {tooltipData.key} : {enMonths[x(tooltipData.bar.data)]}</strong>
                    </div>

                    {
                      tooltipData.bar.data.future?
                      <div className="ft-12">
                        Forecast: <strong>{thousandFormat2(tooltipData.bar.data.value[tooltipData.key].ForecastProfit)}</strong>
                      </div>
                      :
                      <div className="ft-12">
                        Actual: <strong>{thousandFormat2(tooltipData.bar.data.value[tooltipData.key].ActualProfit)}</strong>
                      </div>
                    }
                    <div className="ft-12">
                      Budget: <strong>{thousandFormat2(tooltipData.bar.data.value[tooltipData.key].BudgetProfit)}</strong>
                    </div>
                    <br />

                  </div>
                  :
                  <div>
                    Sum Profit MTD Budget HistoricalOnly = {thousandFormat2(tooltipData.budget)}
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
  selectedLabels: PropTypes.array.isRequired,
  selectedTopItems: PropTypes.array.isRequired,
  defaultStartMonth: PropTypes.number.isRequired,
  defaultMonth: PropTypes.number.isRequired,
  defaultYear: PropTypes.number.isRequired,
  handleFilter: PropTypes.func.isRequired
};

export default withStyles(styles)(withTooltip(TopChart));
