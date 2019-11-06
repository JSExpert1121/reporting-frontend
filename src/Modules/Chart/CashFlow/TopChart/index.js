import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import {
  Typography , Grid
} from '@material-ui/core'

import { Group } from '@vx/group';
import { withTooltip, Tooltip } from "@vx/tooltip";
import { AxisLeft, AxisBottom } from '@vx/axis'
import { scaleBand, scaleLinear } from '@vx/scale';
import {LinePath, Line} from '@vx/shape';
import { localPoint } from "@vx/event";
import {
  getParams, getMonth, thousandFormat,getMonths2, getMonths
} from "../../../../Utils/Functions";
import {
  fMonths,
  enMonths,
  positiveActiveColor,
  tooltip
} from "../../../../Assets/js/constant";

import { styles } from './style';

let tooltipTimeout;
const xSelector = d => d.month;
const ySelector = d => d.CashBalance;

class TopChart extends Component {

  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = {
      resize: false,

      hoverBar: null,
      selectedLines: [],

      data: [],
      totals: [],
      colors: [],
      safetyLine : 0,
      maxLine : 0,
      lineClicked: false,

    };

    this._prepareData = this._prepareData.bind(this);
    this._deSelectAll = this._deSelectAll.bind(this);
  }

  _onResize() {
    if(this._isMounted === true)
      this.setState({resize: !this.state.resize});
  }

  componentDidMount() {
    this._isMounted = true;
    window.addEventListener('resize', this._onResize.bind(this));

  }

  componentDidUpdate(prevProps, prevState){
    if (
      prevProps.topData !== this.props.topData /*||
      (prevProps.selectedTopItems !== this.props.selectedTopItems)*/)
    {
          if(this._isMounted === true) {
            const {selectedTopItems} = this.props;
            if (selectedTopItems.length === 0) {
              this.setState({selectedLines: []})
            }
            this._prepareData();
          }
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
    window.removeEventListener('resize', this._onResize.bind(this));
  }

  _prepareData = () => {
    let { topData, selectedYears } = this.props;
    let dictData = {};
    let data = [];
    let _safetyLine = 0;
    let _maxLine = 0;

    if(selectedYears.length === 0)
      return;

    let colors = selectedYears.reduce((ret, year) => {
      ret.push(positiveActiveColor);
      return ret;
    }, []);

    selectedYears.forEach(year=>{
      dictData[year] = {};
      dictData[year]['months'] = [];
      dictData[year]["totals"] = [];
      dictData[year]["year"] = year;
      fMonths.forEach(month => {
        dictData[year]['months'][month] = {};
        dictData[year]['months'][month]['month'] = month;
        dictData[year]['months'][month]['year'] = year;
        dictData[year]['months'][month]['CashBalance'] = 0;
        dictData[year]['months'][month]['SafetyBankBalance'] = 0;
        dictData[year]["totals"][month] = 0;
      });
    })


    let fiscalMonths = getMonths(this.props.defaultStartMonth);

    if(topData && topData.length > 0 && selectedYears.length > 0)
    {
      topData.forEach(item => {
        let month = getMonth(item.Date);
          dictData[item.FY]['months'][month]['CashBalance'] = item.CashBalance;
          dictData[item.FY]['months'][month]['SafetyBankBalance'] = item.SafetyBankBalance;
          dictData[item.FY]["totals"][month] = item.CashBalance;
          _safetyLine = item.SafetyBankBalance;
          _maxLine = Math.max(_maxLine , item.CashBalance);
      });

      selectedYears.forEach(year =>{
        // arrange according to the financial year month
        let _newItem = [];
        fiscalMonths.forEach(month => {
            _newItem.push(dictData[year]['months'][month]);
        });
        dictData[year]['months'] = _newItem;
        data.push(dictData[year]);
      });
    }

    this.setState({
      data: data,
      colors: colors,
      safetyLine:_safetyLine,
      maxLine: _maxLine,
    });
  };

  _deSelectAll = () => {

      this.setState({
      hoverBar: null,
      selectedLines: [],
    });

    this.props.updateFilter({
      selectedTopItems: [],
    });
  };

  _showTooltip = (event, bar, xScale, yScale, isBar = true) => {
    if (tooltipTimeout) clearTimeout(tooltipTimeout);

    const { showTooltip } = this.props;
    let data = {}, top, left , pTop , pLeft;

    let tmpX = [] ;
    let fiscalMonths = getMonths2( this.props.defaultMonth, this.props.defaultStartMonth);

    if(bar.months === undefined)
      return;

    const { x , y} = localPoint(event);
    bar.months.forEach(item => {
      if(fiscalMonths.indexOf(item.month) > -1)
        tmpX.push( {'year':item.year , 'month':item.month, 'value': item.CashBalance,'xPos':xScale(item.month)});
    });

    let _x = x - xScale.step()/2;
    tmpX.sort( (a , b) => ( Math.abs(_x - a.xPos) - Math.abs(_x - b.xPos)));

    pLeft = (tmpX?tmpX[0].xPos:0) + xScale.step()/2;
    pTop = (tmpX?yScale(tmpX[0].value):0) ;

    top = event.clientY - 100;
    left = event.clientX;
    data = bar;
    data['isBar']   = isBar;
    data['pLeft']   = pLeft;
    data['pTop']    = pTop;
    data['year']    = tmpX[0].year;
    data['month']   = tmpX[0].month;
    data['value']   = tmpX[0].value;

    this.setState({lineClicked: false});

    showTooltip({
      tooltipData: data,
      tooltipTop: top,
      tooltipLeft: left
    });
  };

  _handleLineSelect = (event, item , xScale, yScale) => {
    let { lineClicked , selectedLines } = this.state;
    let { selectedTopItems, dimDate , cashflowMiddleRequest } = this.props;

    let selected = [] ;
    let fiscalMonths = getMonths2( this.props.defaultMonth, this.props.defaultStartMonth);

    if(item.months === undefined )
      return;

    const { x , y} = localPoint(event);
    item.months.forEach(item => {
      if(fiscalMonths.indexOf(item.month) > -1 )
        selected.push( {'year':item.year , 'month':item.month, 'value': item.CashBalance,'xPos':xScale(item.month)});
    });

    let _x = x - xScale.step()/2;
    selected.sort( (a , b) => ( Math.abs(_x - a.xPos) - Math.abs(_x - b.xPos)));

    let left = (selected?selected[0].xPos:0) + xScale.step()/2;
    let top = (selected?yScale(selected[0].value):0) ;

    if (event.shiftKey) {
      selectedTopItems = selectedTopItems.slice();
      selectedLines = selectedLines.slice();
      let index = NaN;
      for (let i = 0; i < selectedTopItems.length; i++) {
        if (selectedTopItems[i].month === selected[0].month &&
          selectedTopItems[i].year === selected[0].year) {
          index = i;
          break;
        }
      }

      if (isNaN(index)) {
        selectedTopItems.push({'year':selected[0].year , 'month':selected[0].month});
        selectedLines.push({'year':selected[0].year , 'month':selected[0].month ,
          'left':left, 'top':top});
      } else {
        selectedTopItems.splice(index, 1);
        selectedLines.splice(index, 1);
      }

    } else {
      selectedTopItems = [];
      selectedLines = [];
      selectedTopItems.push({'year':selected[0].year , 'month':selected[0].month});
      selectedLines.push({'year':selected[0].year , 'month':selected[0].month ,
        'left':left, 'top':top});
    }

    let printf = require('printf');
    dimDate = [];
    selectedTopItems.map((item , key)=> {

      let _DimDate = printf("%04d%02d01" ,
        (item.month + 1)>= this.props.defaultStartMonth? item.year-1:item.year ,
        (item.month + 1));
      dimDate.push(_DimDate);
    });

    this.setState({lineClicked: !lineClicked , selectedLines:selectedLines});

    this.props.updateFilter({
      selectedTopItems: selectedTopItems,
      dimDate:dimDate,
      selectedBottomItems: [],
    });

    cashflowMiddleRequest(dimDate);
  };

  _hideTooltip = () => {
    if(this._isMounted === true) {
      const {hoverBar} = this.state;
      const {hideTooltip} = this.props;

      tooltipTimeout = setTimeout(() => {
        if(this._isMounted === true) {
          if (hoverBar) hoverBar.classList.remove('barHover');
          this.setState({hoverBar: null});
          hideTooltip();
        }
      }, 300);
    }
  };

  render() {
    const {
      classes,
      tooltipOpen, tooltipTop, tooltipLeft, tooltipData

    } = this.props;
    let { data , safetyLine , maxLine, selectedLines} = this.state;

    data.sort((a,b)=> (b.year - a.year));

    const width = window.innerWidth - 15;
    const height = 250;
    const margin = {
      top: 10,
      right: 0,
      bottom: 10,
      left: 0
    };

    const { pageYOffset, xMax, yMax } = getParams(window, width, height, margin);
    let localHeight = 200;
    let localAxisHeight = 50;
    if(data.length >= 3) {
      localHeight = 150;
      localAxisHeight = 100;
    }

    let axisScale = scaleLinear({
      domain: [0, maxLine],
      range: [localHeight  , 0],
      nice: true
    });

    return (
      <div className={classes.root}>
        <div>
          <Typography variant="h6" className="subtitle mb-10">Cash Balance vs Safety Bank Range</Typography>
        </div>

        <div className={classes.frame}>
            <Grid container  style={{borderLeft: 'solid 1px #a9a9a9'}} >
              <Grid item md={1} sm={1} sx={1}>
                <svg width={width / 12} height={localHeight + 20}>
                  <rect x={0} y={0} width={width / 12 } height={localHeight + 20} fill={'transparent'}  />
                  <Group top={margin.top} left={margin.left}>
                    <AxisLeft
                      left={width / 12}
                      //hideTicks={true}
                      scale={axisScale}
                      stroke="black"
                      tickStroke="black"
                      numTicks={2}
                      tickLabelProps={(value, index) => ({
                        fill: 'black',
                        fontSize: 11,
                        textAnchor: 'end',
                        dy: '0.33em',
                      })}
                      tickComponent={({ formattedValue, ...tickProps }) => (
                        <text
                          {...tickProps}
                          fill={'black'}
                        >
                          ${(formattedValue)}
                        </text>
                      )}
                    />
                  </Group>
                </svg>
              </Grid>
              <Grid item md={11} sm={11} sx={11} style = {{display:'flex'}}>
              {data.map((item , key) => {

                let maxWidth = width * 11 / 12;
                let localWidth =  maxWidth / data.length;
                let fiscalMonths = getMonths2( this.props.defaultMonth, this.props.defaultStartMonth);
                // scales
                let xScale = scaleBand({
                  domain: item.months.map(xSelector),
                  rangeRound: [0, localWidth],
                  padding: 0,
                  nice : true
                });

                let yScale;
                yScale = axisScale;

                let validMonths = [];
                item.months.forEach( (d , k)=> {
                  if(d.value !== 0 && fiscalMonths.indexOf(d.month) > -1)
                    validMonths[k] = d;
                });

                let keys = [];
                keys.push("CashBalance");

                return(
                    <div  key = {key}>
                      <Grid container style={{borderRight: 'solid 1px #a9a9a9'}}>
                        <svg width={localWidth} height={localHeight}>
                          <rect x={0} y={0} width={localWidth } height={localHeight} fill={'transparent'} onClick={this._deSelectAll}
                                onMouseMove={event => {
                                  if (tooltipTimeout) clearTimeout(tooltipTimeout);
                                  this._showTooltip(
                                    event,
                                    item,
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
                                    item,
                                    xScale,
                                    yScale
                                  );
                                }}
                                onTouchEnd={event => {
                                  tooltipTimeout = setTimeout(() => {
                                    this._hideTooltip();
                                  }, 300);
                                }}

                                onClick={event => {
                                  this._handleLineSelect(event, item,xScale , yScale);
                                }}
                          />
                          <Group top={margin.top} left={margin.left}>
                            <LinePath
                              data={[{'x':0,'y':yScale(safetyLine)},{'x':localWidth,'y':yScale(safetyLine)}]}
                              x={d=> d.x}
                              y={d=> d.y}
                              stroke={"#555555"}
                              strokeDasharray="2,2"
                              />

                            <LinePath
                              data={validMonths}
                              //  curve={()=>(return 0)}
                              x={(d => xScale(xSelector(d)) + xScale.step()/2) }
                              y={d => yScale(ySelector(d))}
                              strokeWidth={3}
                              stroke={positiveActiveColor}
                              strokeLinecap="round"
                              fill="transparent"
                              /*onClick={event => {
                                this._handleLineSelect(event, item,xScale , yScale);
                              }}*/
                            />

                            {tooltipOpen &&(
                              <g>
                                <circle
                                  cx={tooltipData.pLeft}
                                  cy={tooltipData.pTop}
                                  r={tooltipData.year === item.year?4:0}
                                  fill={positiveActiveColor}
                                  stroke="black"
                                  strokeWidth={0}
                                  style={{ pointerEvents: "none" }}
                                />
                              </g>
                            )}

                            {
                              selectedLines.map((sel , selectedKey)=> {
                                let radius = 0;
                                let strokeWidth = 0;
                                if(sel.year === item.year)
                                {
                                  radius = 6;
                                  strokeWidth = 3;
                                }
                                return(
                                  <g key={selectedKey}>
                                    <circle
                                      cx={sel.left}
                                      cy={sel.top}
                                      r={radius}
                                      fill={positiveActiveColor}
                                      stroke="black"
                                      strokeWidth={strokeWidth}
                                      style={{ pointerEvents: "none" }}
                                    />
                                  </g>
                                )
                              })
                            }
                        </Group>
                      </svg>

                      <svg width={localWidth} height={localAxisHeight}>
                        <rect x={0} y={0} width={localWidth } height={localAxisHeight} fill={'transparent'} onClick={this._deSelectAll} />
                        <Group top={margin.top} left={margin.left}>
                          <AxisBottom
                            top={0}
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
                                    const tickX = tick.to.x ;
                                    const tickY = tick.to.y + tickLabelSize + axis.tickLength ;
                                    return (
                                      <Group key={`vx-tick-${tick.value}-${i}`} className={'vx-axis-tick'}>
                                        <text
                                          transform={`translate(${tickX}, ${tickY}) rotate(${tickRotate})`}
                                          fontSize={tickLabelSize}
                                          textAnchor="end"
                                          fill={tickColor}
                                        >
                                          { data.length > 5?
                                            tick.formattedValue%2===0?enMonths[tick.formattedValue]:''
                                            :enMonths[tick.formattedValue]}
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
                  </div>
                )
              })}
              </Grid>
            </Grid>
        </div>

        {tooltipOpen && (
          <Tooltip
            top={tooltipTop + pageYOffset}
            left={tooltipLeft}
            style={tooltip}
          >
            {tooltipData.isBar ?
              <div>
                <div className="pdv-10">
                  <strong>{enMonths[(tooltipData.month)]}</strong>
                </div>
                <div className="ft-12">
                  <strong>${thousandFormat(tooltipData.value)}</strong>
                </div>

              </div>
              :
              <div>
                ""
              </div>
            }
          </Tooltip>
        )}

      </div>
    );
  }

}


TopChart.propTypes = {
  classes: PropTypes.object.isRequired,
  topData: PropTypes.array.isRequired,
  selectedYears: PropTypes.array.isRequired,
  selectedBottomItems: PropTypes.array.isRequired,
  selectedTopItems: PropTypes.array.isRequired,
  updateFilter: PropTypes.func.isRequired,
  cashflowMiddleRequest: PropTypes.func.isRequired,
  dimDate: PropTypes.array.isRequired,
  defaultStartMonth:PropTypes.number.isRequired,
  defaultMonth:PropTypes.number.isRequired
};

export default withStyles(styles)(withTooltip(TopChart));
