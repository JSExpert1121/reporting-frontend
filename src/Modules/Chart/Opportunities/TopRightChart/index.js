import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import {
  Typography
} from '@material-ui/core'

import { BarStack, Bar , LinePath} from '@vx/shape';
import {
  Grid,
} from "@material-ui/core";
import { Group } from '@vx/group';
import { withTooltip, Tooltip } from "@vx/tooltip";
import { AxisLeft, AxisBottom } from '@vx/axis'
import { scaleBand, scaleLinear, scaleOrdinal } from '@vx/scale';

import {
  getParams, getMonth, thousandFormat2, getMonths2, getMonths
} from "../../../../Utils/Functions";
import {
  enMonths,
  positiveActiveColor,
  positiveDisableColor,
  negativeActiveColor,
  negativeDisableColor,
  tooltip,
  activeLabelColor,
  formatedStyle
} from "../../../../Assets/js/constant";

import { styles } from './style';

// accessors
const x = d => d.month;

let tooltipTimeout;

class TopRightChart extends Component {

  _isMounted = false;
  constructor(props) {
    super(props);

    this.state = {
      resize: false,

      hoverBar: null,
      selectedBars: [],

      data: [],
      totals: [],
      colors: []
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
      prevProps.selectedTopLeftItems !== this.props.selectedTopLeftItems ||
      prevProps.summaryData !== this.props.summaryData
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
    var { summaryData, selectedYears , selectedTopLeftItems} = this.props;

    let dictData = {};
    let dictTotal = {};
    let data = [];
    let totals = [];
    let filterMonths = [];

    selectedTopLeftItems.forEach(d => {
      filterMonths.push(d.month);
    });

    let colors = selectedYears.reduce((ret, year) => {
      ret.push(positiveActiveColor);
      return ret;
    }, []);


    let fiscalMonths = getMonths(this.props.defaultStartMonth);
    let fiscalMonths2 = getMonths2( this.props.defaultMonth, this.props.defaultStartMonth);

    if(summaryData && summaryData['Right'])
      summaryData['Right'].forEach(item => {
        let month = getMonth(item.Date);
        // means 2: 76-100% 1:26-75% 0:0-25%
        let key = item.ProbabilityOfSuccess>0.76?2:item.ProbabilityOfSuccess>0.26?1:0;
        if(filterMonths.indexOf(month) || filterMonths.length === 0)
        {
          if(dictData[key] === undefined)
          {
            dictData[key] = {};
            dictData[key]['percent'] = key;
            dictData[key]['PotentialRevenue'] = 0;
          }
          if(dictTotal[key] === undefined)
          {
            dictTotal[key] = 0;
          }
          dictData[key]['PotentialRevenue'] += item.PotentialRevenue;
          dictTotal[key] += item.PotentialRevenue;
        }
      });

      Object.keys(dictData).map(d=>{
        data.push(dictData[d]);
      });

      Object.keys(dictTotal).map(d=>{
        totals.push(dictTotal[d]);
      })

      data.sort( (a,b) => (-a.percent + b.percent));
      this.setState({
        data: data,
        totals: totals,
        colors: colors
      });
  };

  _getColor = (item) => {
    const { selectedTopRightItems } = this.props;
    const key = item.percent;
    var activeColor = 0;
    var disableColor = 0;

    if(key === 2)
    {
      activeColor = '#000000';
      disableColor = '#c7c7c7';
    }
    else if(key === 1)
    {
      activeColor = '#a3a3a3';
      disableColor = '#e4e4e4';
    }
    else
    {
      activeColor = '#d6d6d6';
      disableColor = '#d6d6d6';
    }

    if(selectedTopRightItems.length === 0)
      return activeColor;

    for (let i = 0; i < selectedTopRightItems.length ; i++) {
      if (selectedTopRightItems[i].percent === key)
        {
          return activeColor;
        }
    }

    return disableColor;
  };

  _handleBar = (event, item) => {
    const { selectedTopRightItems } = this.props;
    const { selectedBars } = this.state;

    let _selectedBars, _selectedTopRightItems;
    let percent = item.percent;
    if (event.shiftKey) {
      _selectedBars = selectedBars.slice();
      _selectedTopRightItems = selectedTopRightItems.slice();

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
        _selectedTopRightItems.push({percent: percent});
      } else {
        event.target.classList.remove('barActive');
        _selectedBars.splice(index, 1);
        _selectedTopRightItems.splice(index, 1);
      }

    } else {
      let exist = false;

      selectedBars.forEach(selectedBar => {
        selectedBar.classList.remove('barActive');
        if (selectedBar === event.target) exist = true;
      });

      if (exist && selectedBars.length === 1) {
        _selectedTopRightItems = [];
        _selectedBars = [];
      } else {
        _selectedTopRightItems = [{percent: percent}];
        _selectedBars = [event.target];
        event.target.classList.add('barActive');
      }
    }

    this.setState({
      selectedBars: _selectedBars,
    });

    this.props.handleFilter({
      selectedTopRightItems: _selectedTopRightItems,
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
      selectedTopRightItems: [],
    });
  };

