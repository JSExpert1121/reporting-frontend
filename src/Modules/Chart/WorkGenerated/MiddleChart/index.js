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

import { withStyles } from '@material-ui/core/styles';
import {
  FormControl,
  NativeSelect,
  Typography,
  Grid,
} from "@material-ui/core";

import {
  getParams, getMonth, isEqualObjList, isEqualList, thousandFormat2
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

const y = (d, key) => d[key];
const ex = d => d.WorkGeneratedAdmount.Existing;
const ne = d => d.WorkGeneratedAdmount.New;

class MiddleChart extends Component {

  _isMounted = false;
  constructor(props) {
    super(props);

    this.state = {
      resize: false,

      data: [],
      hoverBar: null,
      selectedBars: [],
      selectedRects: [],
      clientHeight: 0,
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
      if(this._isMounted === true)
      {
        this.prepareData();
        this.deSelectAll();
      }
    }

    this.props.handleOffset({mChartHeight:this.divElement.clientHeight});
  }

  prepareData = () => {
    const { queryData, filterName, selectedYears, selectedMonths, selectedTopItems } = this.props;

    let dictData = {};
    let data = [];

    let _selectedMonths = selectedMonths.slice();
    let _selectedyears = [];
    let _selectedTypes = [];
    selectedTopItems.forEach(item => {
      _selectedMonths.push(item['month']);
      if(item['year'])
      {
        _selectedyears.push(item['year']);
      }

      if(item['type'])
      {
        _selectedTypes.push(item['type']);
      }

    });

    if(_selectedyears.length === 0)
      _selectedyears = selectedYears;

    if(_selectedTypes.length === 0)
    {
      _selectedTypes = ['Existing', 'New'];
    }

    if(queryData['MiddleLeft'])
      queryData['MiddleLeft'].forEach(d => {

        if( _selectedMonths.length === 0 ||
          ((_selectedMonths.indexOf(getMonth(d.Date)) > -1 || _selectedMonths[0] === undefined) &&
           _selectedyears.indexOf(d.FY) > -1 &&
           _selectedTypes.indexOf(d.ExistingOrNew) > -1) )
        {
          let item = d[filterName];

          if (!dictData[item])
          {
            dictData[item] = {};
            dictData[item][filterName] = item;
            dictData[item]['WorkGeneratedAdmount'] = [];
            dictData[item]['WorkGeneratedAdmount']['Existing'] = 0;
            dictData[item]['WorkGeneratedAdmount']['New'] = 0;
          }
          dictData[item]['WorkGeneratedAdmount'][d.ExistingOrNew] += d['WorkGeneratedAdmount'];
        }
      });

    Object.keys(dictData).map(key => {
      data.push(dictData[key]);
    });

    this.setState({data});
  };

  getColor = (data , type = '') => {
    const { filterName, selectedMiddleItems } = this.props;
    const activeColor = type == 'Existing' ? negativeActiveColor : "#1c75bc" ;
    const disableColor = type == 'New' ? negativeDisableColor : "#ccdce9";

    if (selectedMiddleItems.length === 0) return activeColor;
    if (selectedMiddleItems.indexOf(data[filterName]) > -1) return activeColor;
    return disableColor;
  };

  handleFilter = event => {
    const filterName = event.target.value;
    this.props.handleFilter({filterName});
  };

  handleElement = (event, element, item=null) => {
    const { selectedMiddleItems } = this.props;
    const { selectedBars, selectedRects } = this.state;

    let _selectedBars = [], _selectedRects = [], _selectedMiddleItems = [];
    let exist = false, index = NaN;

    switch (element) {
      case 'bar':
        if (event.shiftKey) {
          _selectedBars = selectedBars.slice();
          _selectedMiddleItems = selectedMiddleItems.slice();
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
            _selectedMiddleItems.push(item);
          } else {
            event.target.classList.remove('barActive');
            _selectedBars.splice(index, 1);
            _selectedMiddleItems.splice(index, 1);
          }

        } else {
          selectedBars.forEach(selectedBar => {
            selectedBar.classList.remove('barActive');
            if (selectedBar === event.target) exist = true;
          });

          selectedRects.forEach(selectedRect => {
            selectedRect.classList.remove('bkgActive');
          });

          if (exist && selectedBars.length === 1) {
            _selectedBars = [];
            _selectedRects = [];
            _selectedMiddleItems = [];
          } else {
            event.target.classList.add('barActive');
            _selectedBars = [event.target];
            _selectedRects = [];
            _selectedMiddleItems = [item];
          }
        }

        break;

      case 'rect':
        if (event.shiftKey) {
          _selectedBars = selectedBars.slice();
          _selectedMiddleItems = selectedMiddleItems.slice();
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
            _selectedMiddleItems.push(item);
          } else {
            event.target.classList.remove('bkgActive');
            _selectedRects.splice(index, 1);
            _selectedMiddleItems.splice(index, 1);
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
            _selectedMiddleItems = [];
          } else {
            event.target.classList.add('bkgActive');
            _selectedBars = [];
            _selectedRects = [event.target];
            _selectedMiddleItems = [item];
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

    this.props.handleFilter({selectedMiddleItems: _selectedMiddleItems});
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

    this.props.handleFilter({selectedMiddleItems: []});
  };

  showTooltip = (event, data, type , isBar = true) => {
    const { showTooltip } = this.props;
    let tooltipData, top, left;

    top = event.clientY  - 320;
    left = event.clientX;
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
    data = data.sort((a,b) => ( ( (a.WorkGeneratedAdmount.Existing + a.WorkGeneratedAdmount.New)
    - (b.WorkGeneratedAdmount.Existing + b.WorkGeneratedAdmount.New) ) ));

    const count = data.length;
    const width = (window.innerWidth / 2 - 15) * 10 / 12 - 20;
    const height = count * 40;
    const margin = {
      top: 0,
      right: 10,
      bottom: 0,
      left: 0
    };
    const { pageYOffset, xMax, yMax } = getParams(window, width, height, margin);

    // for right chart
    //this.props.handleOffset({mChartHeight:yMax});

    let maxValue = 0;
    let minValue = 0;
    if (count > 0)
    {
      let a , b;
      data.forEach( d=> {
        a = ex(d);
        b = ne(d);
        if(a >= 0 && b >= 0)
        {
          maxValue = Math.max(maxValue , a + b);
          minValue = Math.min(minValue , a , b);
        }
        else if(a >= 0 && b < 0)
        {
          maxValue = Math.max(maxValue , a);
          minValue = Math.min(minValue , b);
        }
        else if(a < 0 && b >= 0)
        {
          maxValue = Math.max(maxValue , b);
          minValue = Math.min(minValue , a , b);
        }
        else
        {
          maxValue = Math.max(maxValue , b);
          minValue = Math.min(minValue , a);
        }

      });
      //maxValue = Math.max(0, max(data, d => Math.abs(ex(d) )), max(data, d => Math.abs(ne(d))));
      //minValue = Math.min(0, min(data, d => ex(d)), min(data, d => ne(d)));
    }

    // scales
    const xScale = scaleLinear({
      domain: [minValue, maxValue],
      range: [0, xMax],
      nice: true
    });

    const yScale = scaleBand({
      domain: data.map(d => y(d, filterName)),
      rangeRound: [yMax, 0],
      padding: 0.2
    });

    let tooltipTimeout;

    return (
      <div className={classes.root} ref={ (divElement) => this.divElement = divElement}>

        <div className="wrapper">
          <div className="well">
            <Typography variant="h6" className="subtitle mt-10">By</Typography>
          </div>
          <div className="well">
            <FormControl className={classes.formControl}>
              <NativeSelect
                value={filterName}
                name="filterName"
                onChange={this.handleFilter}
              >
                <option value='EmployeeName'>Source</option>
                <option value='ProjectTypeDescription'>Project Type</option>

              </NativeSelect>
            </FormControl>
          </div>
          <div className="right well"></div>
        </div>


        {count > 0 ?
          <div  style={{border: 'solid 1px #a9a9a9'}}>
            <div style={ship(yMax + 20)}>
              <Grid container>
                <Grid item md={2} sm={2} xs={2}>
                  {data.slice().reverse().map((d, i) => {
                    return (
                      <p key={i} style={{height:`20px`, marginTop:5, paddingTop:'10px'}} className="grayHover" onClick={ event => this.handleElement(event, 'rect', d[filterName])}>
                        &nbsp;{d[filterName]}
                      </p>
                    )
                  })}
                </Grid>

                <Grid item md={10} sm={10} xs={10}>
                  <svg width={width} height={height}>
                    <rect width={width} height={height} fill={'white'} onClick={this.deSelectAll} />
                    <Group top={margin.top} left={margin.left} >
                      {data.map((d, i) => {
                        let a = 0 , b = 0;
                        let x0 = xScale(0), x1 = xScale(0) , w0 = 0 , w1 = 0;
                        a = ex(d); // Existing value
                        b = ne(d); // New value
                        if(a >= 0 && b >= 0)
                        {
                          x0 = xScale(0);
                          w0 = xScale(b) - x0;
                          x1 = x0  + w0;
                          w1 = xScale(a) - xScale(0);
                        }
                        else if(a >= 0 && b < 0)
                        {
                          x0 = xScale(0) - xScale(b);
                          w0 = xScale(0) - x0;
                          x1 = xScale(0);
                          w1 = xScale(a) - x1;
                        }
                        else if(a < 0 && b >= 0)
                        {
                          x0 = xScale(0);
                          w0 = xScale(b) - x0;
                          x1 = xScale(0) - xScale(a);
                          w1 = xScale(0) - x1;
                        }
                        else
                        {
                          x0 = xScale(0) - xScale(b);
                          w0 = xScale(0) - x0;
                          x1 = x0 - xScale(a);
                          w1 = x0 - x1;
                        }

                        const barHeight = yScale.bandwidth() - 2;
                        const barY = yScale(y(d, filterName));

                        return (
                          <Group key={`${filterName}-${y(d, filterName)}-${i}`}>
                            <Bar
                              x={x0}
                              y={barY}
                              width={w0}
                              height={barHeight}
                              fill={this.getColor(d, 'New')}
                              onClick={event => {
                                this.handleElement(event, 'bar', d[filterName]);
                              }}
                              onMouseMove={event => {
                                if (tooltipTimeout) clearTimeout(tooltipTimeout);
                                this.showTooltip(event, d, 'New');
                              }}
                              onMouseLeave={event => {
                                tooltipTimeout = setTimeout(() => {
                                  this.hideTooltip();
                                }, 300);
                              }}
                              onTouchMove={event => {
                                if (tooltipTimeout) clearTimeout(tooltipTimeout);
                                this.showTooltip(event, d, 'New');
                              }}
                              onTouchEnd={event => {
                                tooltipTimeout = setTimeout(() => {
                                  this.hideTooltip();
                                }, 300);
                              }}
                            />
                            <Bar
                              x={x1}
                              y={barY}
                              width={w1}
                              height={barHeight}
                              fill={this.getColor(d, 'Existing')}
                              onClick={event => {
                                this.handleElement(event, 'bar', d[filterName]);
                              }}
                              onMouseMove={event => {
                                if (tooltipTimeout) clearTimeout(tooltipTimeout);
                                this.showTooltip(event, d, 'Existing');
                              }}
                              onMouseLeave={event => {
                                tooltipTimeout = setTimeout(() => {
                                  this.hideTooltip();
                                }, 300);
                              }}
                              onTouchMove={event => {
                                if (tooltipTimeout) clearTimeout(tooltipTimeout);
                                this.showTooltip(event, d , 'Existing');
                              }}
                              onTouchEnd={event => {
                                tooltipTimeout = setTimeout(() => {
                                  this.hideTooltip();
                                }, 300);
                              }}
                            />


                            <LinePath
                              data={[{'x':xScale(0),'y':0},{'x':xScale(0),'y':yMax}]}
                              x={d=> d.x}
                              y={d=> d.y}
                              stroke={"#555555"}
                              strokeDasharray="2,1"
                            />
                            <LinePath
                              data={[{'x':0,'y':0},{'x':0,'y':yMax}]}
                              x={d=> d.x}
                              y={d=> d.y}
                              stroke={"#555555"}

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
                          <div className="pdv-5"><strong>{tooltipData[filterName]} - {tooltipData['type']}</strong></div>
                          <div className="ft-12"> {thousandFormat2(tooltipData['WorkGeneratedAdmount'][tooltipData['type']])}</div>
                        </div>
                        :
                        <div>

                        </div>
                      }
                    </Tooltip>
                  )}

                </Grid>
              </Grid>
            </div>

            <div style={axis}>
              <Grid container>
                <Grid item md={2} sm={2} xs={2}></Grid>

                <Grid item md={10} sm={10} xs={10}>
                  <svg width={width} height={barHeight}>
                    <rect
                      x={0}
                      y={0}
                      width={width}
                      height={barHeight}
                      fill={'transparent'}
                      onClick={event => {
                        this.deSelectAll();
                      }}
                    />
                    <AxisBottom
                      scale={xScale}
                      top={0}
                      hideAxisLine={true}
                      stroke="black"
                      numTicks={5}
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
                          onClick={this.deSelectAll}
                        >
                          ${formattedValue}
                        </text>
                      )}
                    />
                  </svg>
                </Grid>
              </Grid>
            </div>
          </div>
          :
          ""
        }

      </div>
    );
  }

}


MiddleChart.propTypes = {
  classes: PropTypes.object.isRequired,
  queryData: PropTypes.object.isRequired,
  selectedYears: PropTypes.array.isRequired,
  selectedMonths: PropTypes.array.isRequired,
  selectedTopItems: PropTypes.array.isRequired,
  selectedMiddleItems: PropTypes.array.isRequired,
  filterName: PropTypes.string.isRequired,
  handleOffset: PropTypes.func.isRequired,
  handleFilter: PropTypes.func.isRequired,
};

export default withStyles(styles)(withTooltip(MiddleChart));
