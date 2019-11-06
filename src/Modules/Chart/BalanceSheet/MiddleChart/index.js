import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import { Typography, Grid } from '@material-ui/core';

import { scaleLinear } from '@vx/scale';
import {Bar,} from '@vx/shape';
import { withTooltip, Tooltip } from "@vx/tooltip";
import { AxisBottom } from '@vx/axis';

import {
  thousandFormat,
  thousandFormat2

} from "../../../../Utils/Functions";
import {
  barThinHeight
  ,formatedStyle , positiveActiveColor,
  positiveDisableColor,
  tooltip
} from "../../../../Assets/js/constant";

import { styles } from './style';


class Collapsable_Table extends React.Component {
  state = {
    opened: false
  };

  componentDidUpdate(prevProps, prevState){

  }

  render() {
    const { state: { opened } } = this;
    let { props: { collapsableData , w1 , w2 , w3 , depth , setDepth , selectedDepth} } = this;
    let _w1 , _w2 , _w3 , offsetx;
    let _event = null;

    let _collapsableData = [];

    _w1 = w1;
    _w2 = w2;
    _w3 = w3;
    let _width = _w1 + _w2 + _w3;
    offsetx = 120;
    w1 = _w1 -  offsetx;
    depth++;
    let lineNumber = 0;
    if(!(collapsableData))
      return (<div>No Data</div>);

    return (
      <div >
          <div  id="wrapper">
            <Grid container style={{width:_width + 'px'}} >

                {Object.keys(collapsableData).map(key => {
                  lineNumber++;
                  _collapsableData = collapsableData[key];
                  if(key !== "opening" && key !== "closing" && key !== "last")
                  {
                      return(
                      <Grid item md={12} sm={12} xs={12}  key = {key} >
                      <div className={`flex`}
                       style = {{
                         'paddingTop':'2px','paddingBottom':'2px',
                        'borderLeft': 'solid ' + (depth > 1?'0':'0') + 'px #a9a9a9' ,
                        'borderTop': 'solid ' + (((lineNumber === 1 || lineNumber === 4) && depth !== 1)?'0':'1') + 'px #a9a9a9'
                        }}>

                        <p
                            {...{onClick: (event) => {


                              if(collapsableData[key]["last"] !== 1 )
                              {
                                  _event = event;
                                  if(!opened)
                                    setDepth(depth);
                                  else
                                    setDepth(depth - 1);

                                  this.setState({ opened: !opened });
                              }
                            }
                          }}
                          style={formatedStyle(_w1 , 12,0,key==="Total Liabilities"?1:0 )} className={` grayHover `} id={"Colkey" + key} >
                          {key}
                        </p>

                        {(() => {

                          if(collapsableData[key]["number"] && selectedDepth === 2)
                          {
                            return(
                                <p style={formatedStyle(30 , 12,0,key==="Total Liabilities"?1:0)} align = "right" className={`grayHover`}>
                                    {(collapsableData[key]["number"])} </p>
                              )
                          }else {
                            return(
                                <div style={formatedStyle(30 , 12,0,key==="Total Assets"?1:0)} align = "left"></div>
                              )
                          }
                        })()}

                        {(() => {

                          if(collapsableData[key]["last"] === 1 || !this.state.opened)
                          {
                            return(
                                <p style={formatedStyle(_w2 , 12,0,key==="Total Liabilities"?1:0, 'pointer')} align = "right" className={`grayHover`}>
                                    {thousandFormat(collapsableData[key]["opening"])} </p>
                              )
                          }
                        })()}

                        {(() => {

                          if(collapsableData[key]["last"] === 1 || !this.state.opened)
                          {

                            return(
                                <p style={formatedStyle(_w3, 12,0,key==="Total Liabilities"?1:0, 'pointer')} align = "right"  className={`grayHover`}>
                                    {thousandFormat(collapsableData[key]["closing"])}
                                </p> )
                          } else {

                            return(<Collapsable_Table collapsableData={_collapsableData}
                              w1={w1} w2={w2} w3={w3} depth = {depth} setDepth = {this.props.setDepth}
                              selectedDepth = {this.props.selectedDepth}
                              />)
                          }

                        })()}
                      </div>
                      </Grid>
                    )
                  }
                })}

            </Grid>
          </div>
        </div>
    );
  }
}


