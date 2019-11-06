import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import {
  Typography, FormControl,
  NativeSelect
} from '@material-ui/core'

import { BarStack, Bar ,Line} from '@vx/shape';
import { Group } from '@vx/group';
import { withTooltip, Tooltip } from "@vx/tooltip";
import { AxisLeft, AxisBottom } from '@vx/axis'
import { scaleBand, scaleLinear, scaleOrdinal } from '@vx/scale';
import YearSelector from "../../../../Common/Selectors/YearSelectorSingle";

import {
  getParams, thousandFormat, thousandFormat2
} from "../../../../Utils/Functions";
import {
  positiveActiveColor,
  positiveDisableColor,
  minusActiveColor,
  minusDisableColor,
  tooltip
} from "../../../../Assets/js/constant";

import { styles } from './style';

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
    };

    this._prepareData = this._prepareData.bind(this);
    this._handleBar = this._handleBar.bind(this);
    this._deSelectAll = this._deSelectAll.bind(this);
    this.handleYear = this.handleYear.bind(this);
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
      prevProps.summaryData.length !== this.props.summaryData.length
      || prevProps.profitType !== this.props.profitType
      || prevProps.profitSubType !== this.props.profitSubType
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
    const { summaryData , profitType , profitSubType , selectedTopItems , selectedYears} = this.props;
    let data = [] , _data = [], maxData = 0 , minData = 0;
    let subField = "ActualProfit" + profitSubType;
    if(profitType !== "" && summaryData && profitSubType !== "")
    {
        summaryData.forEach(item => {

          if(item[profitType])
          {
            if(!_data[item[profitType]])
            {
              _data[item[profitType]] = [];
              _data[item[profitType]][subField] = 0;
            }
            _data[item[profitType]][subField] += item[subField];
          }
        });
    }

    if(_data)
    {
      // skip non-selected item.
      let _item ;
      Object.keys(_data).forEach( key => {
         if(_data[key][subField] > maxData)
          maxData = _data[key][subField];

         if(_data[key][subField] < minData)
           minData = _data[key][subField];

        _item = [];
        _item['name'] = key;
        _item['value'] = _data[key][subField];
        data.push(_item);

      });
    }

  //   data = []; // error test

    this.setState({
      data: data,
      maxData: maxData,
      minData: minData,
    });
  };

  handleYear = (event) => {
    // we use single year selector. so only use first element of seletecyears.
    this.props.handleFilter({
     selectedYears: event.selectedYears,
     label: event.selectedYears.toString()
   });

    this.props.handleFilter({selectedYears:[event.selectedYears], label:event.selectedYears[0].toString() });
    this.props.getProjectPerformanceSummary(event.selectedYears[0]);
    this.props.getProjectPerformanceDetail(event.selectedYears[0]);
  };

  handleFilter = event => {
    if(event.target.name === "ProfitType")
    {
      this.props.handleFilter({
        profitType: event.target.value,
      });
    }
    else if(event.target.name === "ProfitSubType")
    {
      this.props.handleFilter({
        profitSubType: event.target.value,
      });
    }

    this.props.handleFilter({
      selectedTopItems: [],
    });
  };

  _getColor = (bar) => {
    const { selectedTopItems } = this.props;

    const name = bar.bar.data.name;

    const activeColor =  bar.bar.data.value<0?minusActiveColor:positiveActiveColor;
    const disableColor = bar.bar.data.value<0?minusDisableColor:positiveDisableColor;

    if (selectedTopItems.length === 0) {
      return activeColor;
    }

    for (let i = 0; i < selectedTopItems.length ; i++) {
      if (selectedTopItems[i] === name) {
        return activeColor;
      }
    }

    return disableColor;
  };

  _handleBar = (event, bar) => {
    const { selectedTopItems } = this.props;
    const { selectedBars } = this.state;

    let _selectedBars, _selectedMonths, _selectedTopItems;

    const name = bar.bar.data.name;

    if (event.shiftKey) {
      _selectedBars = selectedBars.slice();
      _selectedTopItems = selectedTopItems.slice();

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
        _selectedTopItems.push(name);
      } else {
        event.target.classList.remove('barActive');
        _selectedBars.splice(index, 1);
        _selectedTopItems.splice(index, 1);
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
      } else {
        _selectedTopItems = [name];
        _selectedBars = [event.target];
        event.target.classList.add('barActive');
      }
    }

    this.setState({
      selectedBars: _selectedBars,
    });

    this.props.handleFilter({
      selectedTopItems: _selectedTopItems,
    });

  };

  _handleLabel = (event, month) => {
    return;
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
    });
  };

  _showTooltip = (event, xScale, bar, isBar=true) => {
    if (tooltipTimeout) clearTimeout(tooltipTimeout);

  //  const { x, y } = localPoint(event);
    const { showTooltip } = this.props;
    let data = {}, top, left;

    if (isBar) {
      const { hoverBar } = this.state;
      if (hoverBar) hoverBar.classList.remove('barHover');
      event.target.classList.add('barHover');
      this.setState({hoverBar: event.target});

      top = event.clientY - 50;
      left = event.clientX;
      data = bar;
    } else {
      top  = event.clientY - 50;//event.nativeEvent.layerY;
      left = event.clientX; //event.clientX;
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

    if(this._isMounted === true)
      tooltipTimeout = setTimeout(() => {
        if (hoverBar) hoverBar.classList.remove('barHover');
        this.setState({hoverBar: null});

        hideTooltip();
      }, 300);
  };

  render() {
    const {
      classes,
      tooltipOpen, tooltipTop, tooltipLeft, tooltipData ,
      profitType , profitSubType , label, selectedYears
    } = this.props;
    let { data, minData , maxData } = this.state;
    let width = window.innerWidth - 15;
    let height = (window.innerHeight - 100) / 3;

    const margin = {
      top: 10,
      right: 0,
      bottom: 20,
      left: 80
    };

    let { pageYOffset, xMax, yMax } = getParams(window, width, height , margin);

    const x = d => d.name;
    if(data.length > 20)
      yMax-=50;
    else {
      yMax-=10;
    }
    data = data.sort((a,b) => ( (-a.value + b.value) ));
    // scales
    const xScale = scaleBand({
      domain: data.map(x),
      rangeRound: [0, xMax],
      padding: 0.2
    });
    const yScale = scaleLinear({
      domain: [minData, maxData ],
      range: [yMax, 0],
      nice: true
    });


    let keys =  [];
    keys.push("value");

    const color = scaleOrdinal({
      domain: keys,
      range: [positiveActiveColor]
    });

    return (
      <div className={classes.root}>
        <div className="wrapper">
            <div >
              <Typography variant="h6" className="subtitle mt-10">Profit By &nbsp;&nbsp;&nbsp;</Typography>
            </div>
            <div >
                <FormControl className={classes.formControl}>
                  <NativeSelect
                    value={profitType}
                    name="ProfitType"
                    onChange={this.handleFilter}
                  >
                    <option value='Director'>Director</option>
                    <option value='ProjectManager'>Project Leader</option>
                    <option value='Supervisor'>Associate</option>
                    <option value='ProjectTypeDescription'>Project Type</option>
                    <option value='ProjectSubTypeDescription'>Project Sub Type</option>
                    <option value='ClientName'>Client</option>
                    <option value='Project'>Project</option>
                  </NativeSelect>
                </FormControl>
              </div>
              <div >
                  <FormControl className={classes.formControl}>
                    <NativeSelect
                      value={profitSubType}
                      name="ProfitSubType"
                      onChange={this.handleFilter}
                    >
                      <option value='MTD'>Month To Date</option>
                      <option value='YTD'>Year To Date</option>
                      <option value='JTD'>Project To Date</option>
                    </NativeSelect>
                  </FormControl>
                </div>
              <div >
                <YearSelector
                  selectedYears={selectedYears}
                  label={label}
                  onChange={this.handleYear}
                 />
              </div>
          </div>

        <div className="well">
          <svg width={width} height={height}>
              <rect x={0} y={0} width={width} height={height} fill={'transparent'} onClick={this._deSelectAll}  />

              <Group top={margin.top} left={margin.left}>
                <BarStack data={data}  keys={keys} x={x} xScale={xScale}  yScale={yScale} color={color}>
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

                <Bar  width = {xMax}
                      stroke={"#d7d7d7"}
                      strokeWidth={1}
                      height = {1}
                      y={!yScale(0)?0:yScale(0)} />

                <AxisLeft
                  numTicks={4}
                  scale={yScale}
                  stroke="#d7d7d7"
                  tickStroke="#d7d7d7"
                  strokeWidth={1}
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

                <AxisBottom
                  top={yMax}
                  scale={xScale}
                  hideTicks={true}
                  numTicks={6}
                  stroke="#d7d7d7"
                  tickStroke="#d7d7d7"
                >
                  {axis => {
                    const tickLabelSize = 12;
                    const tickRotate = data.length > 20?270:0;
                    const tickColor = "black";
                    const axisCenter = (axis.axisToPoint.x - axis.axisFromPoint.x) / 2;

                    return (

                      <g className="my-custom-bottom-axis">
                        <Line from={axis.axisFromPoint} height={1} to={axis.axisToPoint} stroke={"#d7d7d7"} />
                        {axis.ticks.map((tick, i) => {
                          const tickX = tick.to.x;
                          const tickY = tick.to.y + tickLabelSize + axis.tickLength ;
                          return (
                            <Group key={`vx-tick-${tick.value}-${i}`} className={'vx-axis-tick'}>

                              <text
                                transform={`translate(${tickX}, ${tickY}) rotate(${tickRotate})`}
                                fontSize={tickLabelSize}
                                textAnchor="end"
                                fill={tickColor}
                              >
                                {data.length > 20?(tick.formattedValue.substring(0,4) + ".."):tick.formattedValue}
                              </text>
                            </Group>
                          );
                        })}

                      </g>
                    );
                  }}
                </AxisBottom>

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
                      <strong>{tooltipData.bar.data.name} </strong>
                    </div>
                    <div className="ft-12">
                      <strong>Profit: {thousandFormat2(tooltipData.bar.data.value)}</strong>
                    </div>
                  </div>
                  :
                  <div>
                    Sum IncomeMTDForecast HistoricalOnly = {thousandFormat(tooltipData.forecast)}
                  </div>
                }
              </Tooltip>
            )}


        </div>
      </div>
    );
  }

}


TopChart.propTypes = {
  classes: PropTypes.object.isRequired,
  summaryData: PropTypes.array.isRequired,
  selectedYears: PropTypes.array.isRequired,
  label: PropTypes.string.isRequired,
  selectedTopItems: PropTypes.array.isRequired,
  getProjectPerformanceSummary: PropTypes.func.isRequired,
  getProjectPerformanceDetail: PropTypes.func.isRequired,
  handleFilter: PropTypes.func.isRequired
};

export default withStyles(styles)(withTooltip(TopChart));
