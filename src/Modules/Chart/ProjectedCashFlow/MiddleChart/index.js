import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import {
  Typography,
  Grid
} from '@material-ui/core'

import {Bar, LinePath} from '@vx/shape';
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


class MiddleChart extends Component {

  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = {
      resize: false,
      hoverBar: null,
      selectedBars: [],
      selectedBarObjs: [],
      data: [],
      group : [],
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
      prevProps.middleData !== this.props.middleData
      || prevProps.selectedTopItems !== this.props.selectedTopItems
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
    const { middleData,  selectedTopItems } = this.props;

    let data = [] , _data = [];
    let group = {} , _group = [];

    if(middleData)
    {

      middleData.forEach(item => {
          let month = getMonth(item.Date);

          if(item.CashChange !== 0 /*&& item.CashChange != 0*/ ) {
            if(data[item.CashFlowCategory] === undefined)
            {
              data[item.CashFlowCategory] = {};
              data[item.CashFlowCategory]["CashChange"] = 0;
              //data[item.CashFlowCategory]["ForecastCashChange"] = 0;
            }
            data[item.CashFlowCategory]["CashFlowGroup"] = item.CashFlowGroup;
            data[item.CashFlowCategory]["CashFlowCategory"] = item.CashFlowCategory;
            //data[item.CashFlowCategory]["CashChange"] += item.CashChange;
            data[item.CashFlowCategory]["CashChange"] += item.CashChange;
          }
        });
    }

    Object.keys(data).map( key => {
        _data.push(data[key]);
      }
    );

    _data.sort( (a,b) => ( b.CashChange - a.CashChange));

    _data.map( item => {
      if (group[item.CashFlowGroup] == undefined)
        group[item.CashFlowGroup] = {};
      group[item.CashFlowGroup] = item.CashFlowGroup;
    });


    Object.keys(group).map( key => {
        _group.push(key);
      }
    );
    // data = []; // error test

    this.setState({
      data: _data,
      group: _group,
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

    if(bar.CashChange === undefined )
      return positiveActiveColor;

    let activeColor ;//= "#27aae1";
    let disableColor;// = "#1c75bc";
    if(bar.CashChange > 0)
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
    const { selectedMiddleItems } = this.props;
    const { selectedBars , selectedBarObjs} = this.state;

    let _selectedBars, _selectedBarObjs , _selectedMiddleItems;

    if (event.shiftKey) {
      _selectedBars = selectedBars.slice();
      _selectedBarObjs = selectedBarObjs.slice();
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
        _selectedBarObjs.push(bar);
        _selectedMiddleItems.push({CashFlowCategory: bar.CashFlowCategory , CashFlowGroup: bar.CashFlowGroup});
      } else {
        event.target.classList.remove('barActive');
        _selectedBars.splice(index, 1);
        _selectedBarObjs.splice(index , 1);
        _selectedMiddleItems.splice(index, 1);
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
        _selectedMiddleItems = [];
      } else {
        _selectedMiddleItems = [{CashFlowCategory: bar.CashFlowCategory , CashFlowGroup: bar.CashFlowGroup}];
        _selectedBars = [event.target];
        _selectedBarObjs = [bar];
        event.target.classList.add('barActive');
      }
    }

    this.setState({
      selectedBars: _selectedBars,
      selectedBarObjs: _selectedBarObjs
    });

    this.props.updateFilter({
      selectedMiddleItems: _selectedMiddleItems,
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

      //top = event.currentTarget.getBoundingClientRect().y - 400 + event.pageY;
      //left = event.clientX;

      top = event.pageY - 380;
      left = event.clientX;
      data = bar;

    } else {
      top = event.pageY - 380;
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
      classes,
      tooltipOpen, tooltipTop, tooltipLeft, tooltipData
    } = this.props;
    let { data, group} = this.state;

    const width = window.innerWidth ;
    const height = 300;
    const margin = {
      top: 0,
      right: 0,
      bottom: 20,
      left: 10
    };

    const { pageYOffset, xMax, yMax } = getParams(window, width, height, margin);

    let numTicks = 10;
    let minData = 0 , maxData = 0;

    data.map( (item , key) => {
      minData += item.CashChange;
      maxData = Math.max(item.CashChange , maxData );
    });

    if(minData > 0) minData = 0;
    let axisWidth;
    axisWidth = (xMax - 10) * ( 10 / 12);
    axisWidth = axisWidth * (9 / 12);

    const xScale = scaleLinear({
      rangeRound: [0, axisWidth ],
      domain: [minData  , maxData ],
      nice: true,
    });

    let _maxData = 0;
    let _minData = 0;

    return (

      <div className={classes.root}  id = "middleRoot">
        <div>
          <Typography variant="h6" className="subtitle mt-10">Cash Flow (Actual)</Typography>
        </div>

        <div>
          <div  style={formatedStyle(xMax  , 12 , 0 , 0 , 'pointer')}  id="wrapper" >
            {group.map((grupItem, i) => {
                const yMax = barThinHeight - 5;

                return (
                  <Grid container key={i} >
                    <Grid item md={12} sm={12} xs={12}>
                      <Grid container >
                        <Grid item md={2} sm={2} xs={2} style={{borderTop:'solid 1px #a9a9a9',borderLeft:'solid 1px #a9a9a9'}}>
                          <p style={{padding:'0px',margin:'0px'}}>
                          {grupItem}
                          </p>
                        </Grid>

                        <Grid item md={10} sm={10} xs={10} style={{borderTop:'solid 1px #a9a9a9',borderRight:'solid 1px #a9a9a9'}}>
                          {

                            data.map( (item , j) => {
                              if(item.CashFlowGroup !== grupItem)
                                return;

                              let barX , barY , barWidth , barHeight;
                              barY = 0;
                              barHeight = 15;


                              if(item.CashChange < 0)
                              {
                                _maxData += item.CashChange;
                                barX = xScale(_maxData);
                                barWidth = xScale(_minData) - barX;
                                _minData += item.CashChange;
                              }
                              else
                              {
                                _maxData += item.CashChange;
                                barX = xScale(_minData);
                                barWidth = xScale(_maxData) - barX;
                                _minData += item.CashChange;
                              }

                              return(
                                <Grid container key={j} >
                                  <Grid item md={3} sm={3} xs={3} style={{borderRight:'solid 1px #a9a9a9'}}>
                                    {item.CashFlowCategory}
                                  </Grid>
                                  <Grid item md={9} sm={9} xs={9}>
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

                                      <LinePath
                                        data={[{'x':xScale(0),'y':0},{'x':xScale(0),'y':yMax}]}
                                        x={d=> d.x}
                                        y={d=> d.y}
                                        stroke={"#555555"}
                                        strokeDasharray="2,1"
                                      />

                                    </svg>
                                  </Grid>
                                </Grid>
                              )
                            })
                          }

                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                )
              })}


              {data.length >0?
                <div style={thinAxis , {borderTop: 'solid 1px #a9a9a9'}} onClick={this._deSelectAll}>
                    <Grid container>
                      <Grid item md={2} sm={2} xs={2}>
                        &nbsp;&nbsp;
                      </Grid>
                      <Grid item  md={10} sm={10} xs={10}>
                        <Grid container>

                          <Grid item md={3} sm={1} xs={1}>
                            &nbsp;&nbsp;
                          </Grid>


                          <Grid item md={9} sm={9} xs={9}>
                            <svg width={axisWidth} height={barThinHeight}>
                              <rect x={0} y={0} width={axisWidth} height={barThinHeight} fill={'transparent'}/>

                              <AxisBottom
                                scale={xScale}
                                top={0}
                                hideAxisLine={true}
                                stroke="black"
                                numTicks={numTicks}
                                tickStroke="#a9a9a9"
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
                    <strong>{tooltipData.CashFlowGroup}:&nbsp;{tooltipData.CashFlowCategory}</strong>
                  </div>
                  <div className="flex">
                    <strong> {thousandFormat2(tooltipData.CashChange)}</strong>
                  </div>
                </div>
                :
                ""

              }
            </Tooltip>
          )}
      </div>
    );
  }

}


MiddleChart.propTypes = {
  classes: PropTypes.object.isRequired,
  middleData: PropTypes.array.isRequired,
  updateFilter: PropTypes.func.isRequired,
  selectedMiddleItems: PropTypes.array.isRequired,
};

export default withStyles(styles)(withTooltip(MiddleChart));
