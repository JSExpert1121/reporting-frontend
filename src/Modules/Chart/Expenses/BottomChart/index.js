import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import {
  Typography,
  Grid
} from '@material-ui/core'

import { Bar} from '@vx/shape';
import { withTooltip, Tooltip } from "@vx/tooltip";
import { AxisBottom } from '@vx/axis'
import { scaleLinear} from '@vx/scale';

import {
  getParams, getMonth, thousandFormat2 ,
} from "../../../../Utils/Functions";
import {
  positiveActiveColor,
  positiveDisableColor,
  negativeActiveColor,
  negativeDisableColor,
  thinAxis, barThinHeight , formatedStyle
} from "../../../../Assets/js/constant";

import { styles } from './style';

let tooltipTimeout;


class BottomChart extends Component {

  _isMounted = false;
  constructor(props) {
    super(props);

    this.state = {
      resize: false,
      hoverBar: null,
      selectedBars: [],
      selectedBarObjs: [],
      data: [],
      chartDepth: 0,
    };

    this._prepareData = this._prepareData.bind(this);
    this._handleBar = this._handleBar.bind(this);
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
      prevProps.detailData !== this.props.detailData
      || prevProps.selectedTopItems !== this.props.selectedTopItems
      || prevProps.selectedMiddleItems !== this.props.selectedMiddleItems
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
    const { detailData,  selectedTopItems , selectedMiddleItems, selectedYears} = this.props;

    let dictData = {};
    let data = [];

    let selectedTopYears = [];


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

    let isInFilter = false;
    if(detailData)
    {

         detailData.forEach(item => {
          let month = getMonth(item.Date);
          isInFilter = false;
          if(selectedTopItems.length === 0)
          {
            if(selectedMiddleItems.length === 0 || selectedMiddleItems.indexOf(item.AccountType) > -1)
            {
               isInFilter = true;
            }
          } else {
            selectedTopItems.forEach(topitem=>{
              if((topitem.year === item.FY && (topitem.month === month || topitem.month === undefined)))
              {
                  if(selectedMiddleItems.length === 0 || selectedMiddleItems.indexOf(item.AccountType) > -1)
                  {
                     isInFilter = true;
                  }
              }
            });
          }


          if(isInFilter === true)
          {
            if(dictData[item.AccountSubType] === undefined)
            {
              dictData[item.AccountSubType] = {};
              dictData[item.AccountSubType]["ActualExpenses"] = 0;
              dictData[item.AccountSubType]["ForecastExpenses"] = 0;
              dictData[item.AccountSubType]["AccountType"] = item.AccountType;
              dictData[item.AccountSubType]["AccountSubType"] = item.AccountSubType;
              dictData[item.AccountSubType]["Account"] = {};
            }
            dictData[item.AccountSubType]["ActualExpenses"] += item.ActualExpenses;
            dictData[item.AccountSubType]["ForecastExpenses"] += item.ForecastExpenses;

            if(dictData[item.AccountSubType]["Account"][item.AccountName] === undefined)
            {
              dictData[item.AccountSubType]["Account"][item.AccountName] = {};
              dictData[item.AccountSubType]["Account"][item.AccountName]["AccountNumber"] = item.AccountNumber;
              dictData[item.AccountSubType]["Account"][item.AccountName]["ActualExpenses"] = 0;
              dictData[item.AccountSubType]["Account"][item.AccountName]["ForecastExpenses"] = 0;
              dictData[item.AccountSubType]["Account"][item.AccountName]["AccountName"] = item.AccountName;
              dictData[item.AccountSubType]["Account"][item.AccountName]["AccountSubType"] = item.AccountSubType;
              dictData[item.AccountSubType]["Account"][item.AccountName]["AccountType"] = item.AccountType;
            }
            dictData[item.AccountSubType]["Account"][item.AccountName]["ActualExpenses"] += item.ActualExpenses;
            dictData[item.AccountSubType]["Account"][item.AccountName]["ForecastExpenses"] += item.ForecastExpenses;
          }
        });
    }

    // data = []; // error test
    Object.keys(dictData).map(key => {
      let item = {};
      let subitem = [];
      Object.keys(dictData[key].Account).map(subkey =>{
        let _item = {};
        _item["AccountName"] = dictData[key]["Account"][subkey].AccountName;
        _item["AccountNumber"] = dictData[key]["Account"][subkey].AccountNumber;
        _item["ActualExpenses"] = dictData[key]["Account"][subkey].ActualExpenses;
        _item["ForecastExpenses"] = dictData[key]["Account"][subkey].ForecastExpenses;
        _item["AccountType"] = dictData[key]["Account"][subkey].AccountType;
        _item["AccountSubType"] = dictData[key]["Account"][subkey].AccountSubType;
        subitem.push(_item);
      });
      item['AccountSubType'] = dictData[key].AccountSubType;
      item['ActualExpenses'] = dictData[key].ActualExpenses;
      item['ForecastExpenses'] = dictData[key].ForecastExpenses;
      item['AccountType'] = dictData[key].AccountType;
      item['Account'] = subitem;
      data.push(item);
    });

    this.setState({
      data: data,
    });
  };

