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
import {LinePath, Line, Bar} from '@vx/shape';
import { localPoint } from "@vx/event";
import {
  getParams, getMonth, thousandFormat,getMonths2, getMonths, makeDimDate
} from "../../../../Utils/Functions";
import {
  fMonths,
  enMonths,
  positiveActiveColor,
  tooltip,
  activeLabelColor
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
      data: [],
      colors: [],
      AchievedPercent: 0
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
      prevProps.summaryData.length !== this.props.summaryData.length ||
      prevProps.selectedLeftItems !== this.props.selectedLeftItems ||
      prevProps.selectedRightItems !== this.props.selectedRightItems ||
      prevProps.choice !== this.props.choice ||
      prevProps.selectedTopLabels !== this.props.selectedTopLabels)
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
    let { summaryData, selectedYears , selectedRightItems, choice} = this.props;
    let selectedMonths = selectedRightItems;
    let dictData = {};
    let data = [];
    let _achived = 0  , _allachived = 0;
    let total = {};
    total['key'] = "Total";
    total['value'] = {};

    if(summaryData.length === 0)
      return;

    summaryData.forEach( item => {
      let month = getMonth(item.Date);
      if(selectedMonths.indexOf(month) > -1)
      {
        let key = "";
        let Outcome = "Achieved";
        if(Math.abs(item.Result - item.Target) < 1)
          Outcome = "Neutral";
        else if(item.DesiredOutcome === "Greater" && item.Result >= item.Target)
          Outcome = "Achieved";
        else if(item.DesiredOutcome === "Less" && item.Result <= item.Target)
          Outcome = "Achieved";
        else
          Outcome = "Not Achieved";

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

        if(dictData[key] === undefined)
        {
          dictData[key] = {};
          dictData[key]['key'] = key;
          dictData[key]['month'] = month;
          dictData[key]['value'] = {};
        }

        if(dictData[key]['value'][Outcome] === undefined)
        {
          dictData[key]['value'][Outcome] = {};
          dictData[key]['value'][Outcome]['idx'] = Outcome==="Achieved"?1:Outcome==="Not Achieved"?-1:0;
          dictData[key]['value'][Outcome]['data'] = 1;
        } else {
          dictData[key]['value'][Outcome]['data']++;
        }

        if(total['value'][Outcome] === undefined)
        {
          total['value'][Outcome] = {};
          total['value'][Outcome]['idx'] = Outcome==="Achieved"?1:Outcome==="Not Achieved"?-1:0;
          total['value'][Outcome]['data'] = 1;
        } else {
          total['value'][Outcome]['data'] ++;
        }

        if(Outcome === "Achieved")
          _achived++;
        _allachived++;
      }
    });

    dictData['total'] = total;

    Object.keys(dictData).map((key , index)=> {
      data.push(dictData[key])
    });

    data.sort((a,b)=> {
      if(b.key.toLowerCase() > a.key.toLowerCase()) return -1;
      if(b.key.toLowerCase() < a.key.toLowerCase()) return 1;
      return 0;
    });

    this.setState({
      data:data,
      AchievedPercent: Math.round((_achived/_allachived) * 100)
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

    _showTooltip = (event, item, subkey, isBar = true) => {
      if (tooltipTimeout) clearTimeout(tooltipTimeout);

      const { showTooltip } = this.props;
      let data = {}, top, left;

      const { hoverBar } = this.state;
      if (hoverBar) hoverBar.classList.remove('barHover');
      event.target.classList.add('barHover');
      this.setState({hoverBar: event.target});

      top = event.clientY - 120;
      left = event.clientX;
      data = item;

      data['isBar'] = isBar;
      data['subKey'] = subkey;

      showTooltip({
        tooltipData: data,
        tooltipTop: top,
        tooltipLeft: left
      });
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

  _handleLabel = (event, key) => {
    const { selectedTopItems, selectedTopLabels  } = this.props;
    const { selectedBars } = this.state;
    let _selectedTopItems, _selectedBars, _selectedTopLabels;

    let index = NaN;
    for (let i = 0; i < selectedTopLabels.length; i++)
    {
      if (selectedTopLabels[i] === key) {
        index = i;
        break;
      }
    }

    if (event.shiftKey) {
      _selectedBars = selectedBars.slice();
      _selectedTopLabels = selectedTopLabels.slice();
      _selectedTopItems = selectedTopItems.slice();

      if (isNaN(index)) {
        _selectedTopItems.push({key: key});
        _selectedTopLabels.push(key);

      } else {
        _selectedTopItems.splice(index, 1);
        _selectedTopLabels.splice(index, 1);
      }

    } else {
      _selectedBars = [];
      _selectedTopItems = [];
      _selectedTopLabels = [];
      selectedBars.forEach(selectedBar => {
        selectedBar.classList.remove('barActive');
      });

      if (!isNaN(index) && selectedTopLabels.length === 1) {
        _selectedTopItems = [];
        _selectedTopLabels = [];
      } else {
        _selectedTopItems = [{key: key}];
        _selectedTopLabels = [key];

      }
    }

    this.setState({
      selectedBars: _selectedBars,

    });

    this.props.updateFilter({
      selectedTopLabels: _selectedTopLabels,
      selectedTopItems: _selectedTopItems,
    });

  };

  _getColor = (item , value) => {
    const {selectedTopItems, selectedTopLabels } = this.props;

    let activeColor = "black";
    let disableColor = "grey";
    if(value === "Achieved")
    {
      activeColor = "#8dc63f";
      disableColor = "#e0ebd2";
    } else if(value === "Not Achieved")
    {
      activeColor = "#868686";
      disableColor = "#dfdfdf";
    } else {
      activeColor = "#e9f323";
      disableColor = "#f1f3cd";
    }

    if (selectedTopItems.length === 0 && selectedTopLabels.length === 0)
    {
      return activeColor;
    }
    if (selectedTopLabels.indexOf(item.key) > -1) return activeColor;

    for (let i = 0; i < selectedTopItems.length ; i++) {
      if (/*selectedTopItems[i].value === value && */selectedTopItems[i].key === item.key) {
        return activeColor;
      }
    }

    return disableColor;
  };

  handleOptionChange = (changeEvent) => {
    this.props.updateFilter({
      choice: changeEvent.target.value,
      selectedTopItems: [],
      selectedTopLabels: []
      });
  }

  _handleBar = (event, item , value) => {

    const { selectedTopItems , selectedTopLabels} = this.props;
    const { selectedBars } = this.state;
    let _selectedBars, _selectedTopLabels, _selectedTopItems;

    if (event.shiftKey) {
      _selectedBars = selectedBars.slice();
      _selectedTopItems = selectedTopItems.slice();
      _selectedTopLabels = selectedTopLabels.slice();

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
        _selectedTopItems.push({key: item.key , value: value});
        _selectedTopLabels.push(item.key);
      } else {
        event.target.classList.remove('barActive');
        _selectedBars.splice(index, 1);
        _selectedTopItems.splice(index, 1);
        _selectedTopLabels.splice(index, 1);
      }

    } else {
      _selectedTopLabels = [];
      let exist = false;

      selectedBars.forEach(selectedBar => {
        selectedBar.classList.remove('barActive');
        if (selectedBar === event.target) exist = true;
      });

      if (exist && selectedBars.length === 1) {
        _selectedTopItems = [];
        _selectedBars = [];
        _selectedTopLabels = [];
      } else {
        _selectedTopItems = [{key: item.key , value: value}];
        _selectedTopLabels = [item.key];
        _selectedBars = [event.target];
        event.target.classList.add('barActive');
      }
    }


    this.setState({
      selectedBars: _selectedBars,

    });

    this.props.updateFilter({
      selectedTopLabels: _selectedTopLabels,
      selectedTopItems: _selectedTopItems,
      selectedLeftItems: []
    });

  };

  render() {
    const {
      classes,
      tooltipOpen, tooltipTop, tooltipLeft, tooltipData,
      selectedYears, selectedTopLabels
    } = this.props;
    let { data, AchievedPercent } = this.state;

    const width = window.innerWidth - 15;
    const height = (window.innerHeight - 30) / 4;
    const margin = {
      top: 10,
      right: 0,
      bottom: 20,
      left: 0
    };

    const { pageYOffset, xMax, yMax } = getParams(window, width, height, margin);

    let leftWidth = width * 7 / 12;
    let rightWidth = width * 4 / 12;

    // scales
    let keySelector = d => d.key;
    let xScale = scaleBand({
      domain: data.map(keySelector),
      rangeRound: [0, leftWidth],
      padding: 0.2,
      nice : true
    });

    return (
      <div className={classes.root}>
        <div >
            <Grid container  >
              <Grid item md={7} sm={7} sx={7} >
                <div>
                  <Typography variant="h6" className="subtitle mb-10">
                    Key Performance Indicators - {enMonths[this.props.selectedRightItems[0]]}
                  </Typography>
                </div>

                <div className="relative">
                  <svg width={leftWidth} height={height}>
                    <Group top={margin.top} left={margin.left}>
                      <rect x={0} y={0} width={leftWidth } height={yMax} fill={'#fcfcfc'} stroke={"black"} strokeWidth={0.5}/>
                      <rect x={0} y={0} width={leftWidth } height={height} fill={'transparent'} onClick={this._deSelectAll} />
                      {data.map((item , index) => {

                        let left = 0 , top = 0;
                        let width = 0 , height = 0;
                        let color = "black";
                        let vlength = Object.keys(item.value).length;
                        let totalKPIs = 0;
                        let achieved = [];
                        Object.keys(item.value).map(kpis=>{
                          totalKPIs += item.value[kpis].data;
                          achieved.push({key: kpis, idx:item.value[kpis].idx ,data:item.value[kpis].data});
                        });

                        left = xScale.paddingInner() * xScale.step() / 2 + index * xScale.step() + 5;
                        width =  xScale.step() - xScale.paddingInner() * xScale.step() / 2 ;

                        let renderItems = []
                        achieved.sort((a,b)=> (b.idx - a.idx));
                        achieved.map((value, inx)=>{
                          height = value.data/totalKPIs * yMax;
                          renderItems.push(
                            <rect
                              key={`bar-chart-${index}-${inx}`}
                              x={left}
                              y={top}
                              height={height}
                              width={width}
                              fill={this._getColor(item, value.key)}
                              onClick={event => this._handleBar(event, item , value.key)}
                              onMouseLeave={event => this._hideTooltip()}
                              onMouseMove={event => this._showTooltip(event, item, value.key)}
                              onTouchEnd={event => this._hideTooltip()}
                              onTouchMove={event => this._showTooltip(event, item, value.key)}
                            />
                          )
                          top += height;
                        });

                        return(
                          <Group key={`bar-group-${index}`}>
                          {renderItems}
                          </Group>
                        )
                      })}

                      { // label bg color
                        data.map((item, index) => {
                          return (
                            <rect
                              key={index}
                              x={xScale.paddingInner() * xScale.step() / 2 + index * xScale.step() } y={yMax}
                              width={(leftWidth - xScale.paddingInner() * xScale.step() / 2 ) / data.length } height={margin.bottom}
                              fill={selectedTopLabels.indexOf(item.key) > -1 ? activeLabelColor : 'transparent'}
                              onClick={(event) => this._handleLabel(event, item.key)}
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
                          fontSize: 12,
                          textAnchor: 'middle',
                          dy: '-0.5em',
                        })}
                        tickComponent={({ formattedValue, ...tickProps }) => (
                          <text
                            {...tickProps} fill={selectedTopLabels.indexOf(formattedValue) > -1 ? 'white' : 'black'}
                            onClick={(event) => this._handleLabel(event, formattedValue)}
                          >
                            {formattedValue}
                          </text>
                        )}
                      />

                    </Group>
                  </svg>
                </div>
              </Grid>
              <Grid item md={5} sm={5} sx={5}>
                <div style={{paddingLeft:'15px'}}>
                  <Typography variant="h6" className="subtitle mb-10">
                    {AchievedPercent}%
                  </Typography>
                  <div style={{height: height/2}}>
                    <Typography variant="h6" className="subtitle mb-10">KPI Choice</Typography>
                      <form>
                        <div className="radio">
                          <label>
                            <input type="radio" value="Group" checked={this.props.choice === 'Group'}
                              onChange={this.handleOptionChange} />
                            Group
                          </label>
                        </div>
                        <div className="radio">
                          <label>
                            <input type="radio" value="Result" checked={this.props.choice === 'Result'}
                              onChange={this.handleOptionChange} />
                            Result
                          </label>
                        </div>
                        <div className="radio">
                          <label>
                            <input type="radio" value="Importance" checked={this.props.choice=== 'Importance'}
                              onChange={this.handleOptionChange} />
                            Importance
                          </label>
                        </div>
                    </form>
                  </div>

                  <div>
                    <svg width={rightWidth} >
                      <Group top={height / 4} left={margin.left}>
                        <rect x={0} y={0} width={10 } height={10} fill={'#8dc63f'} stroke={"black"} strokeWidth={0.5}/>
                          <text x = {20} y = {10}> Achieved </text>
                        <rect x={0} y={20} width={10 } height={10} fill={'#e9f323'} stroke={"black"} strokeWidth={0.5}/>
                          <text x = {20} y = {30}> Neutral </text>
                        <rect x={0} y={40} width={10 } height={10} fill={'#868686'} stroke={"black"} strokeWidth={0.5}/>
                          <text x = {20} y = {50}> Not Achieved </text>
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
                  <strong>{tooltipData.key}</strong>
                </div>
                <div className="ft-12">
                  Outcome: <strong>{tooltipData.subKey}</strong>
                </div>
                <div className="ft-12">
                  <strong>{tooltipData.value[tooltipData.subKey].data} KPIs contributing {tooltipData.value[tooltipData.subKey].data} points</strong>
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
  selectedTopLabels: PropTypes.array.isRequired,
  selectedTopItems: PropTypes.array.isRequired,
  selectedLeftItems: PropTypes.array.isRequired,
  selectedRightItems: PropTypes.array.isRequired,
  choice:PropTypes.string.isRequired,
};

export default withStyles(styles)(withTooltip(TopChart));
