import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import {
  Typography, FormControl,
  NativeSelect,Grid
} from '@material-ui/core'

import { BarStackHorizontal} from '@vx/shape';
import { withTooltip, Tooltip } from "@vx/tooltip";
import { AxisBottom } from '@vx/axis'
import { scaleBand, scaleLinear, scaleOrdinal } from '@vx/scale';

import {
  thousandFormat2, thousandFormat
} from "../../../../Utils/Functions";
import {
  positiveActiveColor,
  positiveDisableColor,
  negativeActiveColor,
  negativeDisableColor,
  minusActiveColor,
  minusDisableColor,
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
      PageOffset: 0 ,
      data: [],
      showFilter:'showall',
      sortFilter:'sortbyprofit',
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
      prevProps.detailData.length !== this.props.detailData.length
      || prevProps.filterName !== this.props.filterName
      || prevProps.selectedTopItems !== this.props.selectedTopItems
      || prevState.showFilter !== this.state.showFilter
      || prevState.sortFilter !== this.state.sortFilter
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
    const { detailData , profitType , profitSubType , selectedTopItems} = this.props;
    const { showFilter , sortFilter} = this.state;
    let data = [] , _data = [], maxData = 0 , minData = 0;

    if(detailData)
    {
        let _item = {};

        detailData.forEach(item => {

          _item = {};
          _item = item;

          var isInTypeFilter = false;
          var isInShowFilter = false;
          if(item.Director != null && item.DirectorInitials != null)
          {
            if(selectedTopItems )
              selectedTopItems.forEach(filter => {
                switch (profitType) {
                  case "Director":
                    {
                      if(item.Director)
                      {
                          if(item.Director === filter)
                            isInTypeFilter = true;
                      }
                    }
                    break;
                  case "ProjectManager":
                    {
                      if(item.ProjectManager)
                      {
                          if(item.ProjectManager === filter)
                            isInTypeFilter = true;
                      }
                    }
                    break;
                  case "ProjectTypeDescription":
                    {
                      if(item.ProjectTypeDescription)
                      {
                          if(item.ProjectTypeDescription === filter)
                            isInTypeFilter = true;
                      }
                    }
                    break;
                  case "ProjectSubTypeDescription":
                    {
                      if(item.ProjectSubTypeDescription)
                      {
                          if(item.ProjectSubTypeDescription === filter)
                            isInTypeFilter = true;
                      }
                    }
                    break;
                  case "ClientName":
                    {
                      if(item.ClientName)
                      {
                          if(item.ClientName === filter)
                            isInTypeFilter = true;
                      }
                    }
                    break;
                  case "Project":
                    {
                      if(item.ProjectName)
                      {
                          if(item.ProjectName === filter)
                            isInTypeFilter = true;
                      }
                    }
                    break;
                  default:
                    isInTypeFilter = true;
                }
              });
              if(!selectedTopItems || selectedTopItems.length === 0)
                 isInTypeFilter = true;

              if(isInTypeFilter)
                switch (showFilter) {

                  case "showprofit":
                    {
                      if(profitSubType === "YTD")
                      {
                        if(_item.ActualProfitYTD >= 0){
                          isInShowFilter = true;
                          maxData = Math.max(maxData , item.ActualProfitYTD , item.ActualFeesInvoicedYTD);
                          minData = Math.min(minData , item.ActualProfitYTD , item.ActualFeesInvoicedYTD);
                        }
                      }
                      else if(profitSubType === "MTD")
                      {
                        if(_item.ActualProfitMTD >= 0)
                        {
                          isInShowFilter = true;
                          maxData = Math.max(maxData , item.ActualProfitMTD , item.ActualFeesInvoicedMTD);
                          minData = Math.min(minData , item.ActualProfitMTD , item.ActualFeesInvoicedMTD);
                        }
                      } else {
                        if(_item.ActualProfitJTD >= 0)
                          {isInShowFilter = true;
                          maxData = Math.max(maxData , item.ActualProfitJTD , item.ActualFeesInvoicedJTD);
                          minData = Math.min(minData , item.ActualProfitJTD , item.ActualFeesInvoicedJTD);}
                      }

                    }
                    break;
                  case "showloss":
                    {
                      if(profitSubType === "YTD")
                      {
                        if(_item.ActualProfitYTD < 0)
                        {
                          isInShowFilter = true;
                          maxData = Math.max(maxData , item.ActualProfitYTD , item.ActualFeesInvoicedYTD);
                          minData = Math.min(minData , item.ActualProfitYTD , item.ActualFeesInvoicedYTD);
                        }
                      }
                      else if(profitSubType === "MTD")
                      {
                        if(_item.ActualProfitMTD < 0){
                          isInShowFilter = true;
                          maxData = Math.max(maxData , item.ActualProfitMTD , item.ActualFeesInvoicedMTD);
                          minData = Math.min(minData , item.ActualProfitMTD , item.ActualFeesInvoicedMTD);}
                      } else {
                        if(_item.ActualProfitJTD < 0){
                          isInShowFilter = true;
                          maxData = Math.max(maxData , item.ActualProfitJTD , item.ActualFeesInvoicedJTD);
                          minData = Math.min(minData , item.ActualProfitJTD , item.ActualFeesInvoicedJTD);}
                      }
                    }
                    break;
                  case "showall":
                    {
                      isInShowFilter = true;
                      if(profitSubType === "YTD")
                      {
                        maxData = Math.max(maxData , item.ActualProfitYTD , item.ActualFeesInvoicedYTD);
                        minData = Math.min(minData , item.ActualProfitYTD , item.ActualFeesInvoicedYTD);
                      }
                      else if(profitSubType === "MTD")
                      {
                        maxData = Math.max(maxData , item.ActualProfitMTD , item.ActualFeesInvoicedMTD);
                        minData = Math.min(minData , item.ActualProfitMTD , item.ActualFeesInvoicedMTD);
                      } else {
                        maxData = Math.max(maxData , item.ActualProfitJTD , item.ActualFeesInvoicedJTD);
                        minData = Math.min(minData , item.ActualProfitJTD , item.ActualFeesInvoicedJTD);
                      }
                    }
                    break;
                  default:

                }

              if(isInTypeFilter && isInShowFilter )
                data.push(_item);
            }
        });
    }

    // data = []; // error test

    this.setState({
      data: data,
      maxData: maxData,
      minData: minData,
    });
  };

  handleFilter = event => {
    const filterName = event.target.value;
    if(event.target.name === "ShowFilter")
    {
      this.setState({showFilter:event.target.value});
    } else if(event.target.name === "SortFilter"){
      this.setState({sortFilter:event.target.value});
    }
    this.props.handleFilter(event);
  };

  _getColor = (bar) => {
    const { selectedBars } = this.props;
    const {selectedBarObjs} = this.state;
    const {profitSubType} = this.props;

    var activeColor = "#27aae1";
    var disableColor = "#1c75bc";
    if(bar.key.includes('Invoiced'))
    {

      if(bar.bar.data["ActualFeesInvoiced" + profitSubType] !== undefined)
      {
        if(bar.bar.data["ActualFeesInvoiced" + profitSubType] < 0)
        {
          activeColor = minusActiveColor;
          disableColor = minusDisableColor;
        } else {
          activeColor = negativeActiveColor;
          disableColor = negativeDisableColor;
        }
      }
    }
    else
    {
      if(bar.bar.data["ActualProfit" + profitSubType] !== undefined)
      {

        if(bar.bar.data["ActualProfit" + profitSubType] < 0)
        {
          activeColor = minusActiveColor;
          disableColor = minusDisableColor;
        }
        else
        {
          activeColor = positiveActiveColor;
          disableColor = positiveDisableColor;
        }
      }
    }

    let index = -1;
    if(selectedBarObjs && selectedBarObjs.length !== 0)
    {
      selectedBarObjs.forEach(item => {

        if(item.bar.data.ProjectName === bar.bar.data.ProjectName
          && item.bar.key === bar.bar.key)
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

  _handleElementSelect = (event, element) => {

    const { selectedBars , selectedBarObjs} = this.state;
    if(element)
    {

    }
  }

  getShortName = (name) => {
    var sortname = "";
    if(name){
      for(let i = 0; i < name.length; i++)
      {
        if(name[i] >= 'A' && name[i] <= 'Z')
            sortname += name[i];
      }
    }
    return sortname;
  }

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
    const { hoverBar, selectedBars , selectedBarObjs} = this.state;

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
    const { topchartHeight } = this.props;
    const { showTooltip } = this.props;
    let data = {}, top, left;
    let offset = 220;

    if (isBar) {
      const { hoverBar } = this.state;
      if (hoverBar) hoverBar.classList.remove('barHover');
      event.target.classList.add('barHover');
      this.setState({hoverBar: event.target});

      //top = event.currentTarget.getBoundingClientRect().y - 400 + event.pageY;
      //left = event.clientX;

      top = event.pageY - this.state.PageOffset - offset;
      left = event.clientX + 10;
      data = bar;

    } else {
      top = event.pageY - this.state.PageOffset - offset;
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

  handlePos = (event) => {
    const {PageOffset} = this.state;
    const _pos = event.currentTarget.getBoundingClientRect().top + window.scrollY;
    if( (PageOffset !== _pos ) && this._isMounted === true)
    {
      this.setState({PageOffset: _pos})
    }
  }

  render() {
    const {
      classes, filterName,
      tooltipOpen, tooltipTop, tooltipLeft, tooltipData ,
      profitSubType
    } = this.props;

    let { data, maxData , minData , showFilter , sortFilter} = this.state;

    const width = window.innerWidth - 15;
    const height = (window.innerHeight - 180) / 2;
    const margin = {
      top: 10,
      right: 0,
      bottom: 20,
      left: 80
    };

    const xMax = width;

    const offsetX = 3.5;
    const offsetWidth = - 10;

    const ySelector = item => item.ProjectName;

    const sortfunc = (a,b) => {
      var aFilter = -1;
      var bFilter = 1;
      if(showFilter === "showloss")
      {
        aFilter = 1;
        bFilter = -1;
      }

      switch (profitSubType) {
        case "YTD":
          {
            if(sortFilter === "sortbyprofit")
              return (b.ActualProfitYTD * bFilter + a.ActualProfitYTD * aFilter);
            else if(sortFilter === "sortbycosts")
              return (b.ActualCostYTD * bFilter  + a.ActualCostYTD * aFilter);
            else if(sortFilter === "sortbyfees")
              return (b.ActualFeesInvoicedYTD * bFilter  + a.ActualFeesInvoicedYTD * aFilter);
            else if(sortFilter === "sortbydirector")
              return (b.DirectorInitials.charCodeAt(0) * bFilter + a.DirectorInitials.charCodeAt(0) * aFilter);
          }
          break;
        case "MTD":
          {
            if(sortFilter === "sortbyprofit")
              return (b.ActualProfitMTD * bFilter  + a.ActualProfitMTD * aFilter);
            else if(sortFilter === "sortbycosts")
              return (b.ActualCostMTD * bFilter  + a.ActualCostMTD * aFilter);
            else if(sortFilter === "sortbyfees")
              return (b.ActualFeesInvoicedMTD * bFilter  + a.ActualFeesInvoicedMTD * aFilter);
            else if(sortFilter === "sortbydirector")
              return (b.DirectorInitials.charCodeAt(0) * bFilter + a.DirectorInitials.charCodeAt(0) * aFilter);
          }
          break;
        case "JTD":
          {
            if(sortFilter === "sortbyprofit")
              return (b.ActualProfitJTD * bFilter  + a.ActualProfitJTD * aFilter);
            else if(sortFilter === "sortbycosts")
              return (b.ActualCostJTD * bFilter  + a.ActualCostJTD * aFilter);
            else if(sortFilter === "sortbyfees")
              return (b.ActualFeesInvoicedJTD * bFilter  + a.ActualFeesInvoicedJTD * aFilter);
            else if(sortFilter === "sortbydirector")
              return (b.DirectorInitials.charCodeAt(0) * bFilter + a.DirectorInitials.charCodeAt(0) * aFilter);
          }
          break;
        default:

      }
    };

    data = data.sort(sortfunc);

    var numTicks = 10;
    if(maxData === 0 && minData === 0)
    {
      maxData = 10;
      numTicks = 2;
    }

    // scales
    const yScale = scaleBand({
          rangeRound: [5, 0],
          domain: data.map(ySelector),
          padding: 0.2,
        });

    const xScale = scaleLinear({
      rangeRound: [0, xMax * (7 / 12)],
      domain: [minData * 1.01 , maxData * 1.01]/*,
      nice: true,*/
    });

    let keys_active =  [];
    let keys_fee =  [];
    keys_fee.push("ActualFeesInvoiced" + profitSubType);
    keys_active.push("ActualProfit" + profitSubType);


    const color = scaleOrdinal({
      domain: keys_fee,
      range: ['#191919', '#FFCF02']
    });

    return (

      <div className={classes.root}  id = "bottomRoot"
           onMouseMove={event => this.handlePos(event)}
           onTouchMove={event => this.handlePos(event)}>
        <div className="">
          <Typography variant="h6" className="subtitle mt-10">Profit By Project</Typography>
        </div>

        <div className="wrapper" style={{'paddingBottom':'5px'}}>
          <div className="">
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </div>
            <div className="">
                <FormControl className={classes.formControl}>
                  <NativeSelect
                    value={showFilter}
                    name="ShowFilter"
                    onChange={this.handleFilter}
                  >
                    <option value='showprofit'>Show Profit</option>
                    <option value='showloss'>Show Loss</option>
                    <option value='showall'>Show All</option>
                  </NativeSelect>
                </FormControl>
            </div>
            <div className="">
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </div>
            <div className="">
                <FormControl className={classes.formControl}>
                  <NativeSelect
                    value={sortFilter}
                    name="SortFilter"
                    onChange={this.handleFilter}
                  >
                    <option value='sortbyprofit'>Sort by Profit</option>
                    <option value='sortbyfees'>Sort by Fees</option>
                    <option value='sortbycosts'>Sort by Costs</option>
                    <option value='sortbydirector'>Sort by Director</option>
                  </NativeSelect>
                </FormControl>
              </div>
        </div>
        <div className="well" style = {{minHeight:`${height}px`,maxHeight:`${height}px`,overflowX: 'hidden' }}>
          <div  style={formatedStyle(width , 12, 0 , 0 , '')}  id="wrapper">
            {data.map((item, i) => {
                const yMax = barThinHeight - 5;
                const _item = [];
                _item.push(item);

                return (
                  <Grid container key={i} className={classes.wrapper } onClick={event => this._handleElementSelect(event, item)}>
                    <Grid item md={4} sm={12} xs={12}>
                      <Grid container className={classes.item_wrapper} >
                        <Grid item md={2} >
                          {item.ProjectId?item.ProjectId:""}
                        </Grid>
                        <Grid item md={5} >
                          &nbsp;{item.ProjectName?item.ProjectName:""}
                        </Grid>
                        <Grid item md={1} >
                          &nbsp;{item.DirectorInitials?item.DirectorInitials:""}
                        </Grid>
                        <Grid item md={4} >
                          &nbsp;{item.ProjectTypeDescription?item.ProjectTypeDescription:""}
                        </Grid>
                      </Grid>
                    </Grid>

                    <Grid item md={7} sm={12} xs={12}>
                      <div style={{ position: 'relative' }}>
                        <svg width={width * (2 / 3) - 50} height={yMax}>
                          <rect x={0} y={0} width={width * (2 / 3) - 50} height={yMax} fill="transparent" onClick={this._deSelectAll}/>
                            <BarStackHorizontal
                                data={_item}
                                keys={keys_fee}
                                y={ySelector}
                                xScale={xScale}
                                yScale={yScale}
                                color={color}>

                              {( barStacks ) => {
                                return barStacks.map(barStack => {

                                  return barStack.bars.map(bar => {
                                    if(bar.width < 0)
                                    {
                                      bar.x = (xScale(0) + bar.width);
                                      bar.width = Math.abs(bar.width);
                                    }if(bar.width == 0){
                                      bar.width = 1;
                                    }

                                    return (
                                      <rect
                                        key={`barstack-horizontal-${barStack.index}-${bar.index}`}
                                        x={bar.x}
                                        y={bar.y}
                                        height={yMax}
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
                            </BarStackHorizontal>

                            <BarStackHorizontal
                                data={_item}
                                keys={keys_active}
                                y={ySelector}
                                xScale={xScale}
                                yScale={yScale}
                                color={color}>

                              {( barStacks ) => {
                                return barStacks.map(barStack => {

                                  return barStack.bars.map(bar => {
                                    if(bar.width < 0)
                                    {
                                      bar.x = (xScale(0) + bar.width);
                                      bar.width = Math.abs(bar.width);
                                    } if(bar.width == 0){
                                      bar.width = 1;
                                    }

                                    return (
                                      <rect
                                        key={`barstack-horizontal-${barStack.index}-${bar.index}`}
                                        x={bar.x}
                                        y={bar.y}
                                        height={yMax}
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
                            </BarStackHorizontal>

                        </svg>
                      </div>
                    </Grid>
                  </Grid>
                    )
              })}


              {data.length >0?
                <div style={thinAxis, {borderTop: 'solid 1px #a9a9a9'}} onClick={this._deSelectAll}>
                    <Grid container>
                      <Grid item md={4} sm={12} xs={12}></Grid>

                      <Grid item md={7} sm={12} xs={12}>
                        <svg width={width * (2 / 3) - 50} height={barThinHeight}>
                          <rect x={0} y={0} width={width * (2 / 3) - 50} height={barThinHeight} fill={'transparent'}/>

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
                  </div>
                  :
                  <div style={thinAxis} onClick={this._deSelectAll} align="center">
                    <p>No Data</p>
                  </div>
                }
          </div>
        </div>

        {tooltipOpen && (
            <Tooltip
              style={{position: 'absolute',left:`${tooltipLeft}px` , top:`${tooltipTop}px`}}
              >

              {tooltipData.isBar ?
                <div style = {{width:'500px'}}>
                  <div className="pdv-10">
                    Project Type:&nbsp;&nbsp;<strong>{tooltipData.bar.data.ProjectTypeDescription}</strong>
                  </div>
                  <div className="pdv-10">
                    Project Value:&nbsp;&nbsp;<strong> {thousandFormat2(tooltipData.bar.data.TotalProjectValue)}</strong>
                  </div>
                  <div className="flex">

                        <Grid container >
                          <Grid item md={3} >
                            <div >
                              <p>&nbsp;&nbsp;&nbsp;&nbsp;</p>
                              <p ><strong>Hours</strong></p>
                              <p><strong>Invoiced</strong></p>
                              <p><strong>Cost</strong></p>
                              <p><strong>Profit</strong></p>
                            </div>

                          </Grid>
                          <Grid item md={3} >
                            <div >
                              <p><strong>Month</strong></p>
                              <p>{thousandFormat(tooltipData.bar.data.ActualHoursMTD)}</p>
                              <p>{thousandFormat2(tooltipData.bar.data.ActualFeesInvoicedMTD)}</p>
                              <p>{thousandFormat2(tooltipData.bar.data.ActualCostMTD)}</p>
                              <p>{thousandFormat2(tooltipData.bar.data.ActualProfitMTD)}</p>
                            </div>
                          </Grid>
                          <Grid item md={3} >
                            <div >
                              <p><strong>YTD</strong></p>
                              <p>{thousandFormat(tooltipData.bar.data.ActualHoursYTD)}</p>
                              <p>{thousandFormat2(tooltipData.bar.data.ActualFeesInvoicedYTD)}</p>
                              <p>{thousandFormat2(tooltipData.bar.data.ActualCostYTD)}</p>
                              <p>{thousandFormat2(tooltipData.bar.data.ActualProfitYTD)}</p>
                            </div>
                          </Grid>
                          <Grid item md={3} >
                            <div >
                              <p><strong>PTD</strong></p>
                              <p>{thousandFormat(tooltipData.bar.data.ActualHoursJTD)}</p>
                              <p>{thousandFormat2(tooltipData.bar.data.ActualFeesInvoicedJTD)}</p>
                              <p>{thousandFormat2(tooltipData.bar.data.ActualCostJTD)}</p>
                              <p>{thousandFormat2(tooltipData.bar.data.ActualProfitJTD)}</p>
                            </div>
                          </Grid>
                        </Grid>

                  </div>
                </div>
                :
                <div>

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
  selectedTopItems: PropTypes.array.isRequired,
  handleFilter: PropTypes.func.isRequired
};

export default withStyles(styles)(withTooltip(BottomChart));
