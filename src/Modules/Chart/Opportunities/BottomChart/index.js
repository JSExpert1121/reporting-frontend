import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import {
  Typography
} from '@material-ui/core'

import { BarStack, Bar , LinePath} from '@vx/shape';
import {
  Grid,Select
} from "@material-ui/core";
import { Group } from '@vx/group';
import { withTooltip, Tooltip } from "@vx/tooltip";
import { AxisLeft, AxisBottom } from '@vx/axis'
import { scaleBand, scaleLinear, scaleOrdinal } from '@vx/scale';
import Truncate from 'react-truncate';

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

class BottomChart extends Component {

  _isMounted = false;
  constructor(props) {
    super(props);

    this.state = {
      resize: false,

      hoverBar: null,
      selectedBars: [],

      data: [],
      totals: [],

      status: [],
      projectTypes: [],
      selectedBottomItems: [],
      selectedColors: [],
      probabilities: [],
      selectedType: '',
      selectedSt:'',
      selectedProb:'',
      searchStr:''
    };

    this._prepareData = this._prepareData.bind(this);
    this._handleBar = this._handleBar.bind(this);
    this._deSelectAll = this._deSelectAll.bind(this);
    this.keyPress = this.keyPress.bind(this);
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
      prevProps.detailData !== this.props.detailData ||

      prevState.selectedSt !== this.state.selectedSt ||
      prevState.searchStr !== this.state.searchStr
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
    let { detailData, selectedYears , selectedTopLeftItems} = this.props;
    let {selectedSt, searchStr} = this.state;
    let dictData = {};
    let dictTotal = {};
    let data = [];
    let totals = [];
    let probabilities = [];
    let status = [];
    let projectTypes = [];
    let filterMonths = [];
    let selectedColors = [];
    const activeColor = ['#1f77b4','#ff7f0e','#adefbe','#1c75bc','#929292','#272727','#98df8a','#a9ddf3','#2ca02c','#e377c2'];
    const disableColor = ['#ccdce8','#f5dec9','#e6f2e9','#ccdce8','#e1e1e1','#cecece','#e2efe0','#e6eff3','#cfe4cf','#f0dcea'];

    let fiscalMonths = getMonths(this.props.defaultStartMonth);
    let fiscalMonths2 = getMonths2( this.props.defaultMonth, this.props.defaultStartMonth);
    let reg = new RegExp(`${searchStr}`);

    selectedTopLeftItems.forEach(d => {
      filterMonths.push(d.month);
    });

    if(detailData && detailData['Left'])
      detailData['Left'].forEach(item => {
        let month = getMonth(item.Date);

        if(probabilities.indexOf(item.ProbabilityOfSuccess) === -1)
          probabilities.push(item.ProbabilityOfSuccess);
        if(status.indexOf(item.Status) === -1)
          status.push(item.Status);
        if(projectTypes.indexOf(item.OpportunityType) === -1)
          projectTypes.push(item.OpportunityType);

        if((filterMonths.indexOf(month) || filterMonths.length === 0) &&
        (selectedSt === '' || selectedSt === 'All' || selectedSt === item.Status) &&
        (searchStr === '' || reg.test(item.Name)))
        {
          if(dictData[item.Name] === undefined)
          {
            dictData[item.Name] = {};
            dictData[item.Name]['Name'] = item.Name;
            dictData[item.Name]['Type'] = item.OpportunityType;
            dictData[item.Name]['Status'] = item.Status;
            dictData[item.Name]['ActiveColor'] = activeColor[projectTypes.indexOf(item.OpportunityType)];
            dictData[item.Name]['DisableColor'] = disableColor[projectTypes.indexOf(item.OpportunityType)];
            dictData[item.Name]['Hours'] = 0;
            if(selectedColors.indexOf(dictData[item.Name]['ActiveColor']) === -1)
              selectedColors.push(dictData[item.Name]['ActiveColor']);
          }
          if(dictTotal[item.Name] === undefined)
          {
            dictTotal[item.Name] = 0;
          }
          dictData[item.Name]['Hours'] += item.Hours;
          dictTotal[item.Name] += item.Hours;
        }
      });

      Object.keys(dictData).map(d=>{
        data.push(dictData[d]);
      });

      Object.keys(dictTotal).map(d=>{
        totals.push(dictTotal[d]);
      })

      data.sort( (a,b) => (-a.Hours + b.Hours));
      this.setState({
        data: data,
        totals: totals,
        status: status,
        projectTypes: projectTypes,
        probabilities: probabilities,
        selectedColors:selectedColors
      });

  };

