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

class BottomRightChart extends Component {

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
      selectedDirectors:[],
      selectedType: '',
      selectedDirector:'',
      selectedSt:'',
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
      prevProps.selectedTopRightItems !== this.props.selectedTopRightItems ||
      prevProps.detailData !== this.props.detailData ||
      prevState.selectedType !== this.state.selectedType ||
      prevState.selectedDirector !== this.state.selectedDirector ||
      prevState.searchStr !== this.state.searchStr||
      prevProps.Probability !== this.props.Probability
    ) {
      if(this._isMounted === true)
        this._prepareData();
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
    window.removeEventListener('resize', this._onResize.bind(this));
  }

  _GetShortDirectorName = (name) => {
    console.log(name);
    if(name === undefined || name == "")
      return '';
    let str = name.split("  ");
    if(str.length < 2)
      return str;
    let shortName = str[0].charAt(0) + str[1].charAt(0);
    return shortName;
  };

  _prepareData = () => {
    let { detailData, selectedYears , selectedTopRightItems, Probability} = this.props;
    let {selectedType, selectedDirector,searchStr} = this.state;
    let dictData = {};
    let dictTotal = {};
    let data = [];
    let totals = [];
    let status = [];
    let projectTypes = [], selectedDirectors = [];
    let filterPercent = [];

    selectedTopRightItems.forEach(d => {
      filterPercent.push(d.percent);
    });

    const activeColor = ['#d6d6d6','#a3a3a3','#000000'];
    const disableColor = ['#d6d6d6','#e4e4e4','#c7c7c7'];

    let fiscalMonths = getMonths(this.props.defaultStartMonth);
    let fiscalMonths2 = getMonths2( this.props.defaultMonth, this.props.defaultStartMonth);
    let reg = new RegExp(`${searchStr}`);

    if(detailData && detailData['Right'])
      detailData['Right'].forEach(item => {
        // means 2: 76-100% 1:26-75% 0:0-25%
        let percent = item.ProbabilityOfSuccess>0.76?2:item.ProbabilityOfSuccess>0.26?1:0;

        if(status.indexOf(item.Status) === -1)
          status.push(item.Status);
        if(projectTypes.indexOf(item.OpportunityType) === -1)
          projectTypes.push(item.OpportunityType);
        if(selectedDirectors.indexOf(item.Director) === -1)
          selectedDirectors.push(item.Director);

        if((selectedType === '' || selectedType === 'All' || selectedType === item.OpportunityType) &&
          (selectedDirector === '' || selectedDirector === 'All' || selectedDirector === item.Director) &&
          (searchStr === '' || reg.test(item.Name)) &&
          (filterPercent.length === 0 || filterPercent.indexOf(percent) > -1) &&
          (Probability === 'All' || Probability == item.ProbabilityOfSuccess)
          )
        {
          if(dictData[item.Name] === undefined)
          {
            dictData[item.Name] = {};
            dictData[item.Name]['Name'] = item.Name;
            dictData[item.Name]['Type'] = item.OpportunityType;
            dictData[item.Name]['Status'] = item.Status;
            dictData[item.Name]['ActiveColor'] = activeColor[percent];
            dictData[item.Name]['DisableColor'] = disableColor[percent];
            dictData[item.Name]['Revenue'] = 0;
            dictData[item.Name]['Director'] = this._GetShortDirectorName(item.Director);
          }
          if(dictTotal[item.Name] === undefined)
          {
            dictTotal[item.Name] = 0;
          }
          dictData[item.Name]['Revenue'] += item.Revenue;
          dictTotal[item.Name] += item.Revenue;
        }
      });

      Object.keys(dictData).map(d=>{
        data.push(dictData[d]);
      });

      Object.keys(dictTotal).map(d=>{
        totals.push(dictTotal[d]);
      })

      data.sort( (a,b) => (-a.Revenue + b.Revenue));
      this.setState({
        data: data,
        totals: totals,
        status: status,
        projectTypes: projectTypes,
        selectedDirectors:selectedDirectors
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
      left = event.clientX - window.innerWidth * 7 / 12;
      data = item;
    } else {
      top = event.clientY - 520;
      left = event.clientX - window.innerWidth * 7 / 12;
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
      tooltipOpen, tooltipTop, tooltipLeft, tooltipData,Probability
    } = this.props;
    let { data, totals, selectedDirectors, projectTypes } = this.state;

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
      domain: [0, Math.max(...totals) * 1.2],
      range: [0, xMax * 8 / 12 + 10],
      nice: true
    });

    let fiscalMonths = getMonths( this.props.defaultStartMonth);

    const handleChange = name => event => {

      if(name === "Type")
      {
        this.setState({selectedType : event.target.value});
      } else if(name === "Director"){
        this.setState({selectedDirector : event.target.value});
      }

    };

    return (
      <div className={classes.root}>
        <div className="well" style={{paddingTop:'30px'}}>
          <strong>Potential Fees by Project</strong>
            <div style={{paddingTop:'10px'}}>
            </div>
          <div className='flex'>
            <div style={{fontSize:12}}>Project Type&nbsp;&nbsp;
              <Select native onChange={handleChange("Type")} style={{fontSize:12}}>
                <option value={"All"}>All</option>
                {
                  projectTypes.map((item,index)=>{
                    return(
                      <option key= {`option-${index}`} value={`${item}`}>{item}</option>
                    )
                  })
                }

              </Select>
            </div>
            &nbsp;&nbsp;
            <div style={{fontSize:12}}>Director&nbsp;&nbsp;
              <Select native onChange={handleChange("Director")} style={{fontSize:12}}>
                <option value={"All"}>All</option>
                {
                  selectedDirectors.map((item,index)=>{
                    return(
                      <option key= {`option-${index}`} value={`${item}`}>{item}</option>
                    )
                  })
                }

              </Select>
            </div>
            &nbsp;&nbsp;
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
                      <div align="left" style={{padding:'0px'}}>
                        <p style={formatedStyle(xMax * 1 / 12, 11, 0 , 1)}>
                        &nbsp;{item.Director}
                        </p>
                      </div>
                      <div align="left" style={{padding:'0px', borderRight:'solid 1px #a9a9a9'}}>
                        <p style={formatedStyle(xMax * 2 / 12, 11, 0 , 1)}>
                        &nbsp;{item.Type}
                        </p>
                      </div>
                      <div align="left" style={{padding:'2px'}}>
                        <svg height={18} width={xMax * 7 / 12} >
                          <rect x={0} y={0}  height={18} width={xMax * 7 / 12} fill="transparent" onClick={this._deSelectAll}/>
                            <Bar
                              x={0}
                              y={0}
                              width={xScale(item.Revenue)}
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
                        <svg height={25} width={xMax * 5 / 12 + 1} >
                          <rect x={0} y={0}  height={1} width={xMax * 5 / 12} fill="grey" />
                        </svg>
                    </div>

                    <div align="left" style={{paddingTop:'0px'}}>
                        <svg height={25} width={xMax * 7 / 12 + 5} >
                          <rect x={0} y={0}  height={18} width={xMax * 7 / 12} fill="transparent" onClick={this._deSelectAll}/>
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
                      Type: <strong> { (tooltipData.Type)}</strong>
                    </div>
                    <div className="ft-12">
                      Fee Potential: <strong> { (tooltipData.Revenue)}</strong>
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


BottomRightChart.propTypes = {
  classes: PropTypes.object.isRequired,

  detailData: PropTypes.object.isRequired,
  selectedYears: PropTypes.array.isRequired,
  selectedTopLeftItems: PropTypes.array.isRequired,
  selectedTopRightItems:PropTypes.array.isRequired,
  Probability:PropTypes.string.isRequired,
  defaultStartMonth: PropTypes.number.isRequired,
  defaultMonth: PropTypes.number.isRequired,
  handleFilter: PropTypes.func.isRequired
};

export default withStyles(styles)(withTooltip(BottomRightChart));
