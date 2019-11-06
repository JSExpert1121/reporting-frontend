import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { scaleBand, scaleLinear } from '@vx/scale';
import {
  Bar, LinePath
} from '@vx/shape';
import {Group} from "@vx/group";
import {AxisBottom, AxisLeft} from "@vx/axis";
import { withTooltip, Tooltip } from "@vx/tooltip";
import { max, min } from 'd3-array';
import { Text } from '@vx/text';
import { withStyles } from '@material-ui/core/styles';
import {
  FormControl,
  NativeSelect,
  Typography,
  Grid,
} from "@material-ui/core";

import {
  getParams, getMonth, isEqualObjList, isEqualList, thousandFormat
} from "../../../../Utils/Functions";
import {
  positiveActiveColor,
  positiveDisableColor,
  negativeActiveColor,
  negativeDisableColor,
  barHeight,
  ship,
  axis,
  tooltip,
  item,
  empty
} from "../../../../Assets/js/constant";

import { styles } from './style';

// accessors
const x = d => d.ActualFees;
const xF = d => d.ForecastFees;

const y = (d, key) => d[key];
const ex = d => d.WorkGeneratedAdmount.Existing;
const ne = d => d.WorkGeneratedAdmount.New;

class RightChart extends Component {

  _isMounted = false;
  constructor(props) {
    super(props);

    this.state = {
      resize: false,

      data: [],
      hoverBar: null,
      selectedBars: [],
      selectedRects: [],
    };

    this.prepareData = this.prepareData.bind(this);
    this.handleElement = this.handleElement.bind(this);
    this.deSelectAll = this.deSelectAll.bind(this);
  }

  onResize() {
    if(this._isMounted === true)
      this.setState({resize: !this.state.resize});
  }

  componentDidMount() {
    this._isMounted = true;
    this.prepareData();
    window.addEventListener('resize', this.onResize.bind(this));
  }

  componentWillUnmount() {
    this._isMounted = false;
    window.removeEventListener('resize', this.onResize.bind(this));
  }

  componentDidUpdate(prevProps, prevState){
    if (
      prevProps.queryData !== this.props.queryData
      || !isEqualList(prevProps.selectedYears, this.props.selectedYears)
      || !isEqualList(prevProps.selectedMonths, this.props.selectedMonths)
      || !isEqualObjList(prevProps.selectedTopItems, this.props.selectedTopItems)
      || prevProps.filterName !== this.props.filterName
    ) {
      if(this._isMounted === true){
      this.prepareData();
      this.deSelectAll();}
    }
  }

  prepareData = () => {
    const { queryData, filterName, selectedYears, selectedMonths, selectedTopItems } = this.props;

    let dictData = {};
    let data = [];

    let _selectedTypes = [];
    selectedTopItems.forEach(item => {
      if(item['type'])
      {
        _selectedTypes.push(item['type']);
      }
    });

    if(_selectedTypes.length === 0)
    {
      _selectedTypes = ['Existing', 'New'];
    }

    if(queryData['MiddleRight'])
      queryData['MiddleRight'].forEach(d => {

        if(_selectedTypes.indexOf(d.ExistingOrNew) > -1)
        {
          if (!dictData[d.ExistingOrNew])
          {
            dictData[d.ExistingOrNew] = {};
            dictData[d.ExistingOrNew]['ExistingOrNew'] = d.ExistingOrNew;
            dictData[d.ExistingOrNew]['WorkGeneratedAdmount'] = 0;
          }

          dictData[d.ExistingOrNew]['WorkGeneratedAdmount'] = d['WorkGeneratedAdmount'];
        }
      });

    Object.keys(dictData).map(key => {
      data.push(dictData[key]);
    });

    this.setState({data});
  };

  getColor = (data , type = '') => {
    const { filterName, selectedRightItems } = this.props;
    const activeColor = type == 'Existing' ? negativeActiveColor : "#1c75bc" ;
    const disableColor = type == 'New' ? negativeDisableColor : "#ccdce9";

    if (selectedRightItems.length === 0) return activeColor;
    if (selectedRightItems.indexOf(data.ExistingOrNew) > -1) return activeColor;
    return disableColor;
  };

  handleFilter = event => {
    const filterName = event.target.value;
    this.props.handleFilter({filterName});
  };

