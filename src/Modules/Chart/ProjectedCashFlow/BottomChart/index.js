import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import {
  Typography
} from '@material-ui/core'

import {BarStack, LinePath} from '@vx/shape';
import { Group } from '@vx/group';
import { withTooltip, Tooltip } from "@vx/tooltip";
import { AxisLeft, AxisBottom } from '@vx/axis'
import { scaleBand, scaleLinear, scaleOrdinal } from '@vx/scale';

import {
  getParams, getMonth, thousandFormat2,  getMonths2, getMonths, randomColor
} from "../../../../Utils/Functions";
import {
  enMonths,
  positiveActiveColor,
  positiveDisableColor,
  negativeActiveColor,
  negativeDisableColor,
  tooltip,
} from "../../../../Assets/js/constant";

import { styles } from './style';

// accessors
const x = d => d.month;
const y = d => d.value;

let tooltipTimeout;


class BottomChart extends Component {

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
      barKeys: [],
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
      prevProps.bottomData !== this.props.bottomData
      || prevProps.selectedTopItems !== this.props.selectedTopItems
      || prevProps.bottomOffset !== this.props.bottomOffset
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
    const { bottomData, selectedYears } = this.props;
    let dictData = {};
    let dictTotals = {};
    let data = [];
    let totals = [];
    let barKeys = [];
    let colors = [];
    let fiscalMonths = getMonths(this.props.defaultStartMonth);
    let fiscalMonths2 = getMonths2( this.props.defaultMonth, this.props.defaultStartMonth);
    fiscalMonths.forEach(month => {
      dictData[month] = {};
      dictData[month]['month'] = month;
      dictData[month]['value'] = {};
      dictTotals[month] = 0;
    });

    if(bottomData !== undefined)
      bottomData.forEach(item => {
        let month = getMonth(item.Date);

        if(dictData[month][item.AccountName] === undefined)
        {
          dictData[month][item.AccountName] = 0;
        }

        if(dictData[month]['value'][item.AccountName] === undefined)
        {
          dictData[month]['value'][item.AccountName] = 0;
        }
        dictData[month][item.AccountName] += item.DistributionAmount;
        dictData[month]['value'][item.AccountName] += item.DistributionAmount;
        dictTotals[month] += item.DistributionAmount;
        if(barKeys.indexOf(item.AccountName) == -1)
        {
          barKeys.push(item.AccountName);
          //colors.push(randomColor());
        }
      });
    colors = ['#c3c3c3','#8c564b','#9467bd','#d62728','#2ca02c','#ff7f0e','#39CCCC','#001f3f','#01FF70','#FFDC00','#FF851B','#85144b','#F012BE'];
    fiscalMonths.forEach(month => {
      data.push(dictData[month]);
      totals.push(dictTotals[month]);
    });

