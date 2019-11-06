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
const xSelector = d => d.month;
const ySelector = d => d.CashBalance;

class TopChart extends Component {

  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = {
      resize: false,

      hoverBar: null,
      selectedBars: [],
      savedLeftItems: [],
      linedata: [],
      data: [],
      selectedLines: [],
      lineClicked: false,
      lineColor: []
    };

    this._prepareData = this._prepareData.bind(this);
    this._deSelectAll = this._deSelectAll.bind(this);
  }

  _onResize() {
    if(this._isMounted === true)
      this.setState({resize: !this.state.resize,selectedLines:[]});
  }

  componentDidMount() {
    this._isMounted = true;
    window.addEventListener('resize', this._onResize.bind(this));

  }

  componentDidUpdate(prevProps, prevState){
    if (
      prevProps.summaryData.length !== this.props.summaryData.length ||
      prevProps.selectedTopItems !== this.props.selectedTopItems ||
      prevProps.selectedLeftItems !== this.props.selectedLeftItems ||
      prevProps.selectedRightItems !== this.props.selectedRightItems ||
      prevProps.choice !== this.props.choice )
    {
          if(this._isMounted === true)
          {
            if(prevProps.selectedLeftItems !== this.props.selectedLeftItems)
              this.setState({selectedLines:[]});
            this._prepareData();
          }
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
    window.removeEventListener('resize', this._onResize.bind(this));
  }

  _prepareData = () => {
    let { summaryData, selectedYears , selectedTopItems, selectedLeftItems, selectedRightItems, choice, defaultStartMonth} = this.props;
    let {savedLeftItems} = this.state;
    let selectedMonths = selectedRightItems;
    let dictData = {} , _dictData = {};
    let data = [];
    let linedata = [];
    let _achived = 0  , _allachived = 0;

    if(summaryData.length === 0)
      return;

    //console.log(financialMonth(1, defaultStartMonth) - 1);
    let _linedata = {};
    let bFilter = false;
    // getting left barchart data
    summaryData.forEach( item => {
      let month = getMonth(item.Date);

      //if(selectedMonths.indexOf(month) > -1 )
      {
        let key = "";
        let Outcome = "Achieved";
        if( item.Result > (item.Target + item.Target * (item.Upper / 100)) )
          Outcome = "Achieved";
        else if(item.Result > (item.Target - item.Target * (item.Lower / 100)))
          Outcome = "Not Achieved";
        else
          Outcome = "Neutral";

        if(choice === "Group")
        {
          key = item.Category;
        }
        else if(choice === "Result")
        {
          if(Outcome === "Neutral")
            key = "Neutral";
          else if(Outcome === "Achieved")
            key = "Good";
          else
            key = "Bad";
        }
        else if(choice === "Importance")
        {
          key = item.Priority;
        }

        // selected items filter
        bFilter = false;
        if(selectedTopItems.length === 0)
        {
            bFilter = true;
        }
        else
        {
            selectedTopItems.map(selected =>{
              if(selected.key === key)
                bFilter = true;
              else if(selected.key === 'Total')
                bFilter = true;
            })
        }

        if(bFilter === true)
        {
            let importance = "";
            if(item.Priority.indexOf("Low") > -1) importance = "Low";
            if(item.Priority.indexOf("High") > -1) importance = "High";
            if(item.Priority.indexOf("Medium") > -1) importance = "Medium";
            if(item.Priority.indexOf("Critical") > -1) importance = "Critical";

            if(selectedMonths.indexOf(month) > -1)
            {
              if(_dictData[key] === undefined)
              {
                _dictData[key] = {};
                _dictData[key]['key'] = key;
                _dictData[key]['month'] = month;
                _dictData[key]['value'] = {};
              }

              if(_dictData[key]['value'][item.Name] === undefined)
              {
                _dictData[key]['value'][item.Name] = {};
                _dictData[key]['value'][item.Name]['Name'] = item.Name;
                _dictData[key]['value'][item.Name]['Importance'] = importance;
                _dictData[key]['value'][item.Name]['Result'] = item.Result;
                _dictData[key]['value'][item.Name]['Target'] = item.Target;
                _dictData[key]['value'][item.Name]['Enable'] = item.Enable;
                _dictData[key]['value'][item.Name]['DisplayFormat'] = item.DisplayFormat;
                _dictData[key]['value'][item.Name]['DesiredOutcome'] = item.DesiredOutcome;
                _dictData[key]['value'][item.Name]['Outcome'] = Outcome==="Achieved"?1:Outcome==="Not Achieved"?-1:0;
                // 0: start 1:up -1:down 2:equal
                _dictData[key]['value'][item.Name]['Direction'] =
                  (dictData[key] === undefined || dictData[key]['value'] === undefined || dictData[key]['value'][item.Name] === undefined)?0:
                  dictData[key]['value'][item.Name].Result>item.Result?-1:item.Result===0?2:1;
                // this line is ensure that selected left chart value remains until the value changes
                if(savedLeftItems.length === 0)
                {
                  savedLeftItems = [item.Name];
                }
              }

              if(Outcome === "Achieved")
                _achived++;
              _allachived++;
            }

            if(dictData[key] === undefined)
            {
              dictData[key] = {};
              dictData[key]['key'] = key;
              dictData[key]['month'] = month;
              dictData[key]['value'] = {};
            }

            if(dictData[key]['value'][item.Name] === undefined)
            {
              dictData[key]['value'][item.Name] = {};
            }

            dictData[key]['value'][item.Name]['Name'] = item.Name;
            dictData[key]['value'][item.Name]['Importance'] = importance;
            dictData[key]['value'][item.Name]['Result'] = item.Result;
            dictData[key]['value'][item.Name]['Target'] = item.Target;
            dictData[key]['value'][item.Name]['Enable'] = item.Enable;
            dictData[key]['value'][item.Name]['DisplayFormat'] = item.DisplayFormat;
            dictData[key]['value'][item.Name]['DesiredOutcome'] = item.DesiredOutcome;
            dictData[key]['value'][item.Name]['Outcome'] = Outcome==="Achieved"?1:Outcome==="Not Achieved"?-1:0;

        }
      }
    });

    Object.keys(_dictData).map((key , index)=> {
      data.push(_dictData[key]);
    });

    data.sort((a,b)=> {
      if(b.key.toLowerCase() > a.key.toLowerCase()) return -1;
      if(b.key.toLowerCase() < a.key.toLowerCase()) return 1;
      return 0;
    });

    let printf = require('printf');
    let _lineColor = [];
    _lineColor[0] = '#868686'
    // getting right linechart data
    summaryData.forEach( item => {
      let month = getMonth(item.Date);
      if(savedLeftItems.indexOf(item.Name) > -1)
      {
        let Outcome = "Achieved";
        if( item.Result > (item.Target + item.Target * (item.Upper / 100)) )
          Outcome = "Achieved";
        else if(item.Result > (item.Target - item.Target * (item.Lower / 100)))
          Outcome = "Not Achieved";
        else
          Outcome = "Neutral";

        if(Outcome === 'Achieved')
        {
          _lineColor[0] = '#8dc63f'
        }

        if(_linedata[month] === undefined)
        {
          _linedata[month] = {};
          _linedata[month]['month'] = month;
          _linedata[month]['Result'] = Number((item.Result).toFixed(2));
          _linedata[month]['Target'] = Number((item.Target).toFixed(2));
        } else {
          _linedata[month]['Result'] += item.Result;
          _linedata[month]['Target'] += item.Target;
          _linedata[month]['Result'] = Number((_linedata[month]['Result']).toFixed(2));
          _linedata[month]['Target'] = Number((_linedata[month]['Target']).toFixed(2));
        }
      }
    });

    let fiscalMonths = getMonths(this.props.defaultStartMonth);

    fiscalMonths.forEach(month => {
      if(_linedata[month] !== undefined)
        linedata.push(_linedata[month]);
    });

    this.setState({
      savedLeftItems:savedLeftItems,
      data:data,
      linedata: linedata,
      lineColor:_lineColor
    });
  };

  _deSelectAll = () => {
      this.setState({
      hoverBar: null,
    });

    this.props.updateFilter({
      selectedLeftItems: [],
    });
  };

    _showTooltip = (event, xScale, yScale, isBar = true) => {
      if (tooltipTimeout) clearTimeout(tooltipTimeout);
      const {linedata} = this.state;
      const { showTooltip } = this.props;
      let data = {}, top, left , pTop , pLeft;

      let tmpX = [] ;
      if(linedata.length === 0)
        return;

      const { x , y} = localPoint(event);
      linedata.forEach(item => {
          tmpX.push( {'month':item.month, 'value': item,'xPos':xScale(item.month) + 50});
      });

      let _x = x - xScale.step()/2;
      tmpX.sort( (a , b) => ( Math.abs(_x - a.xPos) - Math.abs(_x - b.xPos)));
      pLeft = (tmpX?tmpX[0].xPos:0) + xScale.step()/2;
      pTop = (tmpX?yScale(tmpX[0].value.Result):0) ;

      top = event.clientY - 480;
      left = event.clientX;
      data = tmpX[0];

      data['pLeft']   = pLeft;
      data['pTop']    = pTop;
      data['isBar']   = isBar;

      this.setState({lineClicked: false});

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

  _handleChart = (event, value , key) => {
    const { selectedLeftItems } = this.props;
    const { selectedBars, savedLeftItems } = this.state;
    let _selectedLeftItems , _selectedBars , _savedLeftItems = [];

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
          const {data} = this.state;
          // includes all names
          data.map(d => {
            if(d.key === key)
            {
              Object.keys(d.value).map(subd=>{
                _selectedLeftItems.push({key: key , Name: d.value[subd].Name});
                if(_savedLeftItems.length === 0)
                  _savedLeftItems = [d.value[subd].Name];
              })
            }
          })

        }else{
          _selectedLeftItems.push({key: key , Name: value.Name});

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
          const {data} = this.state;
          data.map(d => {
            if(d.key === key)
            {
              Object.keys(d.value).map(subd=>{
                _selectedLeftItems.push({key: key , Name: d.value[subd].Name});

              })
            }
          })
        }
        else
        {
          _selectedLeftItems = [{key: key , Name: value.Name}];
        }
        _selectedBars = [event.target];
        event.target.classList.add('barActive');
      }
    }

    _selectedLeftItems.map(d=>{
      _savedLeftItems.push(d.Name);
    });

    this.setState({
      selectedBars: _selectedBars,
      savedLeftItems:_savedLeftItems
    });

    this.props.updateFilter({
      selectedLeftItems: _selectedLeftItems
    });

  };

  _getColor = (item , key , type='chart') => {
    const {selectedLeftItems } = this.props;

    let activeColor = "black";
    let disableColor = "grey";
    if(type == 'arrow')
    {
      if(item.Outcome === 1)
      {
        activeColor = "#868686";
        disableColor = "#dfdfdf";
      } else if(item.Outcome === -1)
      {
        activeColor = "#8dc63f";
        disableColor = "#e0ebd2";
      } else {
        activeColor = "#8dc63f";
        disableColor = "#e0ebd2";
      }
    }
    else
    {
      if(item.Outcome === 1)
      {
        activeColor = "#8dc63f";
        disableColor = "#e0ebd2";
      } else if(item.Outcome === -1)
      {
        activeColor = "#868686";
        disableColor = "#dfdfdf";
      } else {
        activeColor = "#e9f323";
        disableColor = "#f1f3cd";
      }
    }


    if (selectedLeftItems.length === 0 )
    {
      return activeColor;
    }

    for (let i = 0; i < selectedLeftItems.length ; i++) {
      if (selectedLeftItems[i].Name === item.Name && selectedLeftItems[i].key === key)
      {
        return activeColor;
      }
    }

    return disableColor;
  };

  _handleLineSelect = (event,  xScale, yScale) => {
    let { lineClicked , selectedLines, linedata } = this.state;
    let { selectedRightItems,  cashflowMiddleRequest , cashflowBottomRequest} = this.props;

    let selected = [] ;
    let fiscalMonths = getMonths2( this.props.defaultMonth, this.props.defaultStartMonth);

    if(linedata.length === 0 )
      return;

    const { x , y} = localPoint(event);
    linedata.forEach(item => {
      //if(fiscalMonths.indexOf(item.month) > -1 )
        selected.push( {'month':item.month, 'value': item ,'xPos':xScale(item.month) + 50});
    });

    let _x = x - xScale.step()/2;
    selected.sort( (a , b) => ( Math.abs(_x - a.xPos) - Math.abs(_x - b.xPos)));

    let left = (selected?selected[0].xPos:0) + xScale.step()/2;
    let top = (selected?yScale(selected[0].value.Result):0) ;

    if (event.shiftKey) {
      selectedRightItems = selectedRightItems.slice();
      selectedLines = selectedLines.slice();
      let index = NaN;
      for (let i = 0; i < selectedRightItems.length; i++) {
        if (selectedRightItems[i] === selected[0].month ) {
          index = i;
          break;
        }
      }

      if (isNaN(index)) {
        selectedRightItems.push(selected[0].month);
        selectedLines.push({'month':selected[0].month ,
          'left':left, 'top':top});
      } else {
        selectedRightItems.splice(index, 1);
        selectedLines.splice(index, 1);
      }

    } else {
      selectedRightItems = [];
      selectedLines = [];
      selectedRightItems.push(selected[0].month);
      selectedLines.push({'month':selected[0].month ,
        'left':left, 'top':top});
    }


    this.setState({lineClicked: !lineClicked , selectedLines:selectedLines});

    this.props.updateFilter({
      selectedRightItems: selectedRightItems,
    });

  };

  render() {
    const {
      classes,
      tooltipOpen, tooltipTop, tooltipLeft, tooltipData,
      selectedLeftItems
    } = this.props;
    let { data, savedLeftItems, linedata, selectedLines, lineColor } = this.state;
    let trendLabels = "";
    const width = window.innerWidth - 15;
    const height = (window.innerHeight ) * 3 / 5;
    const margin = {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10
    };

    const { pageYOffset, xMax, yMax } = getParams(window, width, height, margin);

    let leftWidth = width * 7 / 12;
    let rightWidth = (xMax - 10) * 5 / 12;
    let leftCellWidth = (leftWidth * 2 / 3 )/ 6;
    let leftChartWidth = leftWidth * 1 / 3;
    // scales
    let keySelector = d => d.month;
    let lineMin = 0 , lineMax = 0 , lineTarget;
    let xScale = scaleBand({
      domain: linedata.map(keySelector),
      rangeRound: [0, rightWidth - 50],
      padding: 0.2,
      nice : true
    });
    linedata.map(d=>{
      lineMin = Math.min(lineMin, d.Result);
      lineMax = Math.max(lineMax, d.Result);
      lineTarget = d.Target;
    });

    let fiscalMonths = getMonths2( this.props.defaultMonth, this.props.defaultStartMonth);
    let validMonths = [];
    linedata.forEach( (d , k)=> {
      if(d.value !== 0 && fiscalMonths.indexOf(d.month) > -1)
        validMonths[k] = d;
    });

    let yScale = scaleLinear({
      domain: [lineMin * 1.2 , lineMax * 1.2],
      range: [yMax - 30 , 10],
      nice: true
    });

    let xSelector = d => d.month
    let ySelector = d => d.Result;
    let reg = new RegExp('/,/g');

    return (
      <div className={classes.root} >
        <div>
          <Typography variant="h6" className="subtitle mb-10"></Typography>
        </div>

        <div >
            <Grid container  >
              <Grid item md={7} sm={7} sx={7} >
                <div className="relative" style={{maxHeight:`${height}px` ,overflowY:'auto'}}>
                    <div  className="flex" align="left" style={{borderBottom: 'solid 1px #cdcdcd', }}>
                      <p style={formatedStyle(leftCellWidth, 12, 0 , 1)}>
                        Category
                      </p>
                      <p style={formatedStyle(leftCellWidth * 2, 12, 0 , 1)} >
                        Name
                      </p>
                      <p style={formatedStyle(leftCellWidth, 12, 0  ,1)} >
                        Importance
                      </p>
                      <p style={formatedStyle(leftCellWidth, 12, 0, 1)} >
                        Result
                      </p>
                      <p style={formatedStyle(leftCellWidth, 12, 0, 1 )} >
                        Target
                      </p>
                    </div>
                    {
                      data.map((item , index) => {

                        let subItems = [];
                        let renderItems = [];
                        Object.keys(item.value).map(subitem=>{
                          subItems.push(item.value[subitem]);
                        });

                        subItems.map((value, inx)=>{

                          renderItems.push(
                            <div key = {`subcateory-${inx}`} >
                              <div   className="flex" align="left" >
                                <div   className={inx%2===0?`classes.rows grayHover`:`classes.rows tableColor1 grayHover`} >
                                    <div   className="flex" align="left" >
                                      <p   style={formatedStyle(leftCellWidth * 2, 12, 0 , 0 , 'pointer')}
                                        onClick={(event) => this._handleChart(event, value , item.key)}
                                        >
                                        <Truncate
                                          width={leftCellWidth * 2}
                                          ellipsis={(
                                            <span>...</span>
                                          )}
                                          onTruncate={this.handleTruncate}
                                        >
                                          {value.Name}
                                        </Truncate>

                                      </p>
                                      <p style={formatedStyle(leftCellWidth, 12, 0 , 0 , 'pointer')}
                                        onClick={(event) => this._handleChart(event, value , item.key)}
                                        >
                                        {value.Importance}
                                      </p>
                                      <p  style={formatedStyle(leftCellWidth, 12, 0 , 0 , 'pointer')}
                                        onClick={(event) => this._handleChart(event, value , item.key)}
                                        >
                                        {value.DisplayFormat==='Dollars'?thousandFormat2(value.Result):value.DisplayFormat==='Days'?Math.round(value.Result):value.Result}
                                        {value.DisplayFormat==='Percent'?"%":value.DisplayFormat==='Days'?" days":""}
                                      </p>
                                      <p  style={formatedStyle(leftCellWidth, 12, 0 , 0 , 'pointer')}
                                        onClick={(event) => this._handleChart(event, value , item.key)}
                                        >
                                        {value.DisplayFormat==='Dollars'?thousandFormat2(value.Target):value.DisplayFormat==='Days'?Math.round(value.Target):value.Target}
                                        {value.DisplayFormat==='Percent'?"%":""}
                                      </p>
                                    </div>
                                  </div>

                                  <div  style={{marginTop:'1px', borderLeft: 'solid 1px #cdcdcd', }} align="center" >
                                    <div  style={formatedStyle(leftChartWidth, 13, 0 ,0 , 'pointer')} className={inx%2===0?`classes.rows`:`classes.rows tableColor1`}>
                                      <svg width={leftChartWidth} height={18}>
                                        <Group top={0} left={0}>
                                          <rect x={leftChartWidth / 4} y={0}
                                            width={leftChartWidth / 2 } height={18}
                                            fill={this._getColor(value , item.key)}
                                            onClick={(event) => this._handleChart(event, value , item.key)}
                                            />
                                          <svg width={leftChartWidth} height={18}>
                                            <Group top={2} left={leftChartWidth / 2}>
                                              <g transform="scale(0.0135 0.016) "
                                                fill={'black'}
                                                onClick={(event) => this._handleChart(event, value , item.key)}
                                                >
                                                {
                                                  value.Direction===2?
                                                  <path  d="M992 512l-480-480v288h-512v384h512v288z"/>
                                                  :value.Direction===1?
                                                  <path d="M288 0l256 256-544 544 224 224 544-544 256 255.998v-735.998h-736z"></path>
                                                  :value.Direction===0?
                                                  <path d="M512 0c-282.77 0-512 229.23-512 512s229.23 512 512 512 512-229.23 512-512-229.23-512-512-512zM512 896c-212.078 0-384-171.922-384-384s171.922-384 384-384c212.078 0 384 171.922 384 384s-171.922 384-384 384z"></path>
                                                  :<path d="M1024 288l-256 256-544-544-224 224 544 544-255.998 256h735.998v-736z" ></path>
                                                }
                                              </g>
                                              <g transform="scale(0.0135 0.015) "
                                                fill={this._getColor(value , item.key , 'arrow')}
                                                onClick={(event) => this._handleChart(event, value , item.key)}
                                                >
                                                {
                                                  value.Direction===2?
                                                  <path  d="M992 512l-480-480v288h-512v384h512v288z"/>
                                                  :value.Direction===1?
                                                  <path d="M288 0l256 256-544 544 224 224 544-544 256 255.998v-735.998h-736z"></path>
                                                  :value.Direction===0?
                                                  <path d="M512 0c-282.77 0-512 229.23-512 512s229.23 512 512 512 512-229.23 512-512-229.23-512-512-512zM512 896c-212.078 0-384-171.922-384-384s171.922-384 384-384c212.078 0 384 171.922 384 384s-171.922 384-384 384z"></path>
                                                  :<path d="M1024 288l-256 256-544-544-224 224 544 544-255.998 256h735.998v-736z" ></path>
                                                }
                                              </g>
                                            </Group>

                                          </svg >
                                        </Group>
                                      </svg>

                                    </div>
                                  </div>

                                </div>
                            </div>
                          )
                        });

                        return(
                          <div  key = {`cateory-${index}`} className="flex" align="left" style={{borderBottom: 'solid 1px #cdcdcd', }}>
                            <p className={`grayHover`} style={formatedStyle(leftCellWidth, 12, 0 , 0 , 'pointer')}
                              onClick={(event) => this._handleChart(event, null , item.key)}
                              >
                              {
                                // left colume
                              }
                              <Truncate
                                width={leftCellWidth}
                                ellipsis={(
                                  <span>...</span>
                                )}
                                onTruncate={this.handleTruncate}
                              >
                                {item.key}
                              </Truncate>

                            </p>

                            <div style={{borderRight: 'solid 1px #cdcdcd'}} >
                              <Grid container>
                                <Grid item md={12} sm={12} xs={12}>
                                  {
                                    // right colume
                                  }
                                  {renderItems}
                                </Grid>
                              </Grid>
                            </div>

                          </div>
                        )
                      })
                    }


                </div>
              </Grid>
              <Grid item md={5} sm={5} sx={5}>
                <div style={{paddingLeft:'15px'}}>
                  <Typography variant="h6" className="subtitle mb-10">
                    {
                      selectedLeftItems.map(d=>{
                        trendLabels = trendLabels + " " + d.Name;
                      })
                    }
                    <Truncate
                      width={rightWidth}
                      ellipsis={(
                        <span>... {savedLeftItems.length} items</span>
                      )}
                      onTruncate={this.handleTruncate}
                    >
                      Trend - {trendLabels===''?savedLeftItems:trendLabels}
                    </Truncate>

                  </Typography>

                  <div style={{margin:`0px`}}>
                    <svg width={rightWidth} height={yMax}>
                      <Group top={5} left={0}>

                        <LinePath
                          data={validMonths}
                          //curve={curveBasis}
                          x={ (d => xScale(xSelector(d)) + xScale.step()/2 + 50) }
                          y={d => yScale(ySelector(d))}
                          strokeWidth={8}
                          stroke={lineColor}
                          strokeLinecap="round"
                          fill="transparent"
                          />
                          <Bar
                            x={50}
                            y={10}
                            width={rightWidth}
                            height={yMax}
                            fill="transparent"
                            onMouseMove={event => {
                              if (tooltipTimeout) clearTimeout(tooltipTimeout);
                              this._showTooltip(
                                event,
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
                              this._handleLineSelect(event, xScale , yScale);
                            }}
                          />

                          {tooltipOpen &&(
                            <g>
                              <circle
                                cx={tooltipData.pLeft}
                                cy={tooltipData.pTop}
                                r={8}
                                fill={positiveActiveColor}
                                stroke="black"
                                strokeWidth={2}
                                style={{ pointerEvents: "none" }}
                              />
                            </g>
                          )}

                          {
                            selectedLines.map((d , i)=> {
                              let radius = 0;
                              let strokeWidth = 0;
                              radius = 8;
                              strokeWidth = 3;

                              return(
                                <g key={`circle-${i}`}>
                                  <circle
                                    cx={d.left}
                                    cy={d.top}
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
                        <text
                          x={52} y = { isNaN(yScale(lineTarget))?0:(yScale(lineTarget)- 10)}
                          fill={'black'} fontSize = {10}>
                        Target
                        </text>

                        <LinePath
                          data={[{'x':50,'y':isNaN(yScale(lineTarget))?0:yScale(lineTarget)},
                                {'x':rightWidth,'y':isNaN(yScale(lineTarget))?0:yScale(lineTarget) }]}
                          x={d=> d.x}
                          y={d=> d.y}
                          stroke={"#555555"}
                          strokeDasharray="5,5"
                          />


                        <AxisLeft
                          left={50}
                          hideTicks={false}
                          scale={yScale}
                          stroke="black"
                          tickStroke="black"
                          numTicks={5}
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
                              {/*Number(formattedValue.toString().replace(/,/g,''))>1000000?
                                (Math.round(Number(formattedValue.toString().replace(/,/g,''))/1000000) + 'M'):*/
                                Number(formattedValue.toString().replace(/,/g,''))>1000?
                                (Math.round(Number(formattedValue.toString().replace(/,/g,''))/1000) + 'K'):
                                formattedValue}
                            </text>
                          )}
                        />

                        <AxisBottom
                          hideTicks={true}
                          width={rightWidth}
                          numTicks={12}
                          scale={xScale}
                          top={yMax - 30}
                          left={50}
                          stroke="black"
                          tickStroke="black"
                          tickLabelProps={(value, index) => ({
                            fontSize: 11,
                            textAnchor: 'middle',
                            dy: '-0.5em',
                          })}
                          tickComponent={({ formattedValue, ...tickProps }) => (
                            <text
                              {...tickProps} fill={'black'}
                            >

                            {enMonths[formattedValue]}

                            </text>
                          )}
                        />

                      </Group>
                    </svg>
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

            {tooltipData.isBar ?
              <div>
                <div className="pdv-10">
                  Month of Period as Date <strong>{enMonths[(tooltipData.month)]}</strong>
                </div>
                <div className="ft-12">
                  Result <strong>{thousandFormat(tooltipData.value.Result)}</strong>
                </div>
                <div className="ft-12">
                  Target <strong>{thousandFormat(tooltipData.value.Target)}</strong>
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
  summaryData: PropTypes.array.isRequired,
  selectedYears: PropTypes.array.isRequired,
  defaultMonth: PropTypes.number.isRequired,
  defaultStartMonth: PropTypes.number.isRequired,
  updateFilter: PropTypes.func.isRequired,
  selectedTopItems: PropTypes.array.isRequired,
  selectedLeftItems: PropTypes.array.isRequired,
  selectedRightItems: PropTypes.array.isRequired,
  choice:PropTypes.string.isRequired,
};

export default withStyles(styles)(withTooltip(TopChart));
