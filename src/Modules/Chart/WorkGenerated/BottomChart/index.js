import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { scaleBand, scaleLinear } from '@vx/scale';
import {
  Bar, LinePath
} from '@vx/shape';
import {Group} from "@vx/group";
import {AxisBottom} from "@vx/axis";
import { withTooltip, Tooltip } from "@vx/tooltip";

import { withStyles } from '@material-ui/core/styles';
import {
  Grid
} from '@material-ui/core';

import {
  getParams,
  getMonth,
  isEqualList,
  isEqualObjList,
  thousandFormat2
} from "../../../../Utils/Functions";
import {
  negativeActiveColor,
  negativeDisableColor,
  ship,
  axis,
  tooltip,
  barThinHeight, mediumItem
} from "../../../../Assets/js/constant";

import { styles } from './style';

// accessors
const x = d => d.WorkGeneratedAdmount;
const y = d => d.ProjectId;

class BottomChart extends Component {

  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = {
      resize: false,

      data: [],
      hoverBar: null,
      selectedBars: [],
      selectedIdRects: [],
      selectedNameRects: [],
      selectedProjects: [],
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
      || !isEqualList(prevProps.selectedMiddleItems, this.props.selectedMiddleItems)
      || prevProps.filterName !== this.props.filterName
      ||  !isEqualList(prevProps.selectedRightItems, this.props.selectedRightItems)
    ) {
      if(this._isMounted === true){
        this.prepareData();
        this.deSelectAll();}
    }
  }

  prepareData = () => {
    const { queryData, filterName, selectedYears, selectedMonths,
      selectedTopItems, selectedMiddleItems, selectedRightItems } = this.props;

    let dictData = {};
    let data = [];

    let _selectedMonths = selectedMonths.slice();
    let _selectedyears = [];
    let _selectedTypes = [];

    // filter process
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

    if(selectedRightItems.length !== 0) {
      _selectedTypes = selectedRightItems
    }

    if(_selectedMonths.length === 0)
      _selectedMonths = [0,1,2,3,4,5,6,7,8,9,10,11];

    // data process
    if(queryData['Bottom'])
      queryData['Bottom'].forEach(d => {

        if(((_selectedMonths.indexOf(getMonth(d.Date)) > -1 || _selectedMonths[0] === undefined) &&
           _selectedyears.indexOf(d.FY) > -1 &&
           _selectedTypes.indexOf(d.ExistingOrNew) > -1) &&
          (selectedMiddleItems.length === 0 || selectedMiddleItems.indexOf(d[filterName]) > -1)
         )
        {
          if (!dictData[y(d)])
          {
            dictData[y(d)] = {};
            dictData[y(d)]['ProjectId'] = y(d);
            dictData[y(d)]['ProjectName'] = d['ProjectName'];
            dictData[y(d)]['EmployeeInitials'] = d['EmployeeInitials'];
            dictData[y(d)]['ProjectTypeDescription'] = d['ProjectTypeDescription'];
            dictData[y(d)]['Date'] = d['Date'];
            dictData[y(d)]['WorkGeneratedAdmount'] = [];
            dictData[y(d)]['WorkGeneratedAdmount']['New'] = 0;
            dictData[y(d)]['WorkGeneratedAdmount']['Existing'] = 0;
          }
          dictData[y(d)]['WorkGeneratedAdmount'][d.ExistingOrNew] += x(d);

        }
      });

    Object.keys(dictData).map(key => {
      data.push(dictData[key]);
    });

    this.setState({data});
    this.deSelectAll();
  };


  getColor = (data, type = '') => {
    const { selectedProjects } = this.state;

    const activeColor = type === 'Existing' ? negativeActiveColor : "#1c75bc" ;
    const disableColor = type === 'New' ? negativeDisableColor : "#ccdce9";
    if (selectedProjects.length === 0) return activeColor;
    if (selectedProjects.indexOf(y(data)) > -1) return activeColor;
    return disableColor;
  };

  handleElement = (event, element, data) => {
    const { selectedBars, selectedIdRects, selectedNameRects , selectedProjects} = this.state;
    let _selectedBars = [], _selectedIdRects = [], _selectedNameRects = [], _selectedProjects = [];
    let exist = false, index = NaN;

    switch (element) {
      case 'bar':
        if (event.shiftKey) {
          _selectedBars = selectedBars.slice();
          _selectedIdRects = selectedIdRects.slice();
          _selectedNameRects = selectedNameRects.slice();
          _selectedProjects = selectedProjects.slice();

          for (let i = 0; i < selectedBars.length; i++) {
            if (selectedBars[i] === event.target) {
              index = i;
              break;
            }
          }

          if (isNaN(index)) {
            event.target.classList.add('barActive');
            _selectedBars.push(event.target);
            _selectedProjects.push(y(data));
          } else {
            event.target.classList.remove('barActive');
            _selectedBars.splice(index, 1);
            _selectedProjects.splice(index, 1);
          }

        } else {
          selectedBars.forEach(selectedBar => {
            selectedBar.classList.remove('barActive');
            if (selectedBar === event.target) exist = true;
          });
          selectedIdRects.forEach(rect => {
            rect.classList.remove('bkgActive');
          });
          selectedNameRects.forEach(rect => {
            rect.classList.remove('bkgActive');
          });

          if (exist && selectedBars.length === 1) {
            _selectedBars = [];
            _selectedIdRects = [];
            _selectedNameRects = [];
            _selectedProjects = [];
          } else {
            event.target.classList.add('barActive');
            _selectedBars = [event.target];
            _selectedIdRects = [];
            _selectedNameRects = [];
            _selectedProjects = [y(data)]
          }
        }

        break;

      case 'ProjectId':
        if (event.shiftKey) {
          _selectedBars = selectedBars.slice();
          _selectedIdRects = selectedIdRects.slice();
          _selectedNameRects = selectedNameRects.slice();
          _selectedProjects = selectedProjects.slice();

          for (let i = 0; i < selectedIdRects.length; i++) {
            if (selectedIdRects[i] === event.target) {
              index = i;
              break;
            }
          }

          if (isNaN(index)) {
            event.target.classList.add('bkgActive');
            _selectedIdRects.push(event.target);
            _selectedProjects.push(y(data));
          } else {
            event.target.classList.remove('bkgActive');
            _selectedIdRects.splice(index, 1);
            _selectedProjects.splice(index, 1);
          }

        } else {
          selectedBars.forEach(selectedBar => {
            selectedBar.classList.remove('barActive');
          });
          selectedIdRects.forEach(rect => {
            rect.classList.remove('bkgActive');
            if (rect === event.target) exist = true;
          });
          selectedNameRects.forEach(rect => {
            rect.classList.remove('bkgActive');
          });

          if (exist && selectedIdRects.length === 1) {
            _selectedBars = [];
            _selectedIdRects = [];
            _selectedNameRects = [];
            _selectedProjects = []
          } else {
            event.target.classList.add('bkgActive');
            _selectedBars = [];
            _selectedIdRects = [event.target];
            _selectedNameRects = [];
            _selectedProjects = [y(data)]
          }
        }

        break;

      case 'EmployeeInitials':
      case 'ProjectTypeDescription':
      case 'ProjectName':
        if (event.shiftKey) {
          _selectedBars = selectedBars.slice();
          _selectedIdRects = selectedIdRects.slice();
          _selectedNameRects = selectedNameRects.slice();
          _selectedProjects = selectedProjects.slice();

          for (let i = 0; i < selectedNameRects.length; i++) {
            if (selectedNameRects[i] === event.target) {
              index = i;
              break;
            }
          }

          if (isNaN(index)) {
            event.target.classList.add('bkgActive');
            _selectedNameRects.push(event.target);
            _selectedProjects.push(y(data));
          } else {
            event.target.classList.remove('bkgActive');
            _selectedNameRects.splice(index, 1);
            _selectedProjects.splice(index, 1);
          }

        } else {
          selectedBars.forEach(selectedBar => {
            selectedBar.classList.remove('barActive');
          });
          selectedIdRects.forEach(rect => {
            rect.classList.remove('bkgActive');
          });
          selectedNameRects.forEach(rect => {
            rect.classList.remove('bkgActive');
            if (rect === event.target) exist = true;
          });

          if (exist && selectedNameRects.length === 1) {
            _selectedBars = [];
            _selectedIdRects = [];
            _selectedNameRects = [];
            _selectedProjects = [];
          } else {
            event.target.classList.add('bkgActive');
            _selectedBars = [];
            _selectedIdRects = [];
            _selectedNameRects = [event.target];
            _selectedProjects = [y(data)];
          }
        }

        break;

      default:
        break;
    }

    this.setState({
      selectedBars: _selectedBars,
      selectedIdRects: _selectedIdRects,
      selectedNameRects: _selectedNameRects,
      selectedProjects: _selectedProjects
    });
  };

  deSelectAll = () => {
    const { selectedBars, selectedIdRects, selectedNameRects} = this.state;

    selectedBars.forEach(selectedBar => {
      selectedBar.classList.remove('barActive');
    });

    selectedIdRects.forEach(rect => {
      rect.classList.remove('bkgActive');
    });

    selectedNameRects.forEach(rect => {
      rect.classList.remove('bkgActive');
    });

    this.setState({
      selectedBars: [],
      selectedIdRects: [],
      selectedNameRects: [],
      selectedProjects: []
    });
  };

  showTooltip = (event, data, type , isBar = true) => {
    const { showTooltip , bottomOffset} = this.props;
    let tooltipData, top, left;

    top = event.clientY  - bottomOffset - 70;
    left = event.clientX + 10;
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
      classes,
      tooltipOpen, tooltipLeft, tooltipTop, tooltipData
    } = this.props;

    let { data } = this.state;
    const count = data.length;
    data = data.sort((a,b) => ( ( (a.WorkGeneratedAdmount.Existing + a.WorkGeneratedAdmount.New)
    - (b.WorkGeneratedAdmount.Existing + b.WorkGeneratedAdmount.New) ) ));
    const width = (window.innerWidth - 15);
    const height = count * barThinHeight;
    const margin = {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    };
    const { pageYOffset, xMax, yMax } = getParams(window, width, height, margin);

    const ex = d => d.WorkGeneratedAdmount.Existing;
    const ne = d => d.WorkGeneratedAdmount.New;

    let maxValue = 0 , minValue = 0;
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
    }

    // scales
    const xScale = scaleLinear({
      domain: [minValue * 1.2, maxValue * 1.2],
      range: [0, xMax * 7 / 12],
      nice: true
    });

    const yScale = scaleBand({
      domain: data.map(d => y(d)),
      rangeRound: [yMax, 0],
      padding: 0.2
    });

    let tooltipTimeout;
    return (
      <div className={classes.root}>
        <div className="well subtitle pdv-5">By Project</div>
        {count > 0 ?
          <div className="well">
            <div style={ship(300)}>
              <Grid container>
                <Grid item md={4} sm={4} xs={4}>
                  {data.slice().reverse().map((d, i) => {
                    return (
                      <div key={i} className="flex" style={{/*borderBottom: 'solid 1px #a9a9a9',*/ borderRight: 'solid 1px #a9a9a9'}}>
                        <p style={mediumItem} className={`${classes.leftItem} grayHover`} onClick={event => this.handleElement(event, 'ProjectId', d)}>
                          {y(d)}
                        </p>
                        <p style={mediumItem} className={`${classes.rightItem} grayHover`} onClick={event => this.handleElement(event, 'ProjectName', d)}>
                          {d.ProjectName}
                        </p>
                        <p style={mediumItem} className={`${classes.leftItem} grayHover`} onClick={event => this.handleElement(event, 'EmployeeInitials', d)}>
                          {d.EmployeeInitials}
                        </p>
                        <p style={mediumItem} className={`${classes.leftItem} grayHover`} onClick={event => this.handleElement(event, 'ProjectTypeDescription', d)}>
                          {d.ProjectTypeDescription}
                        </p>
                      </div>
                    )
                  })}
                </Grid>

                <Grid item md={8} sm={8} xs={8}>
                  <svg width={xMax * 8 / 12 - 20} height={height}>
                    <rect width={xMax * 8 / 12 - 20} height={height} fill={'white'} onClick={this.deSelectAll} />
                    <Group top={margin.top} left={margin.left} >
                      {data.slice().reverse().map((d, i) => {
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

                        const barY = barThinHeight * i + yScale.paddingInner() * yScale.step() / 2;
                        const barHeight = 20;

                        return (
                          <Group key={`Project-${y(d)}-${i}`}>
                            <Bar
                              x={x0}
                              y={barY}
                              width={w0}
                              height={barHeight}
                              fill={this.getColor(d, 'New')}
                              onClick={event => {
                                this.handleElement(event, 'bar', d);
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
                                this.handleElement(event, 'bar', d);
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
                                this.showTooltip(event, d, 'Existing');
                              }}
                              onTouchEnd={event => {
                                tooltipTimeout = setTimeout(() => {
                                  this.hideTooltip();
                                }, 300);
                              }}
                            />
                          </Group>
                        );
                      })}

                      <LinePath
                        data={[{'x':xScale(0),'y':0},{'x':xScale(0),'y':yMax}]}
                        x={d=> d.x}
                        y={d=> d.y}
                        stroke={"#555555"}
                        strokeDasharray="2,1"
                      />

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
                          <div className="pdv-5"><strong>{y(tooltipData)}&nbsp;	&nbsp;	{tooltipData.ProjectName}</strong></div>
                          <div className="ft-12">Type: <strong>{tooltipData['type']}</strong></div>
                          <div className="ft-12">{tooltipData['type']}: <strong>{thousandFormat2(tooltipData['WorkGeneratedAdmount'][tooltipData['type']])}</strong></div>
                        </div>
                        :
                        ""
                      }
                    </Tooltip>
                  )}

                </Grid>
              </Grid>
            </div>

            <div style={axis}>
              <Grid container>
                <Grid item md={4} sm={4} xs={4}></Grid>

                <Grid item md={8} sm={8} xs={8}>
                  <svg width={xMax * 8 / 12 - 20} height={barThinHeight}>
                    <rect
                      x={0}
                      y={0}
                      width={width}
                      height={barThinHeight}
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
                      numTicks={10}
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

BottomChart.propTypes = {
  classes: PropTypes.object.isRequired,
  queryData: PropTypes.object.isRequired,
  bottomOffset: PropTypes.number.isRequired,
  selectedYears: PropTypes.array.isRequired,
  selectedMonths: PropTypes.array.isRequired,
  selectedTopItems: PropTypes.array.isRequired,
  selectedRightItems: PropTypes.array.isRequired,
  selectedMiddleItems: PropTypes.array.isRequired,
  filterName: PropTypes.string.isRequired,
};

export default withStyles(styles)(withTooltip(BottomChart));