  handleElement = (event, element, item=null) => {
    const { selectedRightItems } = this.props;
    const { selectedBars, selectedRects } = this.state;

    let _selectedBars = [], _selectedRects = [], _selectedRightItems = [];
    let exist = false, index = NaN;

    switch (element) {
      case 'bar':
        if (event.shiftKey) {
          _selectedBars = selectedBars.slice();
          _selectedRightItems = selectedRightItems.slice();
          _selectedRects = selectedRects.slice();

          for (let i = 0; i < selectedBars.length; i++) {
            if (selectedBars[i] === event.target) {
              index = i;
              break;
            }
          }

          if (isNaN(index)) {
            event.target.classList.add('barActive');
            _selectedBars.push(event.target);
            _selectedRightItems.push(item);
          } else {
            event.target.classList.remove('barActive');
            _selectedBars.splice(index, 1);
            _selectedRightItems.splice(index, 1);
          }

        } else {
          selectedBars.forEach(selectedBar => {
            selectedBar.classList.remove('barActive');
            if (selectedBar === event.target) exist = true;
          });

          selectedRects.forEach(selectedRect => {
            selectedRect.classList.remove('bkgActive');
          });

          if (exist && selectedBars.length === 1)
          {
            _selectedBars = [];
            _selectedRects = [];
            _selectedRightItems = [];
          } else {
            event.target.classList.add('barActive');
            _selectedBars = [event.target];
            _selectedRects = [];
            _selectedRightItems = [item];
          }
        }

        break;

      case 'rect':
        if (event.shiftKey) {
          _selectedBars = selectedBars.slice();
          _selectedRightItems = selectedRightItems.slice();
          _selectedRects = selectedRects.slice();

          for (let i = 0; i < selectedRects.length; i++) {
            if (selectedRects[i] === event.target) {
              index = i;
              break;
            }
          }

          if (isNaN(index)) {
            event.target.classList.add('bkgActive');
            _selectedRects.push(event.target);
            _selectedRightItems.push(item);
          } else {
            event.target.classList.remove('bkgActive');
            _selectedRects.splice(index, 1);
            _selectedRightItems.splice(index, 1);
          }

        } else {
          selectedBars.forEach(selectedBar => {
            selectedBar.classList.remove('barActive');
          });
          selectedRects.forEach(selectedRect => {
            selectedRect.classList.remove('bkgActive');
            if (selectedRect === event.target) exist = true;
          });

          if (exist && selectedRects.length === 1) {
            _selectedBars = [];
            _selectedRects = [];
            _selectedRightItems = [];
          } else {
            event.target.classList.add('bkgActive');
            _selectedBars = [];
            _selectedRects = [event.target];
            _selectedRightItems = [item];
          }
        }

        break;

      default:
        break
    }

    this.setState({
      selectedBars: _selectedBars,
      selectedRects: _selectedRects
    });

    this.props.handleFilter({selectedRightItems: _selectedRightItems});
  };

  deSelectAll = () => {
    const { selectedBars, selectedRects } = this.state;

    selectedBars.forEach(selectedBar => {
      selectedBar.classList.remove('barActive');
    });

    selectedRects.forEach(selectedRect => {
      selectedRect.classList.remove('bkgActive');
    });

    this.setState({
      selectedBars: [],
      selectedRects: []
    });

    this.props.handleFilter({selectedRightItems: []});
  };

