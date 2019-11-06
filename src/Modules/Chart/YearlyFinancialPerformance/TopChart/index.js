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
  getParams, thousandFormat2
} from "../../../../Utils/Functions";
import {
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
const x = d => d.FY;

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
    const { summaryData } = this.props;

    let data = [] , totals = [] , forecasts = [];

    summaryData.forEach(item => {
      data.push(item);
      if(item.Profit !== undefined ) totals.push(item.Profit);
      if(item.ForecastProfit !== undefined) forecasts.push(item.ForecastProfit);
    });

    this.setState({
      data: data,
      totals:totals,
      forecasts:forecasts
    });
  };

  _getColor = (bar) => {
    const { selectedTopItems } = this.props;
    const year = bar.bar.data.FY;

    const actual = bar.bar.data.Profit ? bar.bar.data.Profit : 0;
    const forecast = bar.bar.data.ForecastProfit ? bar.bar.data.ForecastProfit : 0;

    let activeColor = actual < forecast ? negativeActiveColor : positiveActiveColor;
    let disableColor = actual < forecast ? negativeDisableColor : positiveDisableColor;
    if(actual < 0 )
    {
      activeColor = minusActiveColor;
      disableColor = minusDisableColor;
    }

    if (selectedTopItems.length === 0 ) {
      return activeColor;
    }

    for (let i = 0; i < selectedTopItems.length ; i++) {
      if (selectedTopItems[i].year === year) {
        return activeColor;
      }
    }

    return disableColor;
  };

  _handleBar = (event, bar) => {

    const { selectedTopItems , selectedLabels} = this.props;
    const { selectedBars} = this.state;
     let _selectedBars, _selectedTopItems , _selectedLabels;

    const year = bar.bar.data.FY;

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
        _selectedTopItems.push({year: year});
        _selectedLabels.push(year);
      } else {
        event.target.classList.remove('barActive');
        _selectedBars.splice(index, 1);
        _selectedTopItems.splice(index, 1);
        _selectedLabels.splice(index, 1);
      }

    } else {
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
        _selectedTopItems = [{year: year}];
        _selectedLabels = [year];
        _selectedBars = [event.target];
        event.target.classList.add('barActive');
      }
    }

    this.setState({
      selectedBars: _selectedBars,
    });

    this.props.handleFilter({
      selectedLabels:_selectedLabels,
      selectedTopItems: _selectedTopItems
    });

  };

  _handleLabel = (event, year) => {
    const { selectedTopItems , selectedLabels} = this.props;
    const { selectedBars } = this.state;
    let _selectedTopItems, _selectedBars, _selectedLabels = [];

    let index = NaN;
    for (let i = 0; i < selectedTopItems.length; i++) {
      if (selectedTopItems[i].year === year) {
        index = i;
        break;
      }
    }

    if (event.shiftKey) {
      _selectedBars = selectedBars.slice();
      _selectedTopItems = selectedTopItems.slice();
      _selectedLabels = selectedLabels.slice();
      if (isNaN(index)) {
        _selectedTopItems.push({"year":year});
        _selectedLabels.push(year);
      } else {
        _selectedTopItems.splice(index, 1);
        _selectedLabels.splice(index, 1);
      }

    } else {
      _selectedBars = [];
      _selectedTopItems = [];
      _selectedLabels = [];
      selectedBars.forEach(selectedBar => {
        selectedBar.classList.remove('barActive');
      });

      if (!isNaN(index) && _selectedTopItems.length === 1) {
        _selectedTopItems = [];
        _selectedLabels = [];
      } else {
        _selectedTopItems = [{"year":year}];
        _selectedLabels = [year];
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
      selectedTopItems: [],
      selectedLabels: []
    });
  };

  _showTooltip = (event, xScale, bar, isBar=true) => {
    if (tooltipTimeout) clearTimeout(tooltipTimeout);

    const { showTooltip, selectedTopItems } = this.props;
    let data = {}, top, left;

    if (isBar) {
      const { hoverBar } = this.state;
      if (hoverBar) hoverBar.classList.remove('barHover');
      event.target.classList.add('barHover');
      this.setState({hoverBar: event.target});

      top = event.clientY - 230;
      left = event.clientX;
      data = bar;
    } else {
      top = event.clientY - 180;
      left = event.clientX;
      data['forecast'] = bar;

    }

    data['isBar'] = isBar;

    // calculate mtdSum
    let selSum = 0;
    let mtdMonths = 0;

    if(this.state.data && selectedTopItems.length > 1)
      this.state.data.forEach(item => {

        selectedTopItems.forEach(subitem =>{

          if((item.FY ) === subitem.year)
          {
            selSum += item.Profit;
            mtdMonths++;
          }
        })
      });

    data['selSum'] = selSum;
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
      classes, tooltipOpen, tooltipTop, tooltipLeft, tooltipData, selectedLabels
    } = this.props;
    const { data, totals, forecasts } = this.state;

    const width = window.innerWidth - 15;
    const height = (window.innerHeight ) / 4 - 50;
    const margin = {
      top: 10,
      right: 0,
      bottom: 20,
      left: 100
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
      domain: [0/*minY */, maxY  ],
      range: [yMax, 0],
      nice: true
    });

    let keys =  [];
    keys.push("Profit");

    const color = scaleOrdinal({
      domain: keys,
      range: [positiveActiveColor]
    });

    return (
      <div className={classes.root}>
        <div className="well">
          <Typography variant="h6" className="subtitle mb-10">Actual Profit vs Forecast</Typography>

          <div className="relative">
            <svg width={width} height={height}>
              <rect x={0} y={0} width={width} height={height} fill={'transparent'} onClick={this._deSelectAll} />

              <Group top={margin.top} left={margin.left}>
                <BarStack data={data} keys={keys} x={x} xScale={xScale} yScale={yScale} color={color}>
                  {( barStacks ) => {
                    return barStacks.map(barStack => {
                      return barStack.bars.map(bar => {
                        return (
                          <rect
                            key={`bar-income-${barStack.index}-${bar.index}`}
                            x={bar.x}
                            y={isNaN(bar.height) ? 0: bar.y}
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
                        width={(xMax - xScale.paddingInner() * xScale.step()) / forecasts.length + offsetWidth}
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
                  data.map((item, index) => {
                    return (
                      <rect
                        key={index}
                        x={xScale.paddingInner() * xScale.step() / 2 + index * xScale.step() + offsetX} y={yMax}
                        width={(xMax - xScale.paddingInner() * xScale.step() / 2 ) / data.length + offsetWidth} height={margin.bottom}
                        fill={selectedLabels.indexOf(item.FY) > -1 ? activeLabelColor : 'transparent'}
                        onClick={(event) => this._handleLabel(event, item.FY)}
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

                      FY {formattedValue}
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
                        <strong>FY : {(tooltipData.bar.data.FY)}</strong>
                      </div>
                      <div className="ft-12">
                        Actual: <strong>{thousandFormat2(tooltipData.bar.data.Profit)}</strong>
                      </div>
                      <div className="ft-12">
                        Forecast: <strong>{thousandFormat2(tooltipData.bar.data.ForecastProfit)}</strong>
                      </div>
                    </div>

                  </div>
                  :
                  <div>
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
  selectedTopItems: PropTypes.array.isRequired,
  selectedLabels: PropTypes.array.isRequired,
  defaultStartMonth: PropTypes.number.isRequired,
  handleFilter: PropTypes.func.isRequired
};

export default withStyles(styles)(withTooltip(TopChart));