class Collapsable_Chart extends React.Component {

   constructor(props) {
    super(props);

    this.state = {
    opened: false,
    selectedBars: [],
    selectedValues: '',
    maxValue:-1,
    minValue:-1
    };

    this.calcAndAssin = this.calcAndAssin.bind(this);
  }

  calcAndAssin = () =>
  {
    var maxValue = 0, minValue = 0;
    var BarList = this.props.BarList;
    Object.keys(BarList).map(item => {
      if(BarList[item].props.collapsableData)
      {
        Object.keys(BarList[item].props.collapsableData).map(key => {
          if(key != "Total Liabilities" && !BarList[item].state.opened)
          {
              if((BarList[item].props.collapsableData[key]["closing"]) > maxValue )
                maxValue = BarList[item].props.collapsableData[key]["closing"];

              if((BarList[item].props.collapsableData[key]["closing"]) < minValue )
                minValue = BarList[item].props.collapsableData[key]["closing"];
          }

        });
      }

    });

     Object.keys(this.props.BarList).map(item => {
      //if(this.props.BarList[item] != this)
        this.props.BarList[item].setState({
          selectedValues: SeletectValue,
          selectedBars: SeletectBar,
          maxValue:maxValue,
          minValue:minValue
        });

    });
  }

  componentDidMount() {

    this._ismounted = true;
    this.calcAndAssin();
  }

  componentWillUnmount() {
     this._ismounted = false;
     Object.keys(this.props.BarList).map(item => {
        if(this.props.BarList[item] === this)
        {
         delete this.props.BarList[item];
        }
      });

     this.calcAndAssin();
  }

  getColor = (data) =>{
      var {selectedBars , selectedValues}= this.state;
      var color = positiveActiveColor;

      if(selectedValues == "")
        color =  positiveActiveColor;
      else
        if(selectedValues ==  data)
        {
          color =  positiveActiveColor;
        } else {

          color =  positiveDisableColor;
        }

      return color;

    };

  handleElement = (event, element , data) => {
    let exist = false

    switch (element) {
      case 'bar':
        SeletectBar.forEach(item => {
          item.classList.remove('barActive');
          if (item === event.target) exist = true;
        });

        if(exist && SeletectBar.length === 1)
        {
          SeletectBar = [];
          SeletectValue = "";
        } else {
          SeletectBar = [event.target];
          SeletectValue = data;
        }


      break;
    default:
        break;
    }

    Object.keys(this.props.BarList).map(item => {
      this.props.BarList[item].setState({
        selectedValues: SeletectValue,
        selectedBars: SeletectBar
      });

    });

  };


