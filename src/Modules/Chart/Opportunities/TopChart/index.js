import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import {
  Typography
} from '@material-ui/core'

import { BarStack, Bar , LinePath} from '@vx/shape';
import { Group } from '@vx/group';
import { withTooltip, Tooltip } from "@vx/tooltip";
import { AxisLeft, AxisBottom } from '@vx/axis'
import { scaleBand, scaleLinear, scaleOrdinal } from '@vx/scale';

import {
  getParams, getMonth, thousandFormat2, getMonths2, getMonths
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
    var { summaryData, selectedYears } = this.props;

    let dictData = {};
    let dictTotal = {};
    let data = [];
    let totals = [];

    let colors = selectedYears.reduce((ret, year) => {
      ret.push(positiveActiveColor);
      return ret;
    }, []);


    let fiscalMonths = getMonths(this.props.defaultStartMonth);
    let fiscalMonths2 = getMonths2( this.props.defaultMonth, this.props.defaultStartMonth);

    fiscalMonths.forEach(month => {
      dictData[month] = {};
      dictData[month]['month'] = month;
      dictData[month]['Converted'] = 0;
      dictData[month]['Open'] = 0;
      dictData[month]['Lost'] = 0;
      dictTotal[month] = 0;
    });


    if(summaryData && summaryData['Left'])
      summaryData['Left'].forEach(item => {
        let month = getMonth(item.Date);

        if(dictData[month] !== undefined)
        {
          if(fiscalMonths2.indexOf(month) > -1)
          {
            if(dictData[month][item.Status] !== undefined)
            {
              dictData[month][item.Status] += item.Hours;
            }
            dictTotal[month] += item.Hours;
          }
        }
      });

      fiscalMonths.forEach(month => {
          data.push(dictData[month]);
          totals.push(dictTotal[month]);
      });

    this.setState({
      data: data,
      totals: totals,
      colors: colors
    });
  };

  _getColor = (bar) => {
    const { selectedTopLeftLabels, selectedTopLeftItems } = this.props;
    const key = bar.key;
    const month = bar.bar.data.month;
    var activeColor = 0;
    var disableColor = 0;

    if(key === "Open")
    {
      activeColor = '#919698';
      disableColor = '#e1e2e2';
    }
    else if(key === "Converted")
    {
      activeColor = '#8dc63f';
      disableColor = '#e0ebd2';
    }
    else if(key === "Lost")
    {
      activeColor = '#be1e2d';
      disableColor = '#e9cccf';
    } else {
      activeColor = '#e1e1e1';
      disableColor = '#e1e1e1';
    }

    if (selectedTopLeftItems.length === 0 && selectedTopLeftLabels.length === 0) {
      return activeColor;
    }
    if (selectedTopLeftLabels.indexOf(month) > -1)
    {
      return activeColor;
    }

    for (let i = 0; i < selectedTopLeftItems.length ; i++) {
      if (selectedTopLeftItems[i].month === month)
        {
          return activeColor;
        }
    }

    return disableColor;
  };

  _handleBar = (event, bar) => {
    const { selectedTopLeftLabels, selectedTopLeftItems } = this.props;
    const { selectedBars } = this.state;

    let _selectedBars, _selectedTopLeftLabels, _selectedTopLeftItems;

    const month = bar.bar.data.month;

    if (event.shiftKey) {
      _selectedBars = selectedBars.slice();
      _selectedTopLeftItems = selectedTopLeftItems.slice();
      _selectedTopLeftLabels = selectedTopLeftLabels.slice();

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
        _selectedTopLeftItems.push({month: month});
      } else {
        event.target.classList.remove('barActive');
        _selectedBars.splice(index, 1);
        _selectedTopLeftItems.splice(index, 1);
      }

    } else {
      _selectedTopLeftLabels = [];
      let exist = false;

      selectedBars.forEach(selectedBar => {
        selectedBar.classList.remove('barActive');
        if (selectedBar === event.target) exist = true;
      });

      if (exist && selectedBars.length === 1) {
        _selectedTopLeftItems = [];
        _selectedBars = [];
      } else {
        _selectedTopLeftItems = [{month: month}];
        _selectedBars = [event.target];
        event.target.classList.add('barActive');
      }
    }

    this.setState({
      selectedBars: _selectedBars,
    });

    this.props.handleFilter({
      selectedTopLeftItems: _selectedTopLeftItems,
      selectedTopLeftLabels: _selectedTopLeftLabels
    });
  };

  _handleLabel = (event, month) => {
    const { selectedTopLeftLabels, selectedTopLeftItems } = this.props;
    const { selectedBars } = this.state;
    let _selectedTopLeftLabels, _selectedTopLeftItems, _selectedBars;

    let index = NaN;
    for (let i = 0; i < selectedTopLeftLabels.length; i++) {
      if (selectedTopLeftLabels[i] === month) {
        index = i;
        break;
      }
    }

    if (event.shiftKey) {
      _selectedBars = selectedBars.slice();
      _selectedTopLeftLabels = selectedTopLeftLabels.slice();
      _selectedTopLeftItems = selectedTopLeftItems.slice();

      if (isNaN(index)) {
        _selectedTopLeftLabels.push(month);
        _selectedTopLeftItems.push({month:month});
      } else {
        _selectedTopLeftLabels.splice(index, 1);
        _selectedTopLeftItems.splice(index, 1);
      }

    } else {
      _selectedBars = [];
      _selectedTopLeftItems = [];

      selectedBars.forEach(selectedBar => {
        selectedBar.classList.remove('barActive');
      });

      if (!isNaN(index) && selectedTopLeftLabels.length === 1) {
        _selectedTopLeftLabels = [];
        _selectedTopLeftItems = [];
      } else {
        _selectedTopLeftLabels = [month];
        _selectedTopLeftItems.push({month:month});
      }
    }

    this.setState({
      selectedBars: _selectedBars,
    });


    this.props.handleFilter({
      selectedTopLeftLabels: _selectedTopLeftLabels,
      selectedTopLeftItems: _selectedTopLeftItems,
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
      selectedTopLeftLabels: [],
      selectedTopLeftItems: [],
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
      classes, selectedYears, selectedTopLeftLabels,
      tooltipOpen, tooltipTop, tooltipLeft, tooltipData

    } = this.props;
    let { data, totals, colors } = this.state;

    const width = window.innerWidth * 7 / 12 - 15;
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
      domain: (data.map(x)),
      rangeRound: [0, xMax],
      padding: 0.2
    });
    const yScale = scaleLinear({
      domain: [Math.min(0, Math.min(...totals)  * 1.5 ), Math.max(...totals) * 1.5],
      range: [yMax, 0],
      nice: true
    });

    const color = scaleOrdinal({
      domain: selectedYears,
      range: colors
    });

    let fiscalMonths = getMonths( this.props.defaultStartMonth);
    let monthKeys = [];
    monthKeys.push("Loss");
    monthKeys.push("Converted");
    monthKeys.push("Open");

    let line_data = [];
    line_data.push({'x':0,'y':isNaN(yScale(0))?0:yScale(0)});
    line_data.push({'x':xMax,'y':isNaN(yScale(0))?0:yScale(0)});

    let posBase = [] , negBase = [];
    data.forEach( (i , key) => {
      posBase[key] = isNaN(yScale(0))?0:yScale(0);
      negBase[key] = isNaN(yScale(0))?0:yScale(0);
    });

    return (
      <div className={classes.root}>
        <div className="well">
          <strong>Hours Spent</strong>
          <div className="relative">
            <svg width={width} height={height}>
              <rect x={0} y={0} width={width} height={height} fill={'transparent'} onClick={this._deSelectAll} />

              <Group top={margin.top} left={margin.left}>
                <BarStack data={data} keys={monthKeys} x={x} xScale={xScale} yScale={yScale} color={color}>
                  {( barStacks ) => {

                    return barStacks.map(barStack => {
                      return barStack.bars.map(bar => {

                        let y0 = 0, h0 = 0;
                        if(bar.height < 0)
                        {
                          h0 = Math.abs(isNaN(bar.height)?0:bar.height);
                          y0 = negBase[bar.index];
                          negBase[bar.index] -= isNaN(bar.height)?0:bar.height;

                        } else {
                          h0 = isNaN(bar.height)?0:bar.height;
                          posBase[bar.index] -= isNaN(bar.height)?0:bar.height;
                          y0 = posBase[bar.index];
                        }

                        return (
                          <rect
                            key={`bar-income-${barStack.index}-${bar.index}`}
                            x={bar.x}
                            y={y0}
                            height={h0}
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

                <LinePath
                  data={line_data}
                  x={nx=> nx.x}
                  y={nx=> nx.y}
                  stroke={"#555555"}
                  strokeDasharray="2,2"
                />

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

              {
                fiscalMonths.map((month, index) => {
                    return (
                      <rect
                        key={index}
                        x={xScale.paddingInner() * xScale.step() / 2 + index * xScale.step() + offsetX} y={yMax}
                        width={(xMax - xScale.paddingInner() * xScale.step() / 2 ) / ( fiscalMonths.length) + offsetWidth} height={margin.bottom}
                        fill={selectedTopLeftLabels.indexOf(month) > -1 ? activeLabelColor : 'transparent'}
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
                      {...tickProps} fill={selectedTopLeftLabels.indexOf(formattedValue) > -1 ? 'white' : 'black'}
                      onClick={(event) => this._handleLabel(event, formattedValue)}
                    >
                      { enMonths[formattedValue] }
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
                    <div className="ft-12">
                      <strong>Hours:{(tooltipData.bar.data[tooltipData.key])}</strong>
                    </div>
                  </div>
                  :
                  <div>

                  </div>
                }
              </Tooltip>
            )}

          </div>
          { // selected types and colors
            <div>
              <svg height={20} width={xMax}>
                  <Group  top={0} left={0}>
                    <rect
                      x={0} y={0}
                      width={12}
                      height={12}
                      fill={'#8dc63f'}
                    />
                    <text x={14} y={12} fontSize={12}>
                      Converted
                    </text>
                  </Group>
                  <Group  top={0} left={0}>
                    <rect
                      x={100} y={0}
                      width={12}
                      height={12}
                      fill={'#919698'}
                    />
                  <text x={114} y={12} fontSize={12}>
                      Open
                    </text>
                  </Group>
                  <Group  top={0} left={0}>
                    <rect
                      x={200} y={0}
                      width={12}
                      height={12}
                      fill={'#be1e2d'}
                    />
                  <text x={214} y={12} fontSize={12}>
                      Lost
                    </text>
                  </Group>
              </svg>
            </div>
          }
        </div>
      </div>
    );
  }

}


TopChart.propTypes = {
  classes: PropTypes.object.isRequired,

  summaryData: PropTypes.object.isRequired,
  selectedYears: PropTypes.array.isRequired,
  selectedTopLeftLabels: PropTypes.array.isRequired,
  selectedTopLeftItems: PropTypes.array.isRequired,
  defaultStartMonth: PropTypes.number.isRequired,
  defaultMonth: PropTypes.number.isRequired,
  handleFilter: PropTypes.func.isRequired
};

export default withStyles(styles)(withTooltip(TopChart));