  _getColor = (item) => {
    const { selectedBottomItems } = this.state;
    const key = item.Name;
    var activeColor = 0;
    var disableColor = 0;

    activeColor = item.ActiveColor;
    disableColor = item.DisableColor;

    if(selectedBottomItems.length === 0)
      return activeColor;

    for (let i = 0; i < selectedBottomItems.length ; i++) {
      if (selectedBottomItems[i].Name === key)
        {
          return activeColor;
        }
    }

    return disableColor;
  };

  _handleBar = (event, item) => {
    const { selectedBars, selectedBottomItems } = this.state;

    let _selectedBars, _selectedBottomItems;
    let Name = item.Name;
    if (event.shiftKey) {
      _selectedBars = selectedBars.slice();
      _selectedBottomItems = selectedBottomItems.slice();

      let index = NaN;
      for (let i = 0; i < selectedBars.length; i++)
      {
        if (selectedBars[i] === event.target) {
          index = i;
          break;
        }
      }

      if (isNaN(index)) {
        event.target.classList.add('barActive');
        _selectedBars.push(event.target);
        _selectedBottomItems.push({Name: Name});
      } else {
        event.target.classList.remove('barActive');
        _selectedBars.splice(index, 1);
        _selectedBottomItems.splice(index, 1);
      }

    } else {
      let exist = false;

      selectedBars.forEach(selectedBar => {
        selectedBar.classList.remove('barActive');
        if (selectedBar === event.target) exist = true;
      });

      if (exist && selectedBars.length === 1) {
        _selectedBottomItems = [];
        _selectedBars = [];
      } else {
        _selectedBottomItems = [{Name: Name}];
        _selectedBars = [event.target];
        event.target.classList.add('barActive');
      }
    }

    this.setState({
      selectedBars: _selectedBars,
      selectedBottomItems: _selectedBottomItems
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
      selectedBottomItems: []
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

      top = event.clientY - 520;
      left = event.clientX ;
      data = item;
    } else {
      top = event.clientY - 520;
      left = event.clientX ;
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

  keyPress = event =>  {
    if(event.keyCode === 13)
    {
      this.setState({searchStr : event.target.value});
    }

  };

  render() {
    const {
      classes, selectedYears, selectedTopLeftLabels,
      tooltipOpen, tooltipTop, tooltipLeft, tooltipData,
    } = this.props;
    let { data, totals, status, projectTypes, selectedColors, probabilities } = this.state;

    const width = window.innerWidth * 7 / 12 - 15;
    const height = 200;
    const margin = {
      top: 10,
      right: 20,
      bottom: 20,
      left: 0
    };

    const { pageYOffset, xMax, yMax } = getParams(window, width, height, margin);
    const offsetX = 3.5;
    const offsetWidth = - 1.2;

    const xScale = scaleLinear({
      domain: [0, Math.max(...totals) * 1.2],
      range: [0, xMax * 8 / 12 + 15],
      nice: true
    });

    let fiscalMonths = getMonths( this.props.defaultStartMonth);

    const handleChange = name => event => {

      if(name === "Probability")
      {
        this.props.handleFilter({
          Probability: event.target.value,
        });

      } else if(name === "Status"){
        this.setState({selectedSt : event.target.value});
      }

    };

    return (
      <div className={classes.root}>
        <div className="well" style={{paddingTop:'30px'}}>
          <strong>Hours By Project</strong>
          <div style={{paddingTop:'10px'}}>
          </div>
          <div className='flex'>
            <div style={{fontSize:12}}>Probability&nbsp;&nbsp;
              <Select native onChange={handleChange("Probability")} style={{fontSize:12}}>
                <option value={"All"}>All</option>
                {
                  probabilities.map((item,index)=>{
                    return(
                      <option key= {`option-${index}`} value={`${item}`}>{item * 100}%</option>
                    )
                  })
                }

              </Select>
            </div>
            &nbsp;&nbsp;&nbsp;&nbsp;
            <div style={{fontSize:12}}>Status&nbsp;&nbsp;
              <Select native onChange={handleChange("Status")} style={{fontSize:12}}>
                <option value={"All"}>All</option>
                {
                  status.map((item,index)=>{
                    return(
                      <option key= {`option-${index}`} value={`${item}`}>{item}</option>
                    )
                  })
                }

              </Select>
            </div>
            &nbsp;&nbsp;&nbsp;&nbsp;
            <div style={{fontSize:12}}>
            Opportunity Name&nbsp;&nbsp;
            <input type="text" name="OppName" style={{height:'18px',width:'100px'}} onKeyDown={event => this.keyPress(event) }></input>
            </div>
          </div>
          <div className="relative" style={{paddingTop:'10px'}}>
            <Grid container >
              {
                data.map((item, index)=>{
                  let topBorder = index==0?1:0;
                  let bottomBorder = index==(data.length-1)?1:0;
                  return(
                    <div className ='flex' key={`chart-${index}`} style={{borderLeft:'solid 1px #a9a9a9',borderTop:'solid 1px #a9a9a9',borderRight:'solid 1px #a9a9a9'}}>
                      <div align="left" style={{}}>
                        <p style={formatedStyle(xMax * 2 / 12, 11, 0 , 1)}>
                        {item.Name}
                        </p>
                      </div>
                      <div align="left" style={{padding:'0px', borderRight:'solid 1px #a9a9a9'}}>
                        <p style={formatedStyle(xMax * 2 / 12, 11, 0 , 1)}>
                        {item.Status=='Open'?"Current":item.Status}
                        </p>
                      </div>
                      <div align="left" style={{padding:'2px'}}>
                        <svg height={18} width={xMax * 8 / 12} >
                          <rect x={0} y={0}  height={18} width={xMax * 9 / 12} fill="transparent" onClick={this._deSelectAll}/>
                            <Bar
                              x={0}
                              y={0}
                              width={xScale(item.Hours)}
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
                    </div>
                  )
                })
              }

              {
                data.length!==0?
                  <div className='flex' >
                    <div style={{padding:'0px',margin:'0px'}}>
                        <svg height={25} width={xMax * 4 / 12 + 1} >
                          <rect x={0} y={0}  height={1} width={xMax * 4 / 12} fill="grey" />
                        </svg>
                    </div>

                    <div align="left" style={{paddingTop:'0px'}}>
                        <svg height={25} width={xMax * 8 / 12 + 5} >
                          <rect x={0} y={0}  height={18} width={xMax * 8 / 12 } fill="transparent" onClick={this._deSelectAll}/>
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
                  </div>
                :
                <div>

                </div>
              }
              { // selected types and colors
                <div>
                  <svg height={100} width={xMax}>
                    {
                      projectTypes.map((types,index)=>{
                        let nol = Math.round(projectTypes.length/2);
                        let x = 100 * (index % nol);
                        let y = 20 * Math.floor(index / nol);

                        return(
                          <Group  key={`colors-${index}`} top={0} left={0}>
                            <rect
                              x={x} y={y}
                              width={12}
                              height={12}
                              fill={selectedColors[index]}
                            />
                          <text x={x + 14} y={y + 12} fontSize={12}>
                              {types}
                            </text>
                          </Group>
                        )
                      })
                    }
                  </svg>
                </div>
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
                      <strong> { (tooltipData.Name)}</strong>
                    </div>
                    <div className="ft-12">
                      Status: <strong> { (tooltipData.Status)}</strong>
                    </div>
                    <div className="ft-12">
                      Hours: <strong> { (tooltipData.Hours)}</strong>
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


BottomChart.propTypes = {
  classes: PropTypes.object.isRequired,

  detailData: PropTypes.object.isRequired,
  selectedYears: PropTypes.array.isRequired,
  selectedTopLeftItems: PropTypes.array.isRequired,
  defaultStartMonth: PropTypes.number.isRequired,
  defaultMonth: PropTypes.number.isRequired,
  handleFilter: PropTypes.func.isRequired
};

export default withStyles(styles)(withTooltip(BottomChart));