  _showTooltip = (event, item, isBar=true) => {
    if (tooltipTimeout) clearTimeout(tooltipTimeout);

    const { showTooltip } = this.props;
    let data = {}, top, left;

    if (isBar) {
      const { hoverBar } = this.state;
      if (hoverBar) hoverBar.classList.remove('barHover');
      event.target.classList.add('barHover');
      this.setState({hoverBar: event.target});

      top = event.clientY - 120;
      left = event.clientX - window.innerWidth * 7 / 12 - 15;
      data = item;
    } else {
      top = event.clientY - 120;
      left = event.clientX - window.innerWidth * 7 / 12 - 15;
      data['forecast'] = item;
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
      classes, selectedYears, selectedTopLeftLabels,
      tooltipOpen, tooltipTop, tooltipLeft, tooltipData

    } = this.props;
    let { data, totals, colors } = this.state;

    const width = window.innerWidth * 5 / 12 - 15;
    const height = 200;
    const margin = {
      top: 10,
      right: 0,
      bottom: 20,
      left: 0
    };

    const { pageYOffset, xMax, yMax } = getParams(window, width, height, margin);
    const offsetX = 3.5;
    const offsetWidth = - 1.2;

    const xScale = scaleLinear({
      domain: [0, Math.max(...totals)],
      range: [0, xMax * 10 / 12 + 10],
      nice: true
    });

    const color = scaleOrdinal({
      domain: selectedYears,
      range: colors
    });

    let fiscalMonths = getMonths( this.props.defaultStartMonth);
    let chartMap = ['0-25%', '26-75%', '76-100%'];
    return (
      <div className={classes.root}>
        <div className="well">
          <strong>Potential Fees by Probability</strong>
          <div className="relative" style={{paddingTop:'10px'}}>
            <Grid container >
              {
                data.map((item, index)=>{
                  let topBorder = index==0?1:0;
                  let bottomBorder = 0;/*index==(data.length-1)?1:0*/;
                  return(
                    <Grid container key={`chart-${index}`}>
                      <Grid item md={2} sm={2} sx={2} >
                        <div align="right" style={{paddingTop:'10px', paddingRight:'5px'}}>
                          <p style={formatedStyle(xMax * 2 / 12, 12, 0 , 1)}>
                          {chartMap[item.percent]}
                          </p>
                        </div>
                      </Grid>
                      <Grid item md={10} sm={10} sx={10}
                        style={{borderTop:`solid ${topBorder}px #a9a9a9`,borderBottom:`solid ${bottomBorder}px #a9a9a9` ,borderLeft:'solid 1px #a9a9a9', borderRight:'solid 1px #a9a9a9'}}>
                        <div align="left" style={{paddingTop:'10px'}}>
                          <svg height={18} width={xMax * 10 / 12} >
                            <rect x={0} y={0}  height={18} width={xMax * 10 / 12} fill="transparent" onClick={this._deSelectAll}/>
                              <Bar
                                x={0}
                                y={0}
                                width={xScale(item.PotentialRevenue)}
                                height={18}
                                fill={this._getColor(item)}
                                onClick={event=>this._handleBar(event, item)}
                                onMouseLeave={event => this._hideTooltip()}
                                onMouseMove={event => this._showTooltip(event, item)}
                                onTouchEnd={event => this._hideTooltip()}
                                onTouchMove={event => this._showTooltip(event, item)}
                              >
                              </Bar>
                            </svg>
                        </div>
                      </Grid>
                    </Grid>
                  )
                })
              }

              {
                data.length!==0?
                  <Grid container >
                    <Grid item md={2} sm={2} sx={2} >
                      <div align="right" style={{paddingTop:'10px', paddingRight:'5px'}}>
                        <p style={formatedStyle(xMax * 2 / 12, 12, 0 , 1)}>
                        </p>
                      </div>
                    </Grid>

                    <Grid item md={10} sm={10} sx={10} >
                      <div align="left" style={{paddingTop:'0px'}}>
                        <svg height={25} width={xMax * 10 / 12 + 5} >
                          <rect x={0} y={0}  height={18} width={xMax * 10 / 12 + 5} fill="transparent" onClick={this._deSelectAll}/>
                            <AxisBottom
                              hideTicks={false}
                              numTicks={6}
                              scale={xScale}
                              top={0}
                              stroke="black"
                              tickStroke="black"
                              tickLabelProps={(value, index) => ({
                                fontSize: 11,
                                textAnchor: 'start',
                                dy: '-0.1em',
                              })}
                              tickComponent={({ formattedValue, ...tickProps }) => (
                                <text
                                  {...tickProps} fill={'black'}

                                >
                                  ${formattedValue}
                                </text>
                              )}
                            />
                          </svg>
                      </div>
                    </Grid>
                  </Grid>
                :
                <Grid container >
                </Grid>
              }
            </Grid>

            {tooltipOpen && (
              <Tooltip
                top={tooltipTop + pageYOffset}
                left={tooltipLeft}
                style={tooltip}
              >
                {tooltipData.isBar ?
                  <div>
                    <div className="ft-12">
                      <strong>Fee potential: { thousandFormat2(tooltipData.PotentialRevenue)}</strong>
                    </div>
                  </div>
                  :
                  <div>

                  </div>
                }
              </Tooltip>
            )}

          </div>
        </div>
      </div>
    );
  }

}


TopRightChart.propTypes = {
  classes: PropTypes.object.isRequired,
  summaryData: PropTypes.object.isRequired,
  selectedYears: PropTypes.array.isRequired,
  selectedTopRightItems: PropTypes.array.isRequired,
  selectedTopLeftItems: PropTypes.array.isRequired,
  defaultStartMonth: PropTypes.number.isRequired,
  defaultMonth: PropTypes.number.isRequired,
  handleFilter: PropTypes.func.isRequired
};

export default withStyles(styles)(withTooltip(TopRightChart));