  showTooltip = (event, data, type , isBar = true) => {
    const { showTooltip } = this.props;
    let tooltipData, top, left;

    top = event.clientY  - 320;
    left = event.clientX - window.innerWidth / 2 ;
    tooltipData = data;
    tooltipData['isBar'] = isBar;
    tooltipData['type'] = type;
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

  render() {
    const {
      classes, filterName,
      tooltipOpen, tooltipLeft, tooltipTop, tooltipData
    } = this.props;

    let { data } = this.state;
    const count = data.length;
    const width = (window.innerWidth / 2 - 15) ;
    const height = this.props.mChartHeight - 12;
    const margin = {
      top: 0,
      right: 10,
      bottom: 0,
      left: 0
    };
    const { pageYOffset, xMax, yMax } = getParams(window, width, height, margin);

    let maxValue = 0;
    let minValue = 0;
    if (count > 0)
    {
      let a , b;
      data.forEach( d=> {
        maxValue = Math.max(maxValue , d.WorkGeneratedAdmount);
        minValue = Math.min(minValue , d.WorkGeneratedAdmount);
      });
    }

    // scales
    const yScale = scaleLinear({
      domain: [minValue * 1.2, maxValue * 1.2],
      range: [yMax , 30 ],
      nice: true
    });

    const xScale = scaleBand({
      domain: data.map(d => y(d, 'ExistingOrNew')),
      rangeRound: [xMax, 0],
      padding: 0.2
    });

    let printf = require('printf');

    let tooltipTimeout;

    return (
      <div className={classes.root}>
        {count > 0 ?
          <div style={{paddingLeft:'5px',paddingTop:'10px'}}>
            <div>
                  <svg width={width} height={height}>
                    <rect width={width} height={height} fill={'white'} onClick={this.deSelectAll} />
                    <Group top={margin.top} left={margin.left} >
                      {data.map((d, i) => {
                        let y0 = xScale(0), h0 = 0 , a = 0;
                        d['WorkGeneratedAdmount']===undefined?a=0:a=d['WorkGeneratedAdmount'];

                        if(a >= 0)
                        {
                          y0 = yScale(a);
                          h0 = yScale(0) - y0;
                        } else {
                          y0 = yScale(0);
                          h0 = yScale(a) - yScale(0);
                        }

                        let w0 = xScale.bandwidth() - 2;
                        let x0 = xScale(y(d, 'ExistingOrNew')) ;

                        return (
                          <Group key={`${filterName}-${y(d, 'WorkGeneratedAdmount')}-${i}`}>
                            <Bar
                              x={x0}
                              y={y0}
                              width={w0}
                              height={h0}
                              fill={this.getColor(d, d['ExistingOrNew'])}
                              onClick={event => {
                                this.handleElement(event, 'bar', d['ExistingOrNew']);
                              }}
                              onMouseMove={event => {
                                if (tooltipTimeout) clearTimeout(tooltipTimeout);
                                this.showTooltip(event, d, d['ExistingOrNew']);
                              }}
                              onMouseLeave={event => {
                                tooltipTimeout = setTimeout(() => {
                                  this.hideTooltip();
                                }, 300);
                              }}
                              onTouchMove={event => {
                                if (tooltipTimeout) clearTimeout(tooltipTimeout);
                                this.showTooltip(event, d, d['ExistingOrNew']);
                              }}
                              onTouchEnd={event => {
                                tooltipTimeout = setTimeout(() => {
                                  this.hideTooltip();
                                }, 300);
                              }}
                            />

                            <Text
                              x={x0 + w0/2 - 10}
                              y={y0 + (a<0?(h0 + 15):0) }
                              verticalAnchor="end"
                              textAnchor="start"
                              fontSize={10}
                              dx={-5}
                              dy={-5}
                            >
                              {printf("$%0.2fM" , d['WorkGeneratedAdmount']/1000000)}
                            </Text>

                            <LinePath
                              data={[{'x':0,'y':yScale(0)},{'x':xMax,'y':yScale(0)}]}
                              x={d=> d.x}
                              y={d=> d.y}
                              stroke={"#555555"}
                              strokeDasharray="2,1"
                            />

                          </Group>
                        );
                      })}
                    </Group>
                  </svg>

                  {tooltipOpen && (
                    <Tooltip
                      top={tooltipTop + pageYOffset}
                      left={tooltipLeft}
                      style={tooltip}
                    >
                      {tooltipData.isBar ?
                        <div>
                          <div className="pdv-5">Work Generated Category: <strong> {tooltipData['type']}</strong></div>
                          <div className="ft-12">Work Gen Amount: <strong>${thousandFormat(tooltipData['WorkGeneratedAdmount'])}</strong></div>
                        </div>
                        :
                        <div>

                        </div>
                      }
                    </Tooltip>
                  )}

            </div>

            <div style={axis}>
                <svg width={width} height={barHeight}>
                  <rect
                    x={0}
                    y={0}
                    width={xMax}
                    height={barHeight}
                    fill={'transparent'}
                    onClick={event => {
                      this.deSelectAll();
                    }}
                  />
                  <AxisBottom
                    hideTicks={true}
                    numTicks={2}
                    scale={xScale}
                    top={0}

                    tickLabelProps={(value, index) => ({
                      fontSize: 12,
                      textAnchor: 'middle',
                      dy: '-0.5em',
                    })}

                    tickComponent={({ formattedValue, ...tickProps }) => (
                      <text
                        {...tickProps}
                        onClick={this.deSelectAll}
                      >
                        {formattedValue}
                      </text>
                    )}
                  />
                </svg>
            </div>
          </div>
          :
          ""
        }

      </div>
    );
  }
}

RightChart.propTypes = {
  classes: PropTypes.object.isRequired,
  queryData: PropTypes.object.isRequired,
  selectedYears: PropTypes.array.isRequired,
  selectedMonths: PropTypes.array.isRequired,
  selectedTopItems: PropTypes.array.isRequired,
  selectedRightItems: PropTypes.array.isRequired,
  filterName: PropTypes.string.isRequired,
  handleFilter: PropTypes.func.isRequired,
  mChartHeight: PropTypes.number.isRequired,
};

export default withStyles(styles)(withTooltip(RightChart));