  render() {
    var { state: { opened , maxValue , minValue} } = this;
    var { props: { collapsableData , w1 , w2 , w3 , depth , showTooltip , hideTooltip , BarList, selectedDepth , setDepth} } = this;
    var _w1 , _w2 , _w3 , _depth , offsetx ;


    let data = {};

    data = collapsableData;
    collapsableData = [];

    _w1 = w1;
    _w2 = w2;
    _w3 = w3;
    var _width = _w1 + _w2 + _w3;
    offsetx = 120;
    w1 = _w1 -  offsetx;
    depth++;

    if(!(collapsableData))
      return (<div>No Data</div>);

    var count = 0;
    var chartWidth = (_w2 + _w3) ;

    var chartHeight = count * barThinHeight;

   var exist = false;

    Object.keys(this.props.BarList).map(item => {
        if(this.props.BarList[item] === this)
        {
          exist = true;
        }
      });

    var timestamp = (new Date()).getTime();
    if(!exist)
      this.props.BarList["list" + timestamp] = this;

    Object.keys(data).map(key => {
      if(!this.state.opened)
      {
          if((data[key]["closing"]) > maxValue )
            maxValue = data[key]["closing"];

          if((data[key]["closing"]) < minValue )
            minValue = data[key]["closing"];
      }

    });

   const xScale = scaleLinear({
      domain: [minValue, maxValue],
      range: [0, _w2 + _w3],
      nice: true
    });

    let tooltipTimeout;
    var lineNumber = 0;
    return (
      <div >
          <div  id="wrapper">
            <Grid container style={{width:_width + 'px'}} >

                {Object.keys(data).map(key => {

                  collapsableData = data[key];
                  lineNumber++;
                  if(key != "opening" && key != "closing" && key != "last")
                  {
                      return(
                      <Grid item md={12} sm={12} xs={12}  key = {key} >
                      <div className={`flex`}
                      style = {{
                        'paddingTop':'2px','paddingBottom':'2px',
                        'borderLeft': 'solid ' + (depth > 1?'0':'0') + 'px #a9a9a9' ,
                        'borderTop': 'solid ' + (((lineNumber === 1 || lineNumber === 4) && depth !== 1)?'0':'1') + 'px #a9a9a9'
                      }}>

                        <p
                            {...{onClick: (event) => {

                              if(data[key]["last"] !== 1 )
                              {
                                  this.setState({ opened: !opened });
                                  if(!opened)
                                    setDepth(depth);
                                  else
                                    setDepth(depth - 1);
                              }
                            }
                          }}
                          style={formatedStyle(_w1 - 30 , 12,0,key==="Total Liabilities"?1:0 ) } className={` grayHover `} id={"Colkey" + key} >
                          {key!=="Total Liabilities"?key:""}
                        </p>


                        {(() => {

                          if(data[key]["number"] && selectedDepth === 2)
                          {
                            return(
                                <p style={formatedStyle(30 , 12,0,key==="Total Assets"?1:0)} align = "left" className={`grayHover`}>
                                    {(data[key]["number"])}</p>
                              )
                          } else {
                            return(
                                <div style={formatedStyle(30 , 12,0,key==="Total Assets"?1:0)} align = "left" >
                                </div>
                              )
                          }
                        })()}

                        {(() => {
                          const barWidth = Math.abs(xScale(data[key]["closing"]) - xScale(0));
                          const barHeight = 18;
                          const barX = xScale(Math.min(0, data[key]["closing"]));
                          const barY = 0;
                          const lineX = xScale(0);
                          const lineY = 0;
                          const lineHeight = barHeight;
                          if(key == "Total Liabilities"){

                            return(
                              <svg width={chartWidth} height={barHeight + 10} >
                                <rect width={chartWidth} height={barHeight + 10} fill={'white'}  />
                                 <AxisBottom
                                    scale={xScale}
                                    top={0}
                                    hideAxisLine={true}
                                    stroke="black"
                                    numTicks={Math.floor((xScale(maxValue) + xScale(minValue)) / (chartWidth / 4))}
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
                              )
                          }
                          else if( (data[key]["last"] == 1 || !this.state.opened))
                          {

                            return(

                                <svg width={chartWidth} height={barHeight} >
                                <rect width={chartWidth} height={barHeight} fill={'white'}  />
                                <Bar
                                  x={barX}
                                  y={barY}
                                  width={barWidth}
                                  height={barHeight}
                                  fill={this.getColor(key)}
                                  onClick={event => {
                                    this.handleElement(event, 'bar' , key);
                                  }}
                                  onMouseMove={event => {
                                    if (tooltipTimeout) clearTimeout(tooltipTimeout);
                                      showTooltip(event, key , data[key]["opening"] , data[key]["closing"]);
                                  }}
                                  onMouseLeave={event => {
                                    tooltipTimeout = setTimeout(() => {
                                      hideTooltip();
                                    }, 300);
                                  }}
                                  onTouchMove={event => {
                                    if (tooltipTimeout) clearTimeout(tooltipTimeout);
                                    showTooltip(event, key , data[key]["opening"] , data[key]["closing"]);
                                  }}
                                  onTouchEnd={event => {
                                    tooltipTimeout = setTimeout(() => {
                                      hideTooltip();
                                    }, 300);
                                  }}
                                >
                                </Bar>
                                <Bar
                                  x={lineX}
                                  y={lineY}
                                  width={0.5}
                                  stroke={"#a9a9a9"}
                                  strokeWidth={0.5}
                                  height={lineHeight}
                                  fill={'#a9a9a9'}
                                  />
                                </svg>

                              )

                          } else {

                            return(<Collapsable_Chart
                              collapsableData={collapsableData}
                               w1 = {w1} w2  = {w2} w3 = {w3}
                               depth = {depth}  showTooltip = {showTooltip}
                               hideTooltip = {hideTooltip}  BarList = {BarList}
                               selectedDepth = {selectedDepth} setDepth = {this.props.setDepth}
                              />)
                          }

                        })()}


                      </div>
                    </Grid>
                    )
                  }
                })}

            </Grid>
          </div>
        </div>
    );
  }
}