  handleFilter = event => {

    if(event.target.name === "ShowFilter")
    {
      this.setState({showFilter:event.target.value});
    } else if(event.target.name === "SortFilter"){
      this.setState({sortFilter:event.target.value});
    }
    this.props.handleFilter(event);
  };

  _getColor = (bar) => {

    const { selectedBarObjs} = this.state;

    if(bar.ActualExpenses === undefined || bar.ForecastExpenses === undefined)
      return positiveActiveColor;

    let activeColor ;//= "#27aae1";
    let disableColor;// = "#1c75bc";
    if(bar.ActualExpenses <= bar.ForecastExpenses)
    {
      activeColor = positiveActiveColor;
      disableColor = positiveDisableColor;
    } else {
      activeColor = negativeActiveColor;
      disableColor = negativeDisableColor;
    }

    let index = -1;
    if(selectedBarObjs && selectedBarObjs.length !== 0)
    {
      selectedBarObjs.forEach(item => {

        if(item.AccountName === bar.AccountName)
        {
          index++;
        }
      })
    } else {
      return activeColor;
    }

    if(index >= 0)
      return activeColor;

    return disableColor;
  };

  _handleBar = (event, bar) => {
    const { selectedBars , selectedBarObjs} = this.state;

    let _selectedBars, _selectedBarObjs;

    if (event.shiftKey) {
      _selectedBars = selectedBars.slice();
      _selectedBarObjs = selectedBarObjs.slice();

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
        _selectedBarObjs.push(bar);
      } else {
        event.target.classList.remove('barActive');
        _selectedBars.splice(index, 1);
        _selectedBarObjs.splice(index , 1);
      }

    } else {

      let exist = false;

      selectedBars.forEach(selectedBar => {
        selectedBar.classList.remove('barActive');
        if (selectedBar === event.target) exist = true;
      });

      if (exist && selectedBars.length === 1) {
        _selectedBars = [];
        _selectedBarObjs = [];
      } else {

        _selectedBars = [event.target];
        _selectedBarObjs = [bar];
        event.target.classList.add('barActive');
      }
    }

