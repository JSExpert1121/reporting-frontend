import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import {
  Typography,
  Grid
} from '@material-ui/core'

import { BarStackHorizontal} from '@vx/shape';
import { withTooltip, Tooltip } from "@vx/tooltip";
import { AxisBottom } from '@vx/axis'
import { scaleBand, scaleLinear, scaleOrdinal } from '@vx/scale';

import {
  thousandFormat2 ,
} from "../../../../Utils/Functions";
import {
  tooltip , thinAxis, barThinHeight , formatedStyle
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
    const { detailData , filterName , selectedTopItems} = this.props;

    let data = [] , _data = [], maxData = 0 , minData = 0;

    if(detailData)
    {
        var _item = {};

        detailData.forEach(item => {

          if(item.PDirector != null)
          {
            _item = {};
            if(item["ProjectId"])
              _item["ProjectId"] = item["ProjectId"];
            else
              _item["ProjectId"] = "";

            if(item["ProjectName"])
              _item["ProjectName"] = item["ProjectName"];
            else
              _item["ProjectId"] = "";

            if(item["PDirector"])
              _item["PDirector"] = item["PDirector"];
            else
              _item["ProjectId"] = "";

            if(item["Project Type"])
              _item["Project Type"] = item["Project Type"];
            else
              _item["Project Type"] = "";


            if(item["IF12Months"])
              _item["IF12Months"] = item["IF12Months"];
            else
              _item["IF12Months"] = 0;

            if(item["IFGT12Months"])
              _item["IFGT12Months"] = item["IFGT12Months"];
            else
              _item["IFGT12Months"] = 0;

            var isInFilter = false;
            if(selectedTopItems)
              selectedTopItems.forEach(filter => {
                if(filterName == "Director")
                  if(filter == _item["PDirector"])
                  {
                    isInFilter = true;
                  }

                if(filterName == "Project Type")
                  if(filter == _item["Project Type"])
                  {
                    isInFilter = true;
                  }

                });

            if(isInFilter || !selectedTopItems || selectedTopItems.length == 0){
              data.push(_item);
              maxData = Math.max(maxData , _item["IF12Months"], _item["IFGT12Months"]);
              minData = Math.min(minData , _item["IF12Months"], _item["IFGT12Months"]);
            }
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
      this.props.handleFilter({filterName});
    };

  _getColor = (bar) => {
    const { selectedBars } = this.props;
    const {selectedBarObjs} = this.state;
// 27aae1 1c75bc
// cee6f0 ccdce9
    const activeColor =  bar.key =="IF12Months"?"#27aae1" :"#1c75bc";
    const disableColor = bar.key =="IF12Months"?"#cee6f0" :"#ccdce9";

    let index = -1;
    if(selectedBarObjs && selectedBarObjs.length != 0)
    {
      selectedBarObjs.forEach(item => {

        if(item.bar.data.ProjectName == bar.bar.data.ProjectName
          && item.bar.key == bar.bar.key)
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

    const { showTooltip } = this.props;
    let data = {}, top, left;

    if (isBar) {
      const { hoverBar } = this.state;
      if (hoverBar) hoverBar.classList.remove('barHover');
      event.target.classList.add('barHover');
      this.setState({hoverBar: event.target});

      top = event.nativeEvent.layerY - 150;
      left = event.clientX;
      data = bar;
    } else {
      top = event.nativeEvent.layerY - 150;
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
      classes, filterName,
      tooltipOpen, tooltipTop, tooltipLeft, tooltipData

    } = this.props;
    var { data, maxData , minData} = this.state;

    const width = window.innerWidth - 15;
    const height = 300;
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

    data = data.sort((a,b) => ( (-(a.IF12Months + a.IFGT12Months) + (b.IF12Months + b.IFGT12Months) ) ));

    var numTicks = 5;
    if(maxData == 0 && minData == 0)
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
      domain: [minData * 1.1 , maxData * 1.1  ]/*,
      nice: true,*/
    });


    let key_month =  [];
    let key_gtmonth =  [];
    key_month.push("IF12Months");
    key_gtmonth.push("IFGT12Months");

    const color = scaleOrdinal({
      domain: key_month,
      range: ['#191919', '#FFCF02']
    });

    return (
      <div className={classes.root}>

        <div className="">
          <Typography variant="h6" className="subtitle mb-10">By Project</Typography>
        </div>

        <div className="well" style = {{minHeight:'200px',maxHeight:'500px',overflowY: 'auto' }}>
          <div  style={formatedStyle(width , 12, 0 , 0 , '')}  id="wrapper">
            {data.map((item, i) => {
                const yMax = barThinHeight - 5;
                const _item = [];
                _item.push(item);

                return (
                  <Grid container key={i} className={classes.wrapper } onClick={event => this._handleElementSelect(event, item)}>
                    <Grid item md={4} sm={12} xs={12}>
                      <Grid container >
                        <Grid item md={2} className={classes.item_wrapper} >
                          {item.ProjectId}
                        </Grid>
                        <Grid item md={5} className={classes.item_wrapper} >
                          &nbsp;{item.ProjectName}
                        </Grid>
                        <Grid item md={1} className={classes.item_wrapper} >
                          &nbsp;{this.getShortName(item.PDirector)}
                        </Grid>
                        <Grid item md={4} className={classes.item_wrapper} >
                          &nbsp;{item["Project Type"]}
                        </Grid>
                      </Grid>
                    </Grid>

                    <Grid item md={7} sm={12} xs={12}>
                      <div >
                        <svg width={width * (2 / 3) - 50} height={yMax}>
                          <rect x={0} y={0} width={width * (2 / 3) - 50} height={yMax} fill="transparent" onClick={this._deSelectAll}/>
                            <BarStackHorizontal
                            data={_item}
                            keys={key_gtmonth}
                            y={ySelector}
                            xScale={xScale}
                            yScale={yScale}
                            color={color}>

                              {( barStacks ) => {
                                return barStacks.map(barStack => {

                                  return barStack.bars.map(bar => {
                                    if(bar.width == 0)
                                    {
                                      bar.width = 1;
                                    }
                                    return (
                                      <rect
                                        key={`barstack-horizontal-${barStack.index}-${bar.index}`}
                                        x={bar.width<0?(xScale(0) + bar.width):bar.x}
                                        y={bar.y}
                                        height={yMax}
                                        width={Math.abs(bar.width)}
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
                            keys={key_month}
                            y={ySelector}
                            xScale={xScale}
                            yScale={yScale}
                            color={color}>

                              {( barStacks ) => {
                                return barStacks.map(barStack => {

                                  return barStack.bars.map(bar => {
                                    return (
                                      <rect
                                        key={`barstack-horizontal-${barStack.index}-${bar.index}`}
                                        x={bar.width<0?(xScale(0) + bar.width):bar.x}
                                        y={bar.y}
                                        height={yMax}
                                        width={Math.abs(bar.width)}
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
                <div style={thinAxis , {borderTop: 'solid 1px #a9a9a9'}} onClick={this._deSelectAll}>
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
              top={tooltipTop + 50}
              left={tooltipLeft}
              style={tooltip}
            >

              {tooltipData.isBar ?
                <div>
                  <div className="pdv-10">
                    <strong>{tooltipData.bar.data.ProjectId} {tooltipData.bar.data.ProjectName}</strong>
                  </div>
                  <div className="ft-12">
                    ProjectType:<strong> {tooltipData.bar.data["Project Type"]}</strong>
                  </div>
                  <div className="ft-12">
                    &nbsp;&nbsp;
                  </div>
                  <div className="ft-12">
                    To Invoice next 12 months:<strong>{thousandFormat2(tooltipData.bar.data.IF12Months)}</strong>
                  </div>
                  <div className="ft-12">
                    To Invoice in fucture years:<strong>{thousandFormat2(tooltipData.bar.data.IFGT12Months)}</strong>
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
