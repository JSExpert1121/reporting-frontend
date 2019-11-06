import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import {
  Typography , Grid
} from '@material-ui/core'
import Truncate from 'react-truncate';
import { Group } from '@vx/group';
import { withTooltip, Tooltip } from "@vx/tooltip";
import { AxisLeft, AxisBottom } from '@vx/axis'
import { scaleBand, scaleLinear } from '@vx/scale';
import {LinePath, Line, Bar} from '@vx/shape';
import { curveBasis } from '@vx/curve'
import { GradientOrangeRed } from '@vx/gradient';
import { localPoint } from "@vx/event";
import {
  getParams, getMonth, thousandFormat,thousandFormat2,getMonths2, getMonths, makeDimDate,
  financialMonth
} from "../../../../Utils/Functions";
import {
  fMonths,
  enMonths,
  positiveActiveColor,
  tooltip,
  activeLabelColor,
  formatedStyle
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
      selectedRightBars: [],
      selectedLeftItems: [],
      selectedRightItems: [],
      avgHours: [],
      data: [],
      totals: [],
      rightdata: [],
      mixLabel: 'All'
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
      prevState.selectedLeftItems !== this.state.selectedLeftItems ||
      prevProps.detailData !== this.props.detailData )
    {
          if(this._isMounted === true)
          {
            this._prepareData();
          }
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
    window.removeEventListener('resize', this._onResize.bind(this));
  }

  _prepareData = () => {
    let { detailData, selectedYears , selectedTopItems, defaultStartMonth} = this.props;
    let {selectedLeftItems} = this.state;
    let dictData = {} , dictTotal = {};
    let dictRightData = {};
    let data = [], rightdata = [], total = [], mixLabel = '',avgHours = [];

    let colors =  ['#26456e','#e377c2','#8c564b','#ff7f0e','#b4d4da','#7f7f7f','#e377c2','#8c564b','#ff7f0e','#b4d4da','#7f7f7f'];
    let disablecolors = ['#cdd3db','#f0dcea','#e0d6d4','#f5dec9','#e8edef','#dedede','#f0dcea','#e0d6d4','#f5dec9','#e8edef','#dedede'];
    let rightColors = ['#1c75bc', '#88cfee'];
    let rightDisableColors = ['#ccdce9', '#dfedf2'];
    if(detailData === undefined)
      return;
    // getting left barchart data
    if(detailData['Left'] !== undefined)
      detailData['Left'].map((item, index)=>{
        let month = getMonth(item.Date);
        if(dictData[item.EmployeeRole] === undefined)
        {
          dictData[item.EmployeeRole] = {};
          dictData[item.EmployeeRole]["EmployeeRole"] = item.EmployeeRole;
          dictData[item.EmployeeRole]["Sort"] = item.Sort;
          dictData[item.EmployeeRole]["Color"] = colors[index + 1];
          dictData[item.EmployeeRole]["DisableColor"] = disablecolors[index + 1];
          dictData[item.EmployeeRole]["value"] = {};
        }
        if(dictData[item.EmployeeRole]["value"][month] === undefined)
        {
          dictData[item.EmployeeRole]["value"][month] = {};
          dictData[item.EmployeeRole]["value"][month]['month'] = month;
          dictData[item.EmployeeRole]["value"][month]['FteEquivalent'] = 0;
          dictData[item.EmployeeRole]["value"][month]['ActualFteEquivalentMTD'] = 0;
        }

        dictData[item.EmployeeRole]["value"][month]['FteEquivalent'] += item.FteEquivalent;
        dictData[item.EmployeeRole]["value"][month]['ActualFteEquivalentMTD'] += item.ActualFteEquivalentMTD;

        if(dictTotal[month] === undefined)
          dictTotal[month] = 0;

        dictTotal[month] += item.ActualFteEquivalentMTD;
        // mixLabel process
        if(mixLabel === '')
          mixLabel = month;
        else if(mixLabel !== month)
          mixLabel = 'All';

      })

    Object.keys(dictData).map(idx=>{
      data.push(dictData[idx]);
    });

    Object.keys(dictTotal).map(idx=>{
      total.push(dictTotal[idx]);
    });

    data.sort( (a,b) => (a.Sort - b.Sort));

    // make total _data
    let totalData = {};
    if(detailData['Left'] !== undefined && detailData['Left'].length > 0)
    {
      totalData["EmployeeRole"] = 'Total People';
      totalData["Color"] = colors[0];
      totalData["DisableColor"] = disablecolors[0];
      totalData["value"] = {};
      totalData["value"][0] = {};
      totalData["value"][0]['month'] = -1;
      totalData["value"][0]['FteEquivalent'] = -1;
      totalData["value"][0]['ActualFteEquivalentMTD'] = Math.max(...total);
      data.push(totalData);
    }

    // getting Right barchart data
    if(detailData['Right'] !== undefined)
      detailData['Right'].map((item, index)=>{
        let bFieldExisting = false;
        selectedLeftItems.forEach(leitem=>{
          if(leitem.EmployeeRole === item.EmployeeRole && bFieldExisting === false || leitem.month == -1)
          {
            bFieldExisting = true;
          }
        });
        if(selectedLeftItems.length === 0)
          bFieldExisting = true;

        if(bFieldExisting)
        {
          if(dictRightData[item.EmployeeRole] === undefined)
          {
            dictRightData[item.EmployeeRole] = {};
            dictRightData[item.EmployeeRole]["EmployeeRole"] = item.EmployeeRole;
            dictRightData[item.EmployeeRole]["Color"] = rightColors;
            dictRightData[item.EmployeeRole]["DisableColor"] = rightDisableColors;
            dictRightData[item.EmployeeRole]["value"] = {};
          }
          if(dictRightData[item.EmployeeRole]["value"][item.EmployeeName] === undefined)
          {
            dictRightData[item.EmployeeRole]["value"][item.EmployeeName] = {};
            dictRightData[item.EmployeeRole]["value"][item.EmployeeName]['EmployeeName'] = item.EmployeeName;
            dictRightData[item.EmployeeRole]["value"][item.EmployeeName]['ChargeableHoursWorkedMTD'] = item.ChargeableHoursWorkedMTD;
            dictRightData[item.EmployeeRole]["value"][item.EmployeeName]['NonChargeableHoursWorkedMTD'] = item.NonChargeableHoursWorkedMTD;
            dictRightData[item.EmployeeRole]["value"][item.EmployeeName]['HoursWorked'] = item.HoursWorked;
          } else {

            dictRightData[item.EmployeeRole]["value"][item.EmployeeName]['ChargeableHoursWorkedMTD'] += (item.ChargeableHoursWorkedMTD);
            dictRightData[item.EmployeeRole]["value"][item.EmployeeName]['NonChargeableHoursWorkedMTD'] += (item.NonChargeableHoursWorkedMTD);
            dictRightData[item.EmployeeRole]["value"][item.EmployeeName]['HoursWorked'] += item.HoursWorked;
          }

          avgHours.push(item.AverageHoursWorkedPerDay);
        }
      })

    Object.keys(dictRightData).map(idx=>{
      rightdata.push(dictRightData[idx]);
    });

    //data.sort( (a , b) => ( -a.FteEquivalent + b.FteEquivalent));
    this.setState({
      data:data,
      totals:total,
      rightdata:rightdata,
      mixLabel:mixLabel,
      avgHours: avgHours
    });
  };

  _deSelectAll = () => {
      this.setState({
      hoverBar: null,
    });

    this.setState({
      selectedLeftItems: [],
    });
  };

    _showTooltip = (event, item, value, isLeftBar = true) => {
      if (tooltipTimeout) clearTimeout(tooltipTimeout);

      const { showTooltip } = this.props;
      let data = {}, top, left;

      if(isLeftBar)
      {
        top = event.clientY - 560;
        left = event.clientX;
      } else {
        top = event.clientY - 640;
        left = event.clientX - 200;
      }

      data = item;
      data['subitem'] = value;
      data['isLeftBar']   = isLeftBar;

      showTooltip({
        tooltipData: data,
        tooltipTop: top,
        tooltipLeft: left
      });
    };

  _hideTooltip = () => {
    if(this._isMounted === true) {
      //const {hoverBar} = this.state;
      const {hideTooltip} = this.props;

      tooltipTimeout = setTimeout(() => {
        if(this._isMounted === true) {
          //if (hoverBar) hoverBar.classList.remove('barHover');
          //this.setState({hoverBar: null});
          hideTooltip();
        }
      }, 300);
    }
  };

  _handleChart = (event, item, value , key) => {
    const { selectedBars, selectedLeftItems } = this.state;
    let _selectedLeftItems , _selectedBars ;

    let index = NaN;
    for (let i = 0; i < selectedBars.length; i++) {
      if (selectedBars[i] === event.target) {
        index = i;
        break;
      }
    }

    if (event.shiftKey) {
      _selectedBars = selectedBars.slice();
      _selectedLeftItems = selectedLeftItems.slice();

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
        if(value === null)
        {
          // includes all names
          Object.keys(item.value).map(subd=>{
            _selectedLeftItems.push({EmployeeRole: item.EmployeeRole , month: item.value[subd].month});
          });
        }else{
          _selectedLeftItems.push({EmployeeRole: item.EmployeeRole ,  month: value.month});

        }

      } else {
        event.target.classList.remove('barActive');
        _selectedBars.splice(index, 1);
        _selectedLeftItems.splice(index, 1);
      }

    } else {

      let exist = false;

      selectedBars.forEach(selectedBar => {
        selectedBar.classList.remove('barActive');
        if (selectedBar === event.target) exist = true;
      });

      if (exist && selectedBars.length === 1) {
        _selectedLeftItems = [];
        _selectedBars = [];
      } else {
        _selectedLeftItems = [];
        if(value === null)
        {
          // includes all names
          Object.keys(item.value).map(subd=>{
            _selectedLeftItems.push({EmployeeRole: item.EmployeeRole , month: item.value[subd].month});
          });
        }else{
          _selectedLeftItems.push({EmployeeRole: item.EmployeeRole ,  month: value.month});

        }
        _selectedBars = [event.target];
        event.target.classList.add('barActive');
      }
    }

    this.setState({
      selectedBars: _selectedBars,
      selectedLeftItems: _selectedLeftItems
    });

  };

  _getColor = (item , value , type='chart') => {
    const {selectedLeftItems } = this.state;

    let activeColor = item.Color;
    let disableColor = item.DisableColor;

    if (selectedLeftItems.length === 0 )
    {
      return activeColor;
    }

    for (let i = 0; i < selectedLeftItems.length ; i++) {
      if (selectedLeftItems[i].EmployeeRole === item.EmployeeRole &&  selectedLeftItems[i].month === value.month)
      {
        return activeColor;
      }
    }

    return disableColor;
  };

  _handleChart2 = (event, item, value , key) => {
    const { selectedRightBars, selectedRightItems } = this.state;
    let _selectedRightItems , _selectedRightBars ;

    let index = NaN;
    for (let i = 0; i < selectedRightBars.length; i++) {
      if (selectedRightBars[i] === event.target) {
        index = i;
        break;
      }
    }

    if (event.shiftKey) {
      _selectedRightBars = selectedRightBars.slice();
      _selectedRightItems = selectedRightItems.slice();

      let index = NaN;
      for (let i = 0; i < selectedRightBars.length; i++) {
        if (selectedRightBars[i] === event.target) {
          index = i;
          break;
        }
      }

      if (isNaN(index)) {
        event.target.classList.add('barActive');
        _selectedRightBars.push(event.target);
        if(value === null)
        {
          // includes all names
          Object.keys(item.value).map(subd=>{
            _selectedRightItems.push({EmployeeRole: item.EmployeeRole , month: item.value[subd].month});
          });
        }else{
          _selectedRightItems.push({EmployeeRole: item.EmployeeRole ,  month: value.month});

        }

      } else {
        event.target.classList.remove('barActive');
        _selectedRightBars.splice(index, 1);
        _selectedRightItems.splice(index, 1);
      }

    } else {

      let exist = false;

      selectedRightBars.forEach(selectedBar => {
        selectedBar.classList.remove('barActive');
        if (selectedBar === event.target) exist = true;
      });

      if (exist && selectedRightBars.length === 1) {
        _selectedRightItems = [];
        _selectedRightBars = [];
      } else {
        _selectedRightItems = [];
        if(value === null)
        {
          // includes all names
          Object.keys(item.value).map(subd=>{
            _selectedRightItems.push({EmployeeRole: item.EmployeeRole , EmployeeName: item.value[subd].EmployeeName});
          });
        }else{
          _selectedRightItems.push({EmployeeRole: item.EmployeeRole ,  EmployeeName: value.EmployeeName});

        }
        _selectedRightBars = [event.target];
        event.target.classList.add('barActive');
      }
    }

    this.setState({
      selectedRightBars: _selectedRightBars,
      selectedRightItems: _selectedRightItems
    });

  };

  _getColor2 = (item , value , key=0) => {
    const {selectedRightItems } = this.state;

    let activeColor = item.Color[key];
    let disableColor = item.DisableColor[key];

    if (selectedRightItems.length === 0 )
    {
      return activeColor;
    }

    for (let i = 0; i < selectedRightItems.length ; i++) {
      if (selectedRightItems[i].EmployeeRole === item.EmployeeRole &&  selectedRightItems[i].EmployeeName === value.EmployeeName)
      {
        return activeColor;
      }
    }

    return disableColor;
  };

  render() {
    const {
      classes,
      tooltipOpen, tooltipTop, tooltipLeft, tooltipData,
      selectedTopItems
    } = this.props;
    let { data, rightdata, selectedLeftItems, totals, mixLabel, avgHours } = this.state;
    let startAvg = Math.min(...avgHours);
    let endAvg = Math.max(...avgHours);
    const width = window.innerWidth - 15;
    const height = (window.innerHeight ) - 560;
    const margin = {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10
    };

    const { pageYOffset, xMax, yMax } = getParams(window, width, height, margin);

    let leftWidth = width * 1 / 2 ;
    let rightWidth = xMax - leftWidth;
    let leftCellWidth = (leftWidth )/ 7;
    let rightCellWidth = rightWidth / 7 ;
    let offset = {};
    // scales
    let xScale = scaleLinear({
      domain: [0 , (Math.max(...totals) + 0.01)],
      rangeRound: [0, leftCellWidth * 4 - 30],
      padding: 0.2,
      nice : true
    });

    let rxScale = scaleLinear({
      domain: [0 , 100],
      rangeRound: [0, rightCellWidth * 4 - 30],
      padding: 0.2,
      nice : true
    });

    return (
      <div className={classes.root} >

        <div >
            <Grid container  >
              <Grid item md={6} sm={12} sx={12} >
                <Typography variant="h6" className="subtitle mb-10">Mix ({mixLabel==='All'?'All':enMonths[mixLabel]})</Typography>
                <div className="relative" style={{maxHeight:`${height}px` ,overflowY:'auto'}}>
                    {
                        data.length > 0?
                        <div  className="flex" align="left" style={{borderBottom: 'solid 1px #cdcdcd', }}>
                          <p style={formatedStyle(leftCellWidth * 2, 12, 0 , 1)}>
                            Role
                          </p>
                          <p style={formatedStyle(leftCellWidth, 12, 0 , 1)} align='center'>
                            Available
                          </p>
                          <p style={formatedStyle(leftCellWidth * 4, 12, 0  ,1)} >

                          </p>

                        </div>
                        :
                        <div></div>
                    }

                    {
                      data.map((item , index) => {

                        let subItems = [];
                        let renderItems = [];
                        let borderLineWidth = 1;
                        if(item.EmployeeRole === "Total People")
                          borderLineWidth = 0;

                        let chartX;
                        Object.keys(item.value).map(subitem=>{
                          subItems.push(item.value[subitem]);
                          if(offset[item.value[subitem].month] === undefined)
                            offset[item.value[subitem].month] = 0;
                        });

                        subItems.map((value, inx)=>{

                          chartX = offset[value.month];
                          offset[value.month] += xScale(value.ActualFteEquivalentMTD);
                          renderItems.push(
                              <div key = {`subcateory-${inx}`} >
                                <div   className="flex" align="left" >
                                  <div style={{backgroundColor:'#DDDDDD' , padding:'0px', margin:'0px'}}>
                                    <p style={formatedStyle(leftCellWidth , 12, 0 , 0 , 'pointer')}
                                      align = 'center'>
                                      {value.FteEquivalent>=0?Number(value.FteEquivalent).toFixed(1):'' }
                                    </p>
                                  </div>
                                  <div style={formatedStyle(leftCellWidth * 4, 12, 0 , 0 , 'pointer')}>
                                    <svg height={18} width={leftCellWidth * 4} >
                                      <rect x={0} y={0}  height={18} width={leftCellWidth * 4} fill="transparent" onClick={this._deSelectAll}/>
                                      <Bar
                                        x={chartX}
                                        y={0}
                                        width={xScale(value.ActualFteEquivalentMTD)}
                                        height={18}
                                        fill={this._getColor(item, value)}
                                        onClick={event => this._handleChart(event, item, value)}
                                        onMouseLeave={event => this._hideTooltip()}
                                        onMouseMove={event => this._showTooltip(event, item, value)}
                                        onTouchEnd={event => this._hideTooltip()}
                                        onTouchMove={event => this._showTooltip(event, item, value)}
                                      >
                                      </Bar>
                                      <text
                                        fontSize={12}
                                        x={chartX + xScale(value.ActualFteEquivalentMTD) + 5} y={15}
                                        textAnchor="start"
                                      >
                                      {Number(value.ActualFteEquivalentMTD).toFixed(1) }
                                      </text>
                                    </svg>
                                  </div>
                                </div>
                              </div>
                          );
                        });

                        return(
                          <div  key = {`cateory-${index}`} className="flex" align="left"
                            style={{borderBottom: `solid ${borderLineWidth}px #cdcdcd`,padding:'0px', margin:'0px' }}>
                            <p className={`grayHover`} style={formatedStyle(leftCellWidth * 2, 12, 0 , 0 , 'pointer')}
                              onClick={(event) => this._handleChart(event, item , null)}>
                              <Truncate
                                width={leftCellWidth * 2}
                                ellipsis={(
                                  <span>...</span>
                                )}
                                onTruncate={this.handleTruncate}
                              >
                                {item.EmployeeRole}
                              </Truncate>

                            </p>
                            <div style={{padding:'0px', margin:'0px'/*,borderRight: `solid 1px #cdcdcd`*/}}>
                              <div  align='center'>
                                {renderItems}
                              </div>
                            </div>
                          </div>
                        )
                      })
                    }
                    <div className="flex">
                      <div>
                        <svg height={18} width={leftCellWidth * 7} >
                          <Group  top={0} left={0}>
                            <rect
                              x={0} y={0}
                              width={leftCellWidth * 7}
                              height={1}
                              fill={'grey'}
                            />
                          </Group>
                          <Group  top={0} left={leftCellWidth * 3}>

                            <AxisBottom
                              hideTicks={false}
                              numTicks={5}
                              scale={xScale}
                              top={0}
                              stroke="black"
                              tickStroke="black"
                              tickLabelProps={(value, index) => ({
                                fontSize: 10,
                                textAnchor: 'middle',
                                dy: '-0.1em',
                              })}
                              tickComponent={({ formattedValue, ...tickProps }) => (

                                <text
                                  {...tickProps} fill={'black'}>
                                  {formattedValue}
                                </text>
                              )}
                            />
                        </Group>
                        </svg>
                      </div>
                    </div>
                </div>
              </Grid>
              {
                // ********* right bar chart *******
              }
              <Grid item md={6} sm={12} sx={12}>
                  <Typography variant="h6" className="subtitle mb-10">Utilisation (Avg. Hours Per Day: {startAvg==endAvg?startAvg:startAvg+" to " + endAvg} )</Typography>
                <div style={{paddingLeft: '10px',paddingRight: '10px'}}>

                    {
                        rightdata.length > 0?
                        <div  className="flex" align="left" style={{borderBottom: 'solid 1px #cdcdcd', }}>
                          <p style={formatedStyle(rightCellWidth , 12, 0 , 1)}>
                            Role
                          </p>
                          <p style={formatedStyle(rightCellWidth, 12, 0 , 1)} align='center'>
                            Name
                          </p>
                          <p style={formatedStyle(rightCellWidth , 12, 0  ,1)} >
                            Hours Worked
                          </p>
                          <p style={formatedStyle(rightCellWidth * 4 , 12, 0  ,1)} >
                          </p>

                        </div>
                        :
                        <div></div>
                    }

                    {
                      rightdata.map((item , index) => {

                        let subItems = [];
                        let renderItems = [];
                        let borderLineWidth = 1;
                        if(index === rightdata.length - 1)
                          borderLineWidth = 0;

                        Object.keys(item.value).map(subitem=>{
                          subItems.push(item.value[subitem]);
                          if(offset[item.value[subitem].month] === undefined)
                            offset[item.value[subitem].month] = 0;
                        });

                        subItems.map((value, inx)=>{

                          let percent = (value.ChargeableHoursWorkedMTD/value.HoursWorked) * 100;
                          renderItems.push(
                              <div key = {`subcateory-${inx}`} >
                                <div   className="flex" align="left" >
                                  <div style={formatedStyle(rightCellWidth , 12, 0 , 0 , 'pointer')}>
                                    <Truncate
                                      width={rightCellWidth}
                                      ellipsis={(
                                        <span>...</span>
                                      )}
                                      onTruncate={this.handleTruncate}
                                    >
                                      {value.EmployeeName}
                                    </Truncate>
                                  </div>
                                  <div style={formatedStyle(rightCellWidth , 12, 0 , 0 , 'pointer')}>
                                    <Truncate
                                      width={rightCellWidth}
                                      ellipsis={(
                                        <span>...</span>
                                      )}
                                      onTruncate={this.handleTruncate}
                                    >
                                      {Math.round(value.HoursWorked)}
                                    </Truncate>
                                  </div>
                                  <div style={formatedStyle(rightCellWidth * 4, 12, 0 , 0 , 'pointer')}>
                                    <svg height={18} width={rightCellWidth * 4} >
                                      <rect x={0} y={0}  height={18} width={rightCellWidth * 4} fill="transparent" onClick={this._deSelectAll}/>
                                      <Bar
                                        x={0}
                                        y={0}
                                        width={rxScale(percent)}
                                        height={18}
                                        fill={this._getColor2(item, value , 0)}
                                        onClick={event => this._handleChart2(event, item, value)}
                                        onMouseLeave={event => this._hideTooltip()}
                                        onMouseMove={event => this._showTooltip(event, item, value , false)}
                                        onTouchEnd={event => this._hideTooltip()}
                                        onTouchMove={event => this._showTooltip(event, item, value, false)}
                                      >
                                      </Bar>
                                      <Bar
                                        x={rxScale(percent)}
                                        y={0}
                                        width={rxScale(100 - percent)}
                                        height={18}
                                        fill={this._getColor2(item, value , 1)}
                                        onClick={event => this._handleChart2(event, item, value)}
                                        onMouseLeave={event => this._hideTooltip()}
                                        onMouseMove={event => this._showTooltip(event, item, value , false)}
                                        onTouchEnd={event => this._hideTooltip()}
                                        onTouchMove={event => this._showTooltip(event, item, value , false)}
                                      >
                                      </Bar>
                                    </svg>
                                  </div>
                                </div>
                              </div>
                          );
                        });

                        return(
                          <div  key = {`cateory-${index}`} className="flex" align="left"
                            style={{borderBottom: `solid ${borderLineWidth}px #cdcdcd`,padding:'0px', margin:'0px' }}>
                            <p className={`grayHover`} style={formatedStyle(rightCellWidth , 12, 0 , 0 , 'pointer')}
                              onClick={(event) => this._handleChart2(event, item , null)}>
                              <Truncate
                                width={rightCellWidth}
                                ellipsis={(
                                  <span>...</span>
                                )}
                                onTruncate={this.handleTruncate}
                              >
                                {item.EmployeeRole}
                              </Truncate>

                            </p>
                            <div style={{padding:'0px', margin:'0px'/*,borderRight: `solid 1px #cdcdcd`*/}}>
                              <div  align='center'>
                                {renderItems}
                              </div>
                            </div>
                          </div>
                        )
                      })
                    }

                    <div className="flex">
                      <div>
                        <svg height={18} width={rightCellWidth * 7 + 10} >
                          <Group  top={0} left={0}>
                            <rect
                              x={0} y={0}
                              width={rightCellWidth * 7}
                              height={1}
                              fill={'grey'}
                            />
                          </Group>
                          <Group  top={0} left={rightCellWidth * 3}>
                            <AxisBottom
                              hideTicks={false}
                              numTicks={5}
                              scale={rxScale}
                              top={0}
                              stroke="black"
                              tickStroke="black"
                              tickLabelProps={(value, index) => ({
                                fontSize: 10,
                                textAnchor: 'middle',
                                dy: '-0.1em',
                              })}
                              tickComponent={({ formattedValue, ...tickProps }) => (

                                <text
                                  {...tickProps} fill={'black'}>
                                  {formattedValue}%
                                </text>
                              )}
                            />
                        </Group>
                        </svg>
                      </div>
                    </div>

                </div>
              </Grid>
            </Grid>
        </div>

        {tooltipOpen && (
          <Tooltip
            top={tooltipTop + pageYOffset}
            left={tooltipLeft}
            style={tooltip}
          >

            {tooltipData.isLeftBar ?
              <div>
                <div className="pdv-10">
                  <strong> {tooltipData.EmployeeRole} </strong>
                </div>
              </div>
              :
              <div>
                <div className="pdv-10">
                  <strong> {tooltipData['subitem'].EmployeeName} </strong>
                </div>
                <div className="ft-14">
                  Role:&nbsp;&nbsp;&nbsp;&nbsp;<strong>{tooltipData.EmployeeRole} </strong>
                </div>
                <div className="ft-14">
                  Chargeable Hours:&nbsp;<strong>{thousandFormat(Math.round(tooltipData['subitem'].ChargeableHoursWorkedMTD)) } </strong>
                </div>
                <div className="ft-14">
                  Non-Chargeable:&nbsp;&nbsp;&nbsp;&nbsp;<strong>{Number(tooltipData['subitem'].NonChargeableHoursWorkedMTD).toFixed(1)} </strong>
                </div>
                <div className="ft-14">
                  Hours Worked:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong>{ thousandFormat(Math.round(tooltipData['subitem'].HoursWorked))} </strong>
                </div>
                <div className="ft-14">
                  &nbsp;&nbsp;
                </div>
                <div className="ft-14">
                  Percent Chargeable: <strong>{Math.round((tooltipData['subitem'].ChargeableHoursWorkedMTD/tooltipData['subitem'].HoursWorked) * 100)}%</strong>
                </div>
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
  detailData: PropTypes.object.isRequired,
  selectedYears: PropTypes.array.isRequired,
  defaultMonth: PropTypes.number.isRequired,
  defaultStartMonth: PropTypes.number.isRequired,
  updateFilter: PropTypes.func.isRequired,
  selectedTopItems: PropTypes.array.isRequired,
};

export default withStyles(styles)(withTooltip(TopChart));