    this.setState({
      selectedBars: _selectedBars,
      selectedBarObjs: _selectedBarObjs
    });

  };

  _deSelectAll = () => {
    const { hoverBar, selectedBars} = this.state;

    if (hoverBar) hoverBar.classList.remove('barHover');

    selectedBars.forEach(selectedBar => {
      selectedBar.classList.remove('barActive');
    });

    this.setState({
      hoverBar: null,
      selectedBars: [],
      selectedBarObjs : [],
    });

    this.props.handleFilter({
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

      top = event.pageY - this.state.PageOffset - 80;
      left = event.clientX;
      data = bar;

    } else {
      top = event.pageY - this.state.PageOffset - 80;
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

  handlePos = (event) => {
    const {PageOffset} = this.state;
    const _pos = event.currentTarget.getBoundingClientRect().top + window.scrollY;
    if( (PageOffset !== _pos ) && this._isMounted === true)
    {
      this.setState({PageOffset: _pos})
    }
  }

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
      classes,
      tooltipOpen, tooltipTop, tooltipLeft, tooltipData
    } = this.props;
    let { data, chartDepth} = this.state;

    const width = window.innerWidth - 15;
    const height = (window.innerHeight - 100) / 5;
    const margin = {
      top: 10,
      right: 0,
      bottom: 20,
      left: 15
    };

    const { pageYOffset, xMax, yMax } = getParams(window, width, height, margin);

    let numTicks = 5;
    let minData = 0 , maxData = 0;

    data.forEach( item => {
      if(chartDepth == 0) {
        maxData = Math.max(maxData, item.ActualExpenses, item.ForecastExpenses);
        minData = Math.min(minData, item.ActualExpenses, item.ForecastExpenses);
      }else {
        item.Account.forEach( subitem => {
          maxData = Math.max(maxData, subitem.ActualExpenses, subitem.ForecastExpenses);
          minData = Math.min(minData, subitem.ActualExpenses, subitem.ForecastExpenses);
        });
      }
    });

    data.sort( (a,b)=> ( b.ActualExpenses - a.ActualExpenses ));

    let axisWidth = 0;
    axisWidth = (xMax - 10) * 10 / 12;
    if(chartDepth === 1)
      axisWidth = axisWidth * 11 / 12;
    if(chartDepth === 2)
      axisWidth = axisWidth * 9 / 12;

    const xScale = scaleLinear({
      rangeRound: [0, axisWidth - 10],
      domain: [minData * 1.2  , maxData * 1.2],
      nice: false,
    });

    return (

      <div className={classes.root}  onMouseMove={event => this.handlePos(event)}
      onTouchMove={event => this.handlePos(event)}>
        <div>
          <Typography variant="h6" className="subtitle mt-10">Detail for Selected Expenses</Typography>
        </div>

        <div style={{overflowX:'hidden' ,maxHeight:`${height}px`, paddingLeft:'1px', borderTop: 'solid 1px #d7d7d7',
        borderLeft: 'solid 1px #d7d7d7',borderRight: 'solid 1px #d7d7d7'}}>
          <div  style={formatedStyle(xMax  , 11, 0 , 0 , 'pointer')}  id="wrapper" >
            {data.map((item, i) => {
                const yMax = barThinHeight - 5;
                item.Account.sort((a,b) =>(a.AccountNumber - b.AccountNumber));
                return (
                  <Grid container key={i} >
                    <Grid item md={12} sm={12} xs={12}>
                      <Grid container >
                        <Grid item md={2} sm={2} xs={2} style={{ borderRight: 'solid 1px #d7d7d7'}}
                        {...{onClick: (event) => {

                            chartDepth++;
                            if(chartDepth > 2)
                              chartDepth = 0;

                            this.setState({chartDepth:chartDepth})
                          }
                        }}
                        >
                          <div style={{paddingLeft:'5px',marginLeft:'0px'}}>
                          { item.AccountSubType}
                          </div>
                        </Grid>
                        <Grid item  md={10} sm={10} xs={10}>
                        {
                          chartDepth !== 0?

                            item.Account.map((subaccount, key) => {

                            let barWidth = xScale(subaccount.ActualExpenses) - xScale(0);
                            let barHeight = 18;
                            let barX = xScale(0) ;
                            let barY = 0;
                            if(subaccount.ActualExpenses < 0)
                            {
                              barX = xScale(subaccount.ActualExpenses);
                              barWidth = xScale(0) - xScale(subaccount.ActualExpenses);
                            }
                            return(
                              <div className={[`flex`,` grayHover`]} key={key} >
                                <Grid container >
                                  <Grid item md={1} sm={1} xs={1}
                                  {... { onClick: (event) => {

                                      chartDepth++;
                                      if(chartDepth > 2)
                                        chartDepth = 0;

                                      this.setState({chartDepth:chartDepth})
                                      }
                                    }
                                  }
                                  >
                                  {subaccount.AccountNumber}
                                  </Grid>
                                  {chartDepth!==1?
                                    <Grid item md={2} sm={2} xs={2}>
                                      {subaccount.AccountName}
                                    </Grid>
                                    : ""
                                  }
                                  <Grid item  md={chartDepth===1?10:9} sm={chartDepth===1?10:9} xs={chartDepth===1?10:9} >
                                    <div >
                                      <svg height={yMax} width={axisWidth}>
                                        <rect x={0} y={0}  height={yMax} fill="transparent" onClick={this._deSelectAll}/>
                                        <Bar
                                        x={barX}
                                        y={barY}
                                        width={barWidth}
                                        height={barHeight}
                                        fill={this._getColor(subaccount)}
                                        onClick={event => this._handleBar(event, subaccount)}
                                        onMouseLeave={event => this._hideTooltip()}
                                        onMouseMove={event => this._showTooltip(event, xScale, subaccount)}
                                        onTouchEnd={event => this._hideTooltip()}
                                        onTouchMove={event => this._showTooltip(event, xScale, subaccount)}
                                        >
                                        </Bar>
                                        <Bar
                                          x={xScale(subaccount.ForecastExpenses)}
                                          y={barY}
                                          width={1}
                                          height={barHeight}
                                          fill={'black'}
                                          stroke={"black"}
                                          strokeWidth={0.5}
                                          onMouseLeave={event => this._hideTooltip()}
                                          onMouseMove={event => this._showTooltip(event, xScale, subaccount , false)}
                                          onTouchEnd={event => this._hideTooltip()}
                                          onTouchMove={event => this._showTooltip(event, xScale, subaccount , false)}
                                        />
                                      </svg>
                                    </div>
                                  </Grid>
                                </Grid>
                              </div>
                            )
                          })
                          :
                            <div className={[`flex` ,` grayHover`]} >
                              {(() => {

                                let barWidth = xScale(item.ActualExpenses) - xScale(0);
                                let barHeight = 18;
                                let barX = xScale(0);
                                let barY = 0;
                                if(item.ActualExpenses < 0)
                                {
                                  barX = xScale(item.ActualExpenses);
                                  barWidth = xScale(0) - xScale(item.ActualExpenses);
                                }

                                return(
                                  <div style={{position: 'relative' , margin:'0px', padding:'0px'}} >
                                    <svg height={yMax} width={axisWidth} >
                                      <rect x={0} y={0}  height={yMax} fill="transparent" onClick={this._deSelectAll}/>
                                      <Bar
                                        x={barX}
                                        y={barY}
                                        width={barWidth}
                                        height={barHeight}
                                        fill={this._getColor(item)}
                                        onClick={event => this._handleBar(event, item)}
                                        onMouseLeave={event => this._hideTooltip()}
                                        onMouseMove={event => this._showTooltip(event, xScale, item)}
                                        onTouchEnd={event => this._hideTooltip()}
                                        onTouchMove={event => this._showTooltip(event, xScale, item)}
                                      >
                                      </Bar>
                                      <Bar
                                        x={xScale(item.ForecastExpenses)}
                                        y={barY}
                                        width={1}
                                        height={barHeight}
                                        fill={'black'}
                                        stroke={"black"}
                                        strokeWidth={0.5}
                                        onMouseLeave={event => this._hideTooltip()}
                                        onMouseMove={event => this._showTooltip(event, xScale, item, false)}
                                        onTouchEnd={event => this._hideTooltip()}
                                        onTouchMove={event => this._showTooltip(event, xScale, item, false)}
                                      />

                                    </svg>
                                  </div>
                                )
                              })()}
                            </div>

                        }
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                )
              })}
          </div>
        </div>
        {
          // bottom axis chart
        }
        <div  style={formatedStyle(xMax  , 12, 0 , 0)  ,{borderTop: 'solid 1px #d7d7d7', padding:'0px'}}  >
          <div >
              {data.length >0?
                <div onClick={this._deSelectAll}>
                    <Grid container>
                      <Grid item md={2} sm={2} xs={2}>
                        &nbsp;
                      </Grid>
                      <Grid item  md={10} sm={10} xs={10}>
                        <Grid container>
                          {chartDepth>0?
                            <Grid item md={1} sm={1} xs={1}>
                              &nbsp;&nbsp;
                            </Grid>
                            : ""
                          }
                          {chartDepth===2?
                            <Grid item md={2} sm={2} xs={2}>
                              &nbsp;&nbsp;
                            </Grid>
                            : ""
                          }
                          <Grid item md={chartDepth===0?10:9} sm={chartDepth===0?10:9} xs={chartDepth===0?10:9}>
                            <svg width={axisWidth} height={barThinHeight}>
                              <rect x={0} y={0} width={axisWidth} height={barThinHeight} fill={'transparent'}/>

                              <AxisBottom
                                scale={xScale}
                                top={0}
                                hideAxisLine={true}
                                stroke="black"
                                numTicks={numTicks}
                                tickStroke="#d7d7d7"
                                tickLabelProps={(value, index) => ({
                                  fill: 'black',
                                  fontSize: 11,
                                  textAnchor: 'middle',
                                  dy: '0.2em'
                                })}
                                tickComponent={({ formattedValue, ...tickProps }) => (
                                  <text
                                    {...tickProps}
                                  >
                                    ${formattedValue}
                                  </text>
                                )}
                              />
                            </svg>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </div>
                  :
                  ""
              }
            </div>
        </div>


        {tooltipOpen && (
            <Tooltip
              style={{position: 'absolute',left:`${tooltipLeft}px` , top:`${tooltipTop}px`}}
              >

              {tooltipData.isBar ?
                <div style = {{width:'200px'}}>
                  <div className="pdv-10">
                    <strong>{tooltipData.AccountType}:&nbsp;{tooltipData.AccountSubType}</strong>
                  </div>
                  <div className="flex">
                    Forecast:&nbsp;&nbsp;<strong> {thousandFormat2(tooltipData.ForecastExpenses)}</strong>
                  </div>
                  <div className="flex">
                    Actual:&nbsp;&nbsp;<strong> {thousandFormat2(tooltipData.ActualExpenses)}</strong>
                  </div>
                </div>
                :
                <div style = {{width:'200px'}}>
                  <div className="pdv-10">
                  Forecast :&nbsp;&nbsp;<strong>{thousandFormat2(tooltipData.forecast.ForecastExpenses)}</strong>
                  </div>
                </div>

              }
            </Tooltip>
          )}
      </div>
    );
  }

}


BottomChart.propTypes = {
  classes: PropTypes.object.isRequired,

  detailData: PropTypes.array.isRequired,

  period: PropTypes.string.isRequired,
  selectedYears: PropTypes.array.isRequired,
  selectedMonths: PropTypes.array.isRequired,
  selectedTopItems: PropTypes.array.isRequired,
  selectedMiddleItems: PropTypes.array.isRequired,
  defaultStartMonth: PropTypes.number.isRequired,
  handleFilter: PropTypes.func.isRequired
};

export default withStyles(styles)(withTooltip(BottomChart));