    this.setState({
      data: data,
      totals: totals,
      colors: colors,
      barKeys: barKeys
    });
  };

  _getColor = (bar) => {
    const { selectedBottomItems } = this.props;

    const year = bar.key;
    const month = bar.bar.data.month;

    const actual = bar.bar.data.value[year] ? bar.bar.data.value[year].CashBalance : 0;

    const activeColor = actual < 0 ? negativeActiveColor : positiveActiveColor;
    const disableColor = actual < 0 ? negativeDisableColor : positiveDisableColor;

    if (selectedBottomItems.length === 0) {
      return activeColor;
    }
    if (selectedBottomItems.indexOf(month) > -1) return activeColor;

    for (let i = 0; i < selectedBottomItems.length ; i++) {
      if (selectedBottomItems[i].month === month && selectedBottomItems[i].year === year) {
        return activeColor;
      }
    }

    return disableColor;
  };

  _handleBar = (event, bar) => {
    const { selectedBottomItems , cashflowMiddleRequest} = this.props;
    const { selectedBars} = this.state;

    let _selectedBars, _selectedBottomItems;

    const month = bar.bar.data.month;

    if (event.shiftKey) {
      _selectedBars = selectedBars.slice();
      _selectedBottomItems = selectedBottomItems.slice();

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
        _selectedBottomItems.push({month: month});
      } else {
        event.target.classList.remove('barActive');
        _selectedBars.splice(index, 1);
        _selectedBottomItems.splice(index, 1);
      }

    } else {
      _selectedBottomItems = [];
      let exist = false;

      selectedBars.forEach(selectedBar => {
        selectedBar.classList.remove('barActive');
        if (selectedBar === event.target) exist = true;
      });

      if (exist && selectedBars.length === 1) {
        _selectedBottomItems = [];
        _selectedBars = [];
      } else {
        _selectedBottomItems = [{month: month}];
        _selectedBars = [event.target];
        event.target.classList.add('barActive');
      }
    }


    this.setState({
      selectedBars: _selectedBars,
    });

    this.props.updateFilter({
      selectedBottomItems: _selectedBottomItems,
      selectedTopItems : [],
    });

  };

  _handleLabel = (event, month) => {
    const { selectedBottomItems } = this.props;
    const { selectedBars } = this.state;
    let _selectedBottomItems, _selectedBars;

    let index = NaN;
    for (let i = 0; i < selectedBottomItems.length; i++) {
      if (selectedBottomItems[i] === month) {
        index = i;
        break;
      }
    }

    if (event.shiftKey) {
      _selectedBars = selectedBars.slice();
      _selectedBottomItems = selectedBottomItems.slice();

      if (isNaN(index)) {
        _selectedBottomItems.push(month);
      } else {
        _selectedBottomItems.splice(index, 1)
      }

    } else {
      _selectedBars = [];
      _selectedBottomItems = [];

      selectedBars.forEach(selectedBar => {
        selectedBar.classList.remove('barActive');
      });

      if (!isNaN(index) && selectedBottomItems.length === 1) {
        _selectedBottomItems = [];
      } else {
        _selectedBottomItems = [month];
      }
    }

    this.setState({
      selectedBars: _selectedBars,
    });

    this.props.updateFilter({
      selectedBottomItems: _selectedBottomItems,
      selectedTopItems: [],
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

    this.props.updateFilter({
      selectedBottomItems: [],

    });
  };

  _showTooltip = (event, xScale, bar, isBar=true) => {
    if (tooltipTimeout) clearTimeout(tooltipTimeout);

    const { showTooltip, bottomOffset } = this.props;
    let data = {}, top, left;

    if (isBar) {
      const { hoverBar } = this.state;
      if (hoverBar) hoverBar.classList.remove('barHover');
      event.target.classList.add('barHover');
      this.setState({hoverBar: event.target});

      top =  event.clientY - bottomOffset - 100;
      left = event.clientX;
      data = bar;
    } else {
      top =  event.clientY - bottomOffset - 100;
      left = event.clientX;
      data['forecast'] = bar;
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
      classes, selectedYears, selectedBottomItems,
      tooltipOpen, tooltipTop, tooltipLeft, tooltipData

    } = this.props;

    let { data, totals, colors , barKeys } = this.state;

    const width = window.innerWidth - 15;
    const height = 200;
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
      domain: data.map(x),
      rangeRound: [0, xMax],
      padding: 0.2
    });
    const yScale = scaleLinear({
      domain: totals.length===0?[0,0]:[Math.min(Math.min(...totals)), Math.max(Math.max(...totals))],
      range: [yMax, 0],
      nice: true
    });

    const color = scaleOrdinal({
      domain: barKeys,
      range: colors
    });

    let line_data = [];
    line_data.push({'x':0,'y':yScale(0)});
    line_data.push({'x':xMax,'y':yScale(0)});

    const x1 = d => d.value;
    const xScale1 = scaleBand({
      domain: data.map(x1),
      rangeRound: [0, xMax],
      padding: 0.2
    });

    return (
      <div className={classes.root}
           id ="rootPos"
        >
        <div className="well" >
          <Typography variant="h6" className="subtitle mb-10">Distributions</Typography>

          <div className="relative">
            <svg width={width} height={height}>
              <rect x={0} y={0} width={width} height={height} fill={'transparent'} onClick={this._deSelectAll} />

              <Group top={margin.top} left={margin.left}>
                <LinePath
                  data={line_data}
                  x={nx=> nx.x}
                  y={nx=> nx.y}
                  stroke={"#555555"}
                  strokeDasharray="2,2"
                />

                <BarStack data={data} keys={barKeys} x={x} xScale={xScale} yScale={yScale} color={color}>
                  {( barStacks ) => {
                    return barStacks.map(barStack => {
                      return barStack.bars.map(bar => {

                       if(isNaN(bar.height))
                       {
                         bar.y = 0;
                         bar.height = 0;
                       } else {
                         if(bar.height < 0)
                         {
                          // if(bar.y < 0)
                          //  bar.height = -bar.y + yScale(0);
                           //else
                           if(bar.y  <  yScale(0))
                             bar.height = - bar.y + yScale(0);
                           else
                            bar.height = bar.y - yScale(0);


                           bar.y = yScale(0);

                         } else {

                         }
                       }
                        return (
                          <rect
                            key={`bar-income-${barStack.index}-${bar.index}`}
                            x={bar.x}
                            y={bar.y}
                            height={bar.height}
                            width={bar.width}
                            fill={bar.color/*this._getColor(bar)*/}
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
                  numTicks={3}
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

              {/*
                  fMonths.map((month, index) => {
                    return (
                      <rect
                        key={index}
                        x={xScale.paddingInner() * xScale.step() / 2 + index * xScale.step() + offsetX} y={yMax}
                        width={(xMax - xScale.paddingInner() * xScale.step() / 2 ) / ( period=="month"?12:selectedYears.length) + offsetWidth} height={margin.bottom}
                        fill={selectedBottomItems.indexOf(month) > -1 ? activeLabelColor : 'transparent'}
                        onClick={(event) => this._handleLabel(event, month)}
                      />
                    )
                  })*/
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
                      {...tickProps} fill={selectedBottomItems.indexOf(formattedValue) > -1 ? 'green' : 'black'}
                      onClick={(event) => this._handleLabel(event, formattedValue)}
                    >
                      { enMonths[formattedValue]}
                    </text>
                  )}
                />

              </Group>
            </svg>

            {tooltipOpen && (
              <Tooltip
                top={tooltipTop + pageYOffset}
                left={tooltipLeft}
                style={tooltip} >
                {tooltipData.isBar ?
                  <div>
                    <div className="pdv-10">
                      <strong>FY {tooltipData.key} : {enMonths[x(tooltipData.bar.data)]}</strong>
                    </div>
                    <div className="pdv-10">
                      <strong>Actual: {thousandFormat2(tooltipData.bar.data.value[tooltipData.key])}</strong>
                    </div>
                   </div>
                  :
                  <div>

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


BottomChart.propTypes = {
  classes: PropTypes.object.isRequired,

  bottomData: PropTypes.array.isRequired,
  selectedYears: PropTypes.array.isRequired,
  selectedTopItems: PropTypes.array.isRequired,
  selectedBottomItems: PropTypes.array.isRequired,
  updateFilter: PropTypes.func.isRequired,
  bottomOffset: PropTypes.number.isRequired,
  cashflowMiddleRequest: PropTypes.func.isRequired,
  defaultStartMonth: PropTypes.number.isRequired,
};

export default withStyles(styles)(withTooltip(BottomChart));
