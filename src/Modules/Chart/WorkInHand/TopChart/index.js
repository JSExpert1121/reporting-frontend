import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import {
  Typography, FormControl,
  NativeSelect,
} from '@material-ui/core'

import { BarStack, Bar } from '@vx/shape';
import { Group } from '@vx/group';
import { withTooltip, Tooltip } from "@vx/tooltip";
import { AxisLeft, AxisBottom } from '@vx/axis'
import { scaleBand, scaleLinear, scaleOrdinal } from '@vx/scale';

import {
  getParams, thousandFormat
} from "../../../../Utils/Functions";
import {
  positiveActiveColor,
  positiveDisableColor,
  tooltip
} from "../../../../Assets/js/constant";

import { styles } from './style';

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
      prevProps.summaryData.length !== this.props.summaryData.length
      || prevProps.filterName !== this.props.filterName
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
    const { summaryData , filterName , selectedTopItems} = this.props;

    let data = [] , _data = [], maxData = 0;

    if(filterName != "" && summaryData)
    {
        _data['Director'] = [];
        _data['Project Type'] = [];

        summaryData.forEach(item => {

          if(item["Director"])
          {
            if(!_data["Director"][item["Director"]])
            {
              _data["Director"][item["Director"]] = [];
              _data["Director"][item["Director"]]["max"] = 0;
            }
            _data["Director"][item["Director"]]["max"] += item["AmountYetToInvoice"];
          }

          if(item["Project Type"])
          {
            if(!_data["Project Type"][item["Project Type"]])
            {
              _data["Project Type"][item["Project Type"]] = [];
              _data["Project Type"][item["Project Type"]]["max"] = 0;
            }
            _data["Project Type"][item["Project Type"]]["max"] += item["AmountYetToInvoice"];
          }

        });
    }

    if(_data[filterName])
    {
      // skip non-selected item.
      var _item , item = _data[filterName];
      Object.keys(item).forEach( key => {
         if(item[key]["max"] > maxData)
          maxData = item[key]["max"];

        _item = [];
        _item['name'] = key;
        _item['value'] = item[key]["max"];
        data.push(_item);

      });
    }

    // data = []; // error test

    this.setState({
      data: data,
      maxData: maxData,
      selectedTopItems,selectedTopItems,
    });
  };

    handleFilter = event => {
      const filterName = event.target.value;
      this.props.handleFilter({filterName});
      this.props.handleFilter({
        selectedTopItems: [],
      });
    };

  _getColor = (bar) => {
    const { selectedMonths, selectedTopItems } = this.props;

    const name = bar.bar.data.name;

    const activeColor =  /*negativeActiveColor :*/ positiveActiveColor;
    const disableColor = /*negativeDisableColor :*/ positiveDisableColor;

    if (selectedTopItems.length === 0) {
      return activeColor;
    }

    for (let i = 0; i < selectedTopItems.length ; i++) {
      if (selectedTopItems[i] === name) {
        return activeColor;
      }
    }

    return disableColor;
  };

  _handleBar = (event, bar) => {
    const { selectedTopItems } = this.props;
    const { selectedBars } = this.state;

    let _selectedBars, _selectedMonths, _selectedTopItems;

    const name = bar.bar.data.name;

    if (event.shiftKey) {
      _selectedBars = selectedBars.slice();
      _selectedTopItems = selectedTopItems.slice();

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
        _selectedTopItems.push(name);
      } else {
        event.target.classList.remove('barActive');
        _selectedBars.splice(index, 1);
        _selectedTopItems.splice(index, 1);
      }

    } else {

      let exist = false;

      selectedBars.forEach(selectedBar => {
        selectedBar.classList.remove('barActive');
        if (selectedBar === event.target) exist = true;
      });

      if (exist && selectedBars.length === 1) {
        _selectedTopItems = [];
        _selectedBars = [];
      } else {
        _selectedTopItems = [name];
        _selectedBars = [event.target];
        event.target.classList.add('barActive');
      }
    }

    this.setState({
      selectedBars: _selectedBars,
    });

    this.props.handleFilter({
      selectedTopItems: _selectedTopItems,
    });

  };

  _handleLabel = (event, month) => {
    return;
    /*
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
    });*/
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

      top = event.nativeEvent.layerY;
      left = event.clientX;
      data = bar;
    } else {
      top = event.nativeEvent.layerY;
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
    var { data, maxData , selectedTopItems} = this.state;

    const width = window.innerWidth - 15;
    const height = 300;
    const margin = {
      top: 10,
      right: 0,
      bottom: 20,
      left: 80
    };

    const { pageYOffset, xMax, yMax } = getParams(window, width, height, margin);
    const offsetX = 3.5;
    const offsetWidth = - 1.2;

    const x = d => d.name;

    data = data.sort((a,b) => ( (-a.value + b.value) ));
    // scales
    const xScale = scaleBand({
      domain: data.map(x),
      rangeRound: [0, xMax],
      padding: 0.2
    });
    const yScale = scaleLinear({
      domain: [0, maxData ],
      range: [yMax, 0],
      nice: true
    });

    let keys =  [];
    keys.push("value");

    const color = scaleOrdinal({
      domain: keys,
      range: [positiveActiveColor]
    });

    return (
      <div className={classes.root}>
      <div className="">
            <FormControl className={classes.formControl}>
              <NativeSelect
                value={filterName}
                name="filterName"
                onChange={this.handleFilter}
              >
                <option value='Director'>Director</option>
                <option value='Project Type'>Project Type</option>
              </NativeSelect>
            </FormControl>
          </div>
        <div className="well">
          <svg width={width} height={height}>
              <rect x={0} y={0} width={width} height={height} fill={'transparent'} onClick={this._deSelectAll}  />

              <Group top={margin.top} left={margin.left}>
                <BarStack data={data}  keys={keys} x={x} xScale={xScale}  yScale={yScale} color={color}>
                  {( barStacks ) => {
                    return barStacks.map(barStack => {
                      return barStack.bars.map(bar => {
                        return (
                          <rect
                            key={`bar-income-${barStack.index}-${bar.index}`}
                            x={bar.x}
                            y={bar.y}
                            height={isNaN(bar.height) ? 0 : Math.abs(bar.height)}
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

                <AxisLeft
                  numTicks={4}
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
                      {...tickProps} fill={selectedTopItems.indexOf(formattedValue) > -1 ? 'white' : 'black'}
                      onClick={(event) => this._handleLabel(event, formattedValue)}
                    >
                      {formattedValue}
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
                    <div className="pdv-10">
                      <strong>{tooltipData.bar.data.name} </strong>
                    </div>
                    <div className="ft-12">
                      WIH: <strong>${thousandFormat(tooltipData.bar.data.value)}</strong>
                    </div>
                  </div>
                  :
                  <div>
                    Sum IncomeMTDForecast HistoricalOnly = {thousandFormat(tooltipData.forecast)}
                  </div>
                }
              </Tooltip>
            )}


        </div>
      </div>
    );
  }

}


TopChart.propTypes = {
  classes: PropTypes.object.isRequired,
  summaryData: PropTypes.array.isRequired,
  selectedTopItems: PropTypes.array.isRequired,

  handleFilter: PropTypes.func.isRequired
};

export default withStyles(styles)(withTooltip(TopChart));
