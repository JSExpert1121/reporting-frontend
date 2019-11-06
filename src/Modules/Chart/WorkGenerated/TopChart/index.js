import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import {
  Typography
} from '@material-ui/core'

import { BarStack, Bar , LinePath} from '@vx/shape';
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
  activeLabelColor
} from "../../../../Assets/js/constant";

import { styles } from './style';

// accessors
const x = d => d.month;
const y = d => d.year;

let tooltipTimeout;


class TopChart extends Component {

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
    this._handleLabel = this._handleLabel.bind(this);
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
      prevProps.queryData !== this.props.queryData
      || prevProps.period !== this.props.period
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
    var { queryData, selectedYears, period } = this.props;

    let monthData = {};
    let monthTotals = {};
    let data = [];
    let totals = [];
    let forecasts = [];
    let yearData = {};
    let yearTotals = {};

    let colors = selectedYears.reduce((ret, year) => {
      ret.push(positiveActiveColor);
      return ret;
    }, []);

    if(period !== "month")
      selectedYears = selectedYears.sort((a,b) => ( (a - b) ));

    let fiscalMonths = getMonths(this.props.defaultStartMonth);
    let fiscalMonths2 = getMonths2( this.props.defaultMonth, this.props.defaultStartMonth);

    fiscalMonths.forEach(month => {
      monthData[month] = {};
      monthData[month]['month'] = month;
      monthData[month]['year'] = 0;
      monthData[month]['value'] = {};
      monthTotals[month] = {};
    });

    selectedYears.forEach(year => {
      yearTotals[year] = {};
      yearData[year] ={};
      yearData[year]["value"] = {};
    });

    if(queryData["Top"])
      queryData["Top"].forEach(item => {
        let month = getMonth(item.Date);

        if(monthData[month] !== undefined)
        {
          if(fiscalMonths2.indexOf(month) > -1)
          {
            let item_key = item.FY + '_' + item.ExistingOrNew;
            if(!monthData[month][item_key])
            {
              monthData[month][item_key] = item.WorkGeneratedAdmount;
              monthData[month]['value'][item_key] = item;
              monthData[month]['year'] = item.FY;
              monthData[month]['value'][item_key]['type'] = item.ExistingOrNew;
            }

            if(!monthTotals[month][item.ExistingOrNew])
              monthTotals[month][item.ExistingOrNew] = 0;

            monthTotals[month][item.ExistingOrNew] += item.WorkGeneratedAdmount;

            if(!yearData[item.FY][item.ExistingOrNew])
            {
              yearData[item.FY][item.ExistingOrNew] = 0;
              yearData[item.FY]['year'] =  item.FY;

              yearData[item.FY]["value"][item.ExistingOrNew] = {};
              yearData[item.FY]["value"][item.ExistingOrNew]["WorkGeneratedAdmount"] = 0;
              yearData[item.FY]['value'][item.ExistingOrNew]["type"] = item.ExistingOrNew;
              yearData[item.FY]["value"][item.ExistingOrNew]["year"] = item.FY;
            }
            yearData[item.FY][item.ExistingOrNew] += item.WorkGeneratedAdmount;
            if(!yearTotals[item.FY][item.ExistingOrNew])
              yearTotals[item.FY][item.ExistingOrNew] = 0;
            yearTotals[item.FY][item.ExistingOrNew] += item.WorkGeneratedAdmount;
            yearData[item.FY]["value"][item.ExistingOrNew]["WorkGeneratedAdmount"] += item.WorkGeneratedAdmount;
          }
        }

      });

      if(period === "month")
      {
        fiscalMonths.forEach(month => {
          data.push(monthData[month]);
          if(monthTotals[month]['Existing'])
            totals.push(monthTotals[month]['Existing']);
          if(monthTotals[month]['New'])
            totals.push(monthTotals[month]['New']);
        });
      } else {
        selectedYears.forEach(year => {
          data.push(yearData[year]);
          if(yearTotals[year]['Existing'])
            totals.push(yearTotals[year]['Existing']);
          if(yearTotals[year]['New'])
            totals.push(yearTotals[year]['New']);
        });
      }

