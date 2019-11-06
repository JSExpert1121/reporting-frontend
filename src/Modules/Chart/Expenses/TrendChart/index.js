import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import {
  Typography , Grid
} from '@material-ui/core'

import { Group } from '@vx/group';
import { withTooltip } from "@vx/tooltip";
import { AxisBottom } from '@vx/axis'
import { scaleBand, scaleLinear } from '@vx/scale';
import { LinePath, Line } from '@vx/shape';
import { localPoint } from "@vx/event";
import {
  getParams, getMonth , getMonths2, getMonths
} from "../../../../Utils/Functions";
import {
  enMonths,
  positiveActiveColor,
  positiveDisableColor,
  negativeActiveColor,
  negativeDisableColor,
} from "../../../../Assets/js/constant";

import { styles } from './style';
import { Text } from '@vx/text';

let tooltipTimeout;
const xSelector = d => d.month;
const ySelector = d => d.value;

class TrendChart extends Component {

  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = {
      resize: false,

      hoverBar: null,
      selectedBars: [],

      data: [],
      colors: [],
      selectedTopYears : [],
      lineClicked: false,
      lineYear:0,
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
      || prevProps.selectedTopItems !== this.props.selectedTopItems
      || (prevProps.selectedMiddleItems !== this.props.selectedMiddleItems && this.props.selectedMiddleItems.length !== 0)
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
    let { detailData, selectedYears, period , selectedTopItems , selectedMiddleItems } = this.props;
    let { selectedTopYears} = this.state;
    let dictData = {};
    let data = [];

    selectedYears = selectedYears.slice();
    const allIndex = selectedYears.indexOf('All');
    if (allIndex > -1) selectedYears.splice(allIndex, 1);

    let colors = selectedYears.reduce((ret, year) => {
      ret.push(positiveActiveColor);
      return ret;
    }, []);

    selectedTopYears = [];
    if(selectedTopItems.length === 0 /*|| selectedMiddleItems.length === 0*/)
    {
      selectedYears.forEach(item=>{
          selectedTopYears.push(item);
      });
    } else {
      selectedTopItems.forEach(item=>{
        if(selectedTopYears.indexOf(item.year) === -1)
          selectedTopYears.push(item.year);
      });
    }

    if(period !== "month")
      selectedYears = selectedYears.sort((a,b) => ( (a - b) ));

    let fiscalMonths = getMonths(this.props.defaultStartMonth);
    let fiscalMonths2 = getMonths2( this.props.defaultMonth, this.props.defaultStartMonth);

    selectedTopYears.forEach(year=>{

      dictData[year] = {};
      dictData[year]['months'] = [];
      dictData[year]['totals'] = [];
      dictData[year]['forcasts'] = [];
      dictData[year]["year"] = 0;

      fiscalMonths.forEach(month => {

        dictData[year]['months'][month] = {};
        dictData[year]['months'][month]['month'] = month;
        dictData[year]['months'][month]['value'] = 0;
        dictData[year]['months'][month]['totalvalue'] = 0;
        dictData[year]['totals'][month] = 0;
        dictData[year]['forcasts'][month] = 0;

      });
    })

    let accounts = [];
    if(detailData !== undefined)
    {
      const accountSelector = d => d.AccountType;
      accounts = (detailData).map(accountSelector);
    }

    if(detailData)
      detailData.forEach(item => {
        let month = getMonth(item.Date);

        if(selectedTopYears.indexOf(item.FY) > -1 /*&& item.AccountType != "Bonuses" && item.AccountType != "Other Income"*/)
        {
          if(dictData[item.FY]['months'][month] !== undefined)
          {
            if(fiscalMonths2.indexOf(month) > -1) {
              if (selectedMiddleItems.indexOf(item.AccountType) > -1 ||
                (selectedMiddleItems.length === 0 && accounts.length > 0 && accounts[0] === item.AccountType)
              )
              {
                dictData[item.FY]['months'][month]['value'] += item.ActualExpenses;
                dictData[item.FY]['totals'][month] += item.ActualExpenses;
                dictData[item.FY]['forcasts'][month] += item.ForecastExpenses;
              }

              dictData[item.FY]['months'][month]['totalvalue'] += item.ActualExpenses;
              dictData[item.FY]['year'] = item.FY;
            }
          }
        }
      });

      selectedTopYears.forEach(year =>{
        // arrange according to the financial year month
        let _newItem = [];
        fiscalMonths.forEach(month => {
          _newItem.push(dictData[year]['months'][month]);
        });
        dictData[year]['months'] = _newItem;
        data.push(dictData[year]);
      });

      this.setState({
        data: data,
        colors: colors,
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

    this.setState({
      selectedBars: _selectedBars,
    });

    this.props.handleFilter({
      selectedTopItems: _selectedTopItems,
      selectedMonths: _selectedMonths
    });

  };

  _handleLabel = (event, month) => {
    const { selectedMonths, selectedTopItems } = this.props;
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
      }
    }

    this.setState({
      selectedBars: _selectedBars,
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

  _showTooltip = (event, data, year, xScale, yScale) => {
    if (tooltipTimeout) clearTimeout(tooltipTimeout);

    const { showTooltip } = this.props;
    let top = 0, left = 0;
    const { x , y} = localPoint(event);
    let tmpX = [] ;
    data.forEach(item => {
      tmpX.push( {'year':item.year , 'value': item.value,'xPos':xScale(item.month)});
    });

    let _x = x - xScale.step()/2;
    tmpX.sort( (a , b) => ( Math.abs(_x - a.xPos) - Math.abs(_x - b.xPos)));

    left = (tmpX?tmpX[0].xPos:0) + xScale.step()/2;
    top = (tmpX?yScale(tmpX[0].value):0) ;

    this.setState({lineClicked: false,lineYear:year});

    showTooltip({
      tooltipData: data,
      tooltipTop: top,
      tooltipLeft: left,
    });
  };

  _handleLineSelect = (event, data) => {
    const { lineClicked } = this.state;
    this.setState({lineClicked: !lineClicked});
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
      classes, tooltipOpen, tooltipTop, tooltipLeft
    } = this.props;

    const { data , lineClicked , lineYear} = this.state;

    const width = window.innerWidth - 15;
    const height = (window.innerHeight - 100) / 6;
    const margin = {
      top: 10,
      right: 0,
      bottom: 50,
      left: 0
    };

    const { pageYOffset, xMax, yMax } = getParams(window, width, height, margin);
    let fiscalMonths = getMonths2( this.props.defaultMonth, this.props.defaultStartMonth);

    return (
      <div className={classes.root}>
        <div>
          <Typography variant="h6" className="subtitle mb-10">Trend for Selected Expenses</Typography>
        </div>

        <div className={data.length>0?classes.frame:''}>
            <Grid container  style={{borderLeft: 'solid 1px #a9a9a9'}} >
            {data.map((item , key) => {

              // scales
              let xScale = scaleBand({
                domain: /*extent(summaryData, x),*/ item.months.map(xSelector),
                rangeRound: [0, xMax / data.length],
                padding: 0.2
              });

              let validMonths = [];
              item.months.forEach( (d , k)=> {
                if(d.value !== 0)
                  validMonths[k] = d;
              });

              /*let xScale_line = scaleBand({
                domain:  validMonths.map(xSelector),
                rangeRound: [0, xMax / data.length],
                padding: 0.2
              });*/

              let totalmax = 0;
              Object.keys(item.totals).map( (i,j) => {
                totalmax = Math.max(item.totals[i] , totalmax);
              });

              let yScale = scaleLinear({
                domain: [0, totalmax * 1.2],
                range: [yMax , 0],
                nice: true
              });
              let printf = require('printf');
              /*var total = item.totals.reduce((ret , value) => {
                return ret + value;
              } , 0 );*/

              let item_width = Math.round(12 / data.length);
              return(

                  <Grid item md={item_width} sm={item_width} xs={item_width} key = {key}>
                    <Grid container style={{borderRight: 'solid 1px #a9a9a9'}}>
                      <svg width={width / data.length} height={height}>
                        <rect x={0} y={0} width={width / data.length } height={height} fill={'transparent'} onClick={this._deSelectAll} />

                        <Group top={margin.top} left={margin.left}>
                          {
                            validMonths.map((month , mkey) => {

                              return(
                                <g key = {mkey}>
                                  <circle
                                    cx={xScale(month.month) + xScale.step()/2}
                                    cy={yScale(month.value)}
                                    stroke={'#919698'}
                                    r={2}
                                  />
                                  <Text
                                    x={ xScale(month.month) + xScale.step()/2 }
                                    y={ yScale(month.value)}
                                    verticalAnchor="end"
                                    textAnchor="start"
                                    fontSize={10}
                                    dx={-5}
                                    dy={-5}
                                  >
                                  {printf("%d%" , (month.value / month.totalvalue) * 100)}
                                  </Text>
                                </g>
                              )
                            })
                          }

                          <LinePath
                            data={validMonths}
                            x={(d => xScale(xSelector(d)) + xScale.step()/2) }
                            y={d => yScale(ySelector(d))}
                            strokeWidth={2}
                            stroke={'#919698'}
                            strokeLinecap="round"
                            fill="transparent"
                            onClick={event => {
                              this._handleLineSelect(event, item.months);
                            }}
                            onMouseMove={event => {
                              if (tooltipTimeout) clearTimeout(tooltipTimeout);
                              this._showTooltip(
                                event,
                                item.months,
                                item.year,
                                xScale,
                                yScale
                              );
                            }}
                            onMouseLeave={event => {
                              tooltipTimeout = setTimeout(() => {
                                this._hideTooltip();
                              }, 300);
                            }}
                            onTouchMove={event => {
                              if (tooltipTimeout) clearTimeout(tooltipTimeout);
                              this._showTooltip(
                                event,
                                item.months,
                                item.year,
                                xScale,
                                yScale
                              );
                            }}
                            onTouchEnd={event => {
                              tooltipTimeout = setTimeout(() => {
                                this._hideTooltip();
                              }, 300);
                            }}
                          />

                          {tooltipOpen &&(
                            <g>
                              <circle
                                cx={tooltipLeft}
                                cy={tooltipTop}
                                r={lineYear === item.year?(lineClicked ? 6 : 4):0}
                                fill={"#919698"}
                                stroke="#e3e3e3"
                                strokeWidth={lineClicked ? 3 : 0}
                                style={{ pointerEvents: "none" }}
                              />
                            </g>
                          )}

                          <AxisBottom
                            top={yMax}
                            scale={xScale}
                            hideTicks={true}
                            numTicks={6}
                            stroke="black"
                            tickStroke="black">
                            {axis => {
                              const tickLabelSize = 12;
                              const tickRotate = data.length > 2?270:0;
                              const tickColor = "black";
                              const axisCenter = (axis.axisToPoint.x - axis.axisFromPoint.x) / 2;

                              return (

                                <g className="my-custom-bottom-axis" >
                                  <Line from={axis.axisFromPoint} to={axis.axisToPoint} stroke={tickColor} />
                                  {axis.ticks.map((tick, i) => {
                                    const tickX = tick.to.x + xScale.step() / 10 ;
                                    const tickY = tick.to.y + tickLabelSize + axis.tickLength ;
                                    return (
                                      <Group key={`vx-tick-${tick.value}-${i}`} className={'vx-axis-tick'}>

                                        <text
                                          transform={`translate(${tickX}, ${tickY}) rotate(${tickRotate})`}
                                          fontSize={tickLabelSize}
                                          textAnchor="end"
                                          fill={tickColor}
                                        >
                                          {enMonths[tick.formattedValue] }
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
                  </Grid>
                </Grid>

              )
            })}
            </Grid>
        </div>

      </div>
    );
  }

}


TrendChart.propTypes = {
  classes: PropTypes.object.isRequired,
  detailData: PropTypes.array.isRequired,
  period: PropTypes.string.isRequired,
  selectedYears: PropTypes.array.isRequired,
  selectedMonths: PropTypes.array.isRequired,
  selectedTopItems: PropTypes.array.isRequired,
  selectedMiddleItems: PropTypes.array.isRequired,
  defaultStartMonth: PropTypes.number.isRequired,
  defaultMonth: PropTypes.number.isRequired,
  handleFilter: PropTypes.func.isRequired
};

export default withStyles(styles)(withTooltip(TrendChart));