var SeletectBar = React.createContext();
var SeletectValue = React.createContext();
//var BarList = React.createContext();


class MiddleChart extends Component {

  _isMounted = false;
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      total: [],
      collapsableData:[],
      hoverBar: null,
      BarList: {},
      directionOpening:false,
      directionClosing:false,
      selectedDepth:0,
      selectedDepthBar:0
    };

    this._prepareData = this._prepareData.bind(this);
    this.showTooltip = this.showTooltip.bind(this);
    this.hideTooltip = this.hideTooltip.bind(this);
  }

  onResize() {
    if(this._isMounted === true)
      this.setState({resize: !this.state.resize});
  }

  componentDidMount() {
    this._isMounted = true;
    this._prepareData();
    window.addEventListener('resize', this.onResize.bind(this));
  }

  componentDidUpdate(prevProps, prevState){
    if (
      prevProps.queryData !== this.props.queryData
    ) {
      if(this._isMounted === true)
        this._prepareData();
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
    window.removeEventListener('resize', this.onResize.bind(this));
  }


  _prepareData = () => {

    const { queryData } = this.props;
    let data = [];
    let _collapsableData={};

    if(queryData["Liability"])
    {
      data = queryData["Liability"];

      _collapsableData["Current Liability"] = {};
      _collapsableData["Current Liability"]["opening"] = 0;
      _collapsableData["Current Liability"]["closing"] = 0;
      _collapsableData["Current Liability"]["last"] = 0;

      _collapsableData["Non-Current Liability"] = {};
      _collapsableData["Non-Current Liability"]["opening"] = 0;
      _collapsableData["Non-Current Liability"]["closing"] = 0;
      _collapsableData["Non-Current Liability"]["last"] = 0;

      _collapsableData["Total Liabilities"] = {};
      _collapsableData["Total Liabilities"]["opening"] = 0;
      _collapsableData["Total Liabilities"]["closing"] = 0;
      _collapsableData["Total Liabilities"]["last"] = 1;

      _collapsableData["Current Liability"]["Trade Payables"]={};
      _collapsableData["Current Liability"]["Trade Payables"]["opening"] = 0;
      _collapsableData["Current Liability"]["Trade Payables"]["closing"] = 0;
      _collapsableData["Current Liability"]["Trade Payables"]["last"] = 0;

      _collapsableData["Current Liability"]["Interest Bearing Liabilities"] = {};
      _collapsableData["Current Liability"]["Interest Bearing Liabilities"]["opening"] = 0;
      _collapsableData["Current Liability"]["Interest Bearing Liabilities"]["closing"] = 0;
      _collapsableData["Current Liability"]["Interest Bearing Liabilities"]["last"] = 0;

      _collapsableData["Current Liability"]["Other Current Liabilities"] = {};
      _collapsableData["Current Liability"]["Other Current Liabilities"]["opening"] = 0;
      _collapsableData["Current Liability"]["Other Current Liabilities"]["closing"] = 0;
      _collapsableData["Current Liability"]["Other Current Liabilities"]["last"] = 0;

      data.forEach(item => {
        _collapsableData["Total Liabilities"]["opening"] += (item["OpeningBalance"]  * -1);
        _collapsableData["Total Liabilities"]["closing"] += (item["ClosingBalance"]  * -1);

        if(item["AccountType"] == "Current Liability")
        {
          _collapsableData["Current Liability"]["opening"] += (item["OpeningBalance"]  * -1);
          _collapsableData["Current Liability"]["closing"] += (item["ClosingBalance"]  * -1);

          if(item["AccountNumber"] == "2100" ||
            item["AccountNumber"] == "2101" )
          {
            _collapsableData["Current Liability"]["Trade Payables"]["opening"] += (item["OpeningBalance"]  * -1);
            _collapsableData["Current Liability"]["Trade Payables"]["closing"] += (item["ClosingBalance"]  * -1);

            _collapsableData["Current Liability"]["Trade Payables"][item["AccountName"]] = [];
            _collapsableData["Current Liability"]["Trade Payables"][item["AccountName"]]["number"] = item["AccountNumber"];
            _collapsableData["Current Liability"]["Trade Payables"][item["AccountName"]]["closing"] = (item["ClosingBalance"]  * -1);
            _collapsableData["Current Liability"]["Trade Payables"][item["AccountName"]]["opening"] = (item["OpeningBalance"]  * -1);
            _collapsableData["Current Liability"]["Trade Payables"][item["AccountName"]]["last"] = 1;
          }
          else if(item["AccountNumber"] == "2175")
          {
            _collapsableData["Current Liability"]["Interest Bearing Liabilities"]["opening"] += (item["OpeningBalance"]  * -1);
            _collapsableData["Current Liability"]["Interest Bearing Liabilities"]["closing"] += (item["ClosingBalance"]  * -1);
            _collapsableData["Current Liability"]["Interest Bearing Liabilities"][item["AccountName"]] = [];
            _collapsableData["Current Liability"]["Interest Bearing Liabilities"][item["AccountName"]]["number"] = item["AccountNumber"];
            _collapsableData["Current Liability"]["Interest Bearing Liabilities"][item["AccountName"]]["closing"] = (item["ClosingBalance"]  * -1);
            _collapsableData["Current Liability"]["Interest Bearing Liabilities"][item["AccountName"]]["opening"] = (item["OpeningBalance"]  * -1);
            _collapsableData["Current Liability"]["Interest Bearing Liabilities"][item["AccountName"]]["last"] = 1;
          }
          else
          {
            _collapsableData["Current Liability"]["Other Current Liabilities"]["opening"] += (item["OpeningBalance"]  * -1);
            _collapsableData["Current Liability"]["Other Current Liabilities"]["closing"] += (item["ClosingBalance"]  * -1);
            _collapsableData["Current Liability"]["Other Current Liabilities"][item["AccountName"]] = [];
            _collapsableData["Current Liability"]["Other Current Liabilities"][item["AccountName"]]["number"] = item["AccountNumber"];
            _collapsableData["Current Liability"]["Other Current Liabilities"][item["AccountName"]]["closing"] = (item["ClosingBalance"]  * -1);
            _collapsableData["Current Liability"]["Other Current Liabilities"][item["AccountName"]]["opening"] = (item["OpeningBalance"]  * -1);
            _collapsableData["Current Liability"]["Other Current Liabilities"][item["AccountName"]]["last"] = 1;
          }
        }
        else if(item["AccountNumber"] == "2176" || item["AccountNumber"] == "2155")
        {
          _collapsableData["Non-Current Liability"]["opening"] += (item["OpeningBalance"]  * -1);
          _collapsableData["Non-Current Liability"]["closing"] += (item["ClosingBalance"]  * -1);
          _collapsableData["Non-Current Liability"]["last"] = 0;


          _collapsableData["Non-Current Liability"][item["AccountName"]] = [];

          _collapsableData["Non-Current Liability"][item["AccountName"]]["number"] = item["AccountNumber"];
          _collapsableData["Non-Current Liability"][item["AccountName"]]["closing"] = (item["ClosingBalance"]  * -1);
          _collapsableData["Non-Current Liability"][item["AccountName"]]["opening"] = (item["OpeningBalance"]  * -1);
          _collapsableData["Non-Current Liability"][item["AccountName"]]["last"] = 1;
        }
      });
    } else {
      _collapsableData = null;
    }

    if(_collapsableData !== null)
      this.props.updateFilter({currentLiability:_collapsableData["Current Liability"]["closing"]});

    this.setState({
      collapsableData:_collapsableData
    });

  };

  showTooltip = (event, key , opening , closing, isBar = true) => {
    const { showTooltip } = this.props;
    let tooltipData, top, left;

    top = event.nativeEvent.layerY;
    left = event.clientX;



    tooltipData = [];
    tooltipData['key'] = key;
    tooltipData['opening'] = opening;
    tooltipData['closing'] = closing;
    tooltipData['isBar'] = isBar;

    if (isBar) {
      const { hoverBar } = this.state;
      if (hoverBar) hoverBar.classList.remove('barHover');
      event.target.classList.add('barHover');
      this.setState({hoverBar: event.target});
    }

    showTooltip({
      tooltipData: tooltipData,
      tooltipTop: top,
      tooltipLeft: left
    });
  };

  hideTooltip = () => {
    const { hideTooltip } = this.props;
    const { hoverBar } = this.state;

    if (hoverBar) hoverBar.classList.remove('barHover');
    this.setState({hoverBar: null});

    hideTooltip();
  };


  setDepth = (depth) => {

    this.setState({selectedDepth:depth});
  };

  setDepthBar = (depth) => {

    this.setState({selectedDepthBar:depth});
  };

  onSort(data , asc , field)
  {
    var newData = {};
    var dataList = [];
    var totalItem = null;

    if(data === undefined || data === null) return;

    Object.keys(data).map(item => {

      if(data[item][field] != undefined)
      {
        if(item.toString().includes("Total "))
        {
          totalItem = [];
          totalItem["key"] = item;
          totalItem["value"] = data[item];
        } else {
          var i = [];
          i["key"] = item;
          i["value"] = data[item];
          dataList.push(i);
        }
      }
    });

    if(dataList.length > 0)
    {
      dataList = dataList.sort((a,b) => ( (a["value"][field] - b["value"][field]) * (asc?-1:1) ));
    }

    Object.keys(data).map(item => {

      if(data[item][field] === undefined)
      {
        newData[item] = {};
        newData[item] = data[item];

      }
    });

    dataList.map((items , i) => {

      newData[items["key"]] = [];
      newData[items["key"]] = items["value"];

    });

    if(totalItem != null)
    {
      newData[totalItem["key"]] = [];
      newData[totalItem["key"]] = totalItem["value"];
    }

    return newData;
  }

  onSortOpening()
  {
    var { collapsableData ,directionOpening,selectedDepth} = this.state;

    if(selectedDepth == 1){
      collapsableData["Current Liability"]= this.onSort(collapsableData["Current Liability"] , directionOpening , "opening");
    }
    else if(selectedDepth == 0){
      collapsableData = this.onSort(collapsableData , directionOpening , "opening");
    }
    else {
      collapsableData["Current Liability"]["Trade Payables"]
       = this.onSort(collapsableData["Current Liability"]["Trade Payables"] , directionOpening , "opening");
      collapsableData["Current Liability"]["Other Current Liabilities"]
       = this.onSort(collapsableData["Current Liability"]["Other Current Liabilities"] , directionOpening , "opening");

    }
    directionOpening = !directionOpening;
    this.setState({collapsableData:collapsableData,directionOpening:directionOpening});

  }

  onSortClosing()
  {
    var { collapsableData ,directionClosing,selectedDepth} = this.state;

   if(selectedDepth == 1){
      collapsableData["Current Liability"]= this.onSort(collapsableData["Current Liability"] , directionClosing , "closing");
    }
    else if(selectedDepth == 0){
      collapsableData = this.onSort(collapsableData , directionClosing , "closing");
    }
    else {
      collapsableData["Current Liability"]["Trade Payables"]
       = this.onSort(collapsableData["Current Liability"]["Trade Payables"] , directionClosing , "closing");
      collapsableData["Current Liability"]["Other Current Liabilities"]
       = this.onSort(collapsableData["Current Liability"]["Other Current Liabilities"] , directionClosing , "closing");

    }


    directionClosing = !directionClosing;
    this.setState({collapsableData:collapsableData,directionClosing:directionClosing});

  }

  render() {
    const {
      classes,
      queryData, dimDate, tooltipOpen, tooltipLeft, tooltipTop, tooltipData
    } = this.props;

    const height = (window.innerHeight - 100) / 5;
    const width = window.innerWidth / 2;
    const xMax = width;
    var { collapsableData , BarList , directionClosing , directionOpening , selectedDepth , selectedDepthBar} = this.state;
    SeletectBar = [];
    SeletectValue = "";

    var w1 , w2, w3, depth;
    w1 = width * 0.6;
    w2 = width * 0.18;
    w3 = width * 0.18;
    depth = 0;

    return (

      <div className={classes.root}>

        <div>
          <Typography variant="h6" className="subtitle mb-10">Liabilities</Typography>
          <div >
            <Grid container >
              <Grid item md={6} sm={6} xs={6} >
                <div className={`flex`} >
                  <p style={formatedStyle(w1 , 12 , 0 , 1)} >
                        &nbsp;
                  </p>
                  <p
                    {...{onClick: (event) => {
                      this.onSortOpening();
                      }
                    }}

                  style={formatedStyle(w2, 12, 0 , 1 , 'pointer')} align = "right">
                       Opening Balance
                       <svg  width={18} height={18} viewBox="0 0 24 24">
                       {directionOpening?(<path d="M7 14l5-5 5 5z" />):(<path d="M7 10l5 5 5-5z" />)}
                       </svg>

                  </p>
                  <p
                  {...{onClick: (event) => {
                      this.onSortClosing();
                      }
                    }}
                  style={formatedStyle(w3 , 12, 0 , 1,'pointer')} align = "right">
                       Closing Balance
                       <svg  width={18} height={18} viewBox="0 0 24 24">
                       {directionClosing?(<path d="M7 14l5-5 5 5z" />):(<path d="M7 10l5 5 5-5z" />)}
                       </svg>
                  </p>
                </div>
              </Grid>
            </Grid>

            <Grid container style={{'paddingTop':'5px'}}>
              <Grid item md={6} sm={6} xs={6} className={`well classes.collapse_icon`}
                    style={{overflowX:'hidden' ,maxHeight:`${height}px`,minHeight:`${height}px`, paddingLeft:'1px'}}>

                {
                  (collapsableData === undefined || collapsableData == null)?("No Data"):(
                      <Collapsable_Table collapsableData={collapsableData}
                      w1 = {w1}  w2 = {w2}  w3 = {w3}
                      depth = {depth}
                      setDepth = {this.setDepth}
                      selectedDepth = {selectedDepth}
                     />
                    )
                }

              </Grid>

              <Grid item md={6} sm={6} xs={6} className={` well`}
                    style={{overflowX:'hidden' ,maxHeight:`${height}px`,minHeight:`${height}px`, paddingLeft:'1px'}}>
                {tooltipOpen && (
                  <Tooltip
                    top={ tooltipTop}
                    left={tooltipLeft}
                    style={tooltip}
                  >
                {
                  <div >
                    <div className="pdv-5"><strong>{tooltipData['key']}&nbsp; &nbsp;  </strong></div>
                    <div className="ft-12">Open Balance: {thousandFormat2(tooltipData['opening'])}</div>
                    <div className="ft-12">Close Balance: {thousandFormat2(tooltipData['closing'])}</div>
                    <div className="ft-12">Change: {thousandFormat2(tooltipData['closing'] - tooltipData['opening'])}</div>
                  </div>

                }
                  </Tooltip>
                )}
                {
                  (collapsableData === undefined || collapsableData == null)?("No Data"):(
                      <Collapsable_Chart collapsableData = {collapsableData} w1 = {w1} w2 = {w2} w3 = {w3} depth = {depth}
                      showTooltip = {this.showTooltip} hideTooltip = {this.hideTooltip} BarList = {BarList}
                      selectedDepth = {selectedDepthBar} setDepth={this.setDepthBar}
                      />
                    )
                }



              </Grid>
            </Grid>

          </div>
        </div>
      </div>
    );
  }
}


MiddleChart.propTypes = {
  classes: PropTypes.object.isRequired,

  dimDate: PropTypes.string.isRequired,

  queryData: PropTypes.object.isRequired,

  handleFilter: PropTypes.func.isRequired,

  updateFilter: PropTypes.func.isRequired,
};

export default withStyles(styles)(withTooltip(MiddleChart));