    this.setState({
      data: data,
      totals: totals,
      colors: colors
    });
  };

  _getColor = (bar) => {
    const { selectedMonths, selectedTopItems } = this.props;
    const key = bar.key;
    const month = bar.bar.data.month;
    const year = bar.bar.data.year;

    let type = '';
    if(bar['bar']['data']['value'][bar.key])
      type = bar['bar']['data']['value'][bar.key]['type'];

    const activeColor = key.indexOf('Existing') > -1 ?  negativeActiveColor:"#1c75bc";
    const disableColor = key.indexOf('Existing') > -1 ? negativeDisableColor:"#ccdce9";

    if (selectedTopItems.length === 0 && selectedMonths.length === 0) {
      return activeColor;
    }
    if (selectedMonths.indexOf(month) > -1)
    {
      return activeColor;
    }

    for (let i = 0; i < selectedTopItems.length ; i++) {
      if (selectedTopItems[i].month === month
        && selectedTopItems[i].year === year
        && selectedTopItems[i].type === type)
        {
          return activeColor;
        }
    }

    return disableColor;
  };

  _handleBar = (event, bar) => {
    const { selectedMonths, selectedTopItems } = this.props;
    const { selectedBars } = this.state;

    let _selectedBars, _selectedMonths, _selectedTopItems;

    const month = bar.bar.data.month;
    const year = bar.bar.data.year;
    const type = bar['bar']['data']['value'][bar.key]['type'];



    if (event.shiftKey) {
      _selectedBars = selectedBars.slice();
      _selectedTopItems = selectedTopItems.slice();
      _selectedMonths = selectedMonths.slice();

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
        _selectedTopItems.push({month: month, year: year, type: type});
      } else {
        event.target.classList.remove('barActive');
        _selectedBars.splice(index, 1);
        _selectedTopItems.splice(index, 1);
      }

    } else {
      _selectedMonths = [];
      let exist = false;

      selectedBars.forEach(selectedBar => {
        selectedBar.classList.remove('barActive');
        if (selectedBar === event.target) exist = true;
      });

      if (exist && selectedBars.length === 1) {
        _selectedTopItems = [];
        _selectedBars = [];
      } else {
        _selectedTopItems = [{month: month, year: year , type:type}];
        _selectedBars = [event.target];
        event.target.classList.add('barActive');
      }
    }

    this.setState({
      selectedBars: _selectedBars,
    });

    this.props.handleFilter({
      selectedTopItems: _selectedTopItems,
      selectedMonths: _selectedMonths
    });
  };

  _handleLabel = (event, month) => {
    const { selectedMonths, selectedTopItems } = this.props;
    const { selectedBars } = this.state;
    let _selectedMonths, _selectedTopItems, _selectedBars;

    let index = NaN;
    for (let i = 0; i < selectedMonths.length; i++) {
      if (selectedMonths[i] === month) {
        index = i;
        break;
      }
    }

    if (event.shiftKey) {
      _selectedBars = selectedBars.slice();
      _selectedMonths = selectedMonths.slice();
      _selectedTopItems = selectedTopItems.slice();

      if (isNaN(index)) {
        _selectedMonths.push(month);
      } else {
        _selectedMonths.splice(index, 1)
      }

    } else {
      _selectedBars = [];
      _selectedTopItems = [];

      selectedBars.forEach(selectedBar => {
        selectedBar.classList.remove('barActive');
      });

      if (!isNaN(index) && selectedMonths.length === 1) {
        _selectedMonths = [];
      } else {
        _selectedMonths = [month];
      }
    }

    this.setState({
      selectedBars: _selectedBars,
    });


    this.props.handleFilter({
      selectedMonths: _selectedMonths,
      selectedTopItems: _selectedTopItems,
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
      selectedMonths: [],
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

      top = event.clientY - 120;
      left = event.clientX;
      data = bar;
    } else {
      top = event.clientY - 120;
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
      classes, selectedYears, period, selectedMonths,
      tooltipOpen, tooltipTop, tooltipLeft, tooltipData

    } = this.props;
    let { data, totals, colors } = this.state;

    const width = window.innerWidth - 15;
    const height = 200;
    const margin = {
      top: 10,
      right: 0,
      bottom: 20,
      left: 80
    };

    const { pageYOffset, xMax, yMax } = getParams(window, width, height, margin);
    const offsetX = 3.5;
    const offsetWidth = - 1.2;
    // scales
    const xScale = scaleBand({
      domain: (period==="month"?data.map(x):data.map(y)),
      rangeRound: [0, xMax],
      padding: 0.2
    });
    const yScale = scaleLinear({
      domain: [Math.min(0, Math.min(...totals)  * 1.5 ), Math.max(...totals) * 1.5],
      range: [yMax, 0],
      nice: true
    });

    const color = scaleOrdinal({
      domain: selectedYears,
      range: colors
    });

    let fiscalMonths = getMonths( this.props.defaultStartMonth);
    let monthKeys = [] , yearKeys=["New","Existing"];
    selectedYears.forEach(year => {
      monthKeys.push(year + "_" + "New");
      monthKeys.push(year + "_" + "Existing");
    });

    let line_data = [];
    line_data.push({'x':0,'y':isNaN(yScale(0))?0:yScale(0)});
    line_data.push({'x':xMax,'y':isNaN(yScale(0))?0:yScale(0)});

    let posBase = [] , negBase = [];
    data.forEach( (i , key) => {
      posBase[key] = isNaN(yScale(0))?0:yScale(0);
      negBase[key] = isNaN(yScale(0))?0:yScale(0);
    });

    return (
      <div className={classes.root}>
        <div className="well">

          <div className="relative">
            <svg width={width} height={height}>
              <rect x={0} y={0} width={width} height={height} fill={'transparent'} onClick={this._deSelectAll} />

              <Group top={margin.top} left={margin.left}>
                <BarStack data={data} keys={period==="month"?monthKeys:yearKeys} x={period==="month"?x:y} xScale={xScale} yScale={yScale} color={color}>
                  {( barStacks ) => {

                    return barStacks.map(barStack => {
                      return barStack.bars.map(bar => {

                        let y0 = 0, h0 = 0;
                        if(bar.height < 0)
                        {
                          h0 = Math.abs(isNaN(bar.height)?0:bar.height);
                          y0 = negBase[bar.index];
                          negBase[bar.index] -= isNaN(bar.height)?0:bar.height;

                        } else {
                          h0 = isNaN(bar.height)?0:bar.height;
                          posBase[bar.index] -= isNaN(bar.height)?0:bar.height;
                          y0 = posBase[bar.index];
                        }

                        return (
                          <rect
                            key={`bar-income-${barStack.index}-${bar.index}`}
                            x={bar.x}
                            y={y0}
                            height={h0}
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
                </BarStack>

                <LinePath
                  data={line_data}
                  x={nx=> nx.x}
                  y={nx=> nx.y}
                  stroke={"#555555"}
                  strokeDasharray="2,2"
                />

                <AxisLeft
                  numTicks={3}
                  scale={yScale}
                  stroke="black"
                  tickStroke="black"
                  tickLabelProps={(value, index) => ({
                    fill: 'black',
                    fontSize: 11,
                    textAnchor: 'end',
                    dy: '0.33em',
                    dx: '-0.33em'
                  })}
                  tickComponent={({ formattedValue, ...tickProps }) => (
                    <text
                      {...tickProps} fill={'black'}
                    >
                      ${formattedValue}
                    </text>
                  )}
                />

              {
                fiscalMonths.map((month, index) => {
                    return (
                      <rect
                        key={index}
                        x={xScale.paddingInner() * xScale.step() / 2 + index * xScale.step() + offsetX} y={yMax}
                        width={(xMax - xScale.paddingInner() * xScale.step() / 2 ) / ( period=="month"?fiscalMonths.length:selectedYears.length) + offsetWidth} height={margin.bottom}
                        fill={selectedMonths.indexOf(month) > -1 ? activeLabelColor : 'transparent'}
                        onClick={(event) => this._handleLabel(event, month)}
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
                    fontSize: 11,
                    textAnchor: 'middle',
                    dy: '-0.5em',
                  })}
                  tickComponent={({ formattedValue, ...tickProps }) => (
                    <text
                      {...tickProps} fill={selectedMonths.indexOf(formattedValue) > -1 ? 'white' : 'black'}
                      onClick={(event) => this._handleLabel(event, formattedValue)}
                    >
                      { period==="month"? enMonths[formattedValue] :formattedValue}
                    </text>
                  )}
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
                    <div className="ft-12">
                      <strong>{thousandFormat2(tooltipData.bar.data.value[tooltipData.key].WorkGeneratedAdmount)}</strong>
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


TopChart.propTypes = {
  classes: PropTypes.object.isRequired,

  queryData: PropTypes.object.isRequired,

  period: PropTypes.string.isRequired,
  selectedYears: PropTypes.array.isRequired,
  selectedMonths: PropTypes.array.isRequired,
  selectedTopItems: PropTypes.array.isRequired,
  defaultStartMonth: PropTypes.number.isRequired,
  defaultMonth: PropTypes.number.isRequired,
  handleFilter: PropTypes.func.isRequired
};

export default withStyles(styles)(withTooltip(TopChart));
