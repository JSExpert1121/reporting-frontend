import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Truncate from 'react-truncate';

import { withTooltip, Tooltip } from "@vx/tooltip";

import { withStyles } from '@material-ui/core/styles';
import {
  Grid ,Select,

} from '@material-ui/core';

import {
  getParams,

  thousandFormat,
  thousandFormat2
} from "../../../../Utils/Functions";
import {
  tooltip,
  empty, barThinHeight,  formatedStyle,
} from "../../../../Assets/js/constant";

import { styles } from './style';
import ReactDOM from 'react-dom';

class BottomChart extends Component {

  _isMounted = false;
  constructor(props) {
    super(props);

    this.state = {
      resize: false,
      data: [],
      hoverBar: null,
      selectedIdRects: [],
      selectedItems: [],
      PageOffset: 0 ,
      selectedOption: "YTDForecast",
      selfRect: null
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
    var rect = ReactDOM.findDOMNode(this)
      .getBoundingClientRect();
      this.setState({selfRect:rect});
  }

  componentWillUnmount() {
    this._isMounted = false;
    window.removeEventListener('resize', this.onResize.bind(this));
  }

  componentDidUpdate(prevProps, prevState){

      if(prevProps.detailData !== this.props.detailData ||
        (this.props.selectedTopItems.length !== 0 &&
          prevProps.selectedTopItems !== this.props.selectedTopItems)
      )
      {
        if(this._isMounted === true)
        {  this.prepareData();
          var rect = ReactDOM.findDOMNode(this)
            .getBoundingClientRect();
            this.setState({selfRect:rect});
        }
      }

  }

  prepareData = () => {
    const { detailData , selectedTopItems} = this.props;

    let data = [];

    let incomeData = {} , expenseData = {} , profits = {};
    let incomeTotal = {}, expenseTotal = {} , profits_pc = {};
    let indexes = ["Actual", "Budget", "Forecast", "ActualVsBudgetVariance","ActualVsForecastVariance"
    , "YTDActual", "YTDBudget", "YTDForecast","YTDActualVsBudgetVariance", "YTDActualVsForecastVariance"];

    selectedTopItems.sort( (a , b) => ( a['year'] - b['year']));
    this.setState({selectedItems:selectedTopItems});

    if(detailData === {})
      return;

    selectedTopItems.forEach( item => {

      incomeData[item.year] = [];
      expenseData[item.year] = [];
      profits[item.year] = [];
      incomeTotal[item.year] = {};
      expenseTotal[item.year] = {};
      profits_pc[item.year] = {};

      indexes.forEach(i => {
        incomeTotal[item.year][i] = 0;
        expenseTotal[item.year][i] = 0;
        profits_pc[item.year][i] = 0;
      });

    });

    Object.keys(detailData).map(key => {
      detailData[key].forEach(item => {

        if(key === "IncomeExpense")
        {
          if(item.IncomeStatementCategory === "Income")
          {
            if(incomeData[item.FY] !== undefined)
              incomeData[item.FY].push(item);
          } else {
            if(expenseData[item.FY] !== undefined)
              expenseData[item.FY].push(item);
          }
        } else {
          if(profits[item.FY] !== undefined)
            profits[item.FY].push(item);
        }
      });
    });

    // calculate totals
    selectedTopItems.forEach( item => {
      indexes.forEach(i => {

        incomeData[item.year].forEach( j =>{
          incomeTotal[item.year][i] += j[i];
        });

        expenseData[item.year].forEach( j =>{
          expenseTotal[item.year][i] += j[i];
        });

          profits_pc[item.year][i] = ((incomeTotal[item.year][i] - expenseTotal[item.year][i]) / incomeTotal[item.year][i]) * 100;

       });

      incomeTotal[item.year]['FY'] = item.year;
      expenseTotal[item.year]['FY'] = item.year;

      // fix variance value
      profits_pc[item.year]['ActualVsBudgetVariance'] =  profits_pc[item.year]['Actual'] - profits_pc[item.year]['Budget'];
      profits_pc[item.year]['ActualVsForecastVariance'] =  profits_pc[item.year]['Actual'] - profits_pc[item.year]['Forecast'];
      profits_pc[item.year]['YTDActualVsBudgetVariance'] =  profits_pc[item.year]['YTDActual'] - profits_pc[item.year]['YTDBudget'];
      profits_pc[item.year]['YTDActualVsForecastVariance'] =  profits_pc[item.year]['YTDActual'] - profits_pc[item.year]['YTDForecast'];
      profits_pc[item.year]['FY'] = item.year;
    });


    data.push( {'income':incomeData,'expense':expenseData, 'profit': profits,
      'incomeTotal':incomeTotal, 'expenseTotal':expenseTotal , 'profits_pc':profits_pc} );

    this.setState({data});
    this.deSelectAll();
  };

  handleElement = (event, element, data) => {
    const {  selectedIdRects} = this.state;
    let  _selectedIdRects = [];
    let exist = false, index = NaN;

    switch (element) {

      case 'table':
        if (event.shiftKey) {

          _selectedIdRects = selectedIdRects.slice();

          for (let i = 0; i < selectedIdRects.length; i++) {
            if (selectedIdRects[i] === event.target) {
              index = i;
              break;
            }
          }

          if (isNaN(index)) {
            event.target.classList.add('bkgActive');
            _selectedIdRects.push(event.target);

          } else {
            event.target.classList.remove('bkgActive');
            _selectedIdRects.splice(index, 1);

          }

        } else {

          selectedIdRects.forEach(rect => {
            rect.classList.remove('bkgActive');
            if (rect === event.target) exist = true;
          });

          if (exist && selectedIdRects.length === 1) {

            _selectedIdRects = [];

          } else {
            event.target.classList.add('bkgActive');

            _selectedIdRects = [event.target];

          }
        }
        break;

      default:
        break;
    }

    this.setState({
      selectedIdRects: _selectedIdRects
    });
  };

  deSelectAll = () => {
    const { selectedIdRects} = this.state;

    selectedIdRects.forEach(rect => {
      rect.classList.remove('bkgActive');
    });

    this.setState({
      selectedIdRects: []
    });
  };

  showTooltip = (event, data, table , op = "") => {
    const { showTooltip } = this.props;

    let tooltipData, top, left;

    top = event.pageY - this.state.PageOffset - 80;
    left = window.innerWidth * 2 / 3 < event.clientX?event.clientX - 250:event.clientX;

    tooltipData = data;
    tooltipData['option'] = table;

    if(op === '')
      tooltipData['disp'] = table;
    else
      tooltipData['disp'] = op;

    if (table) {
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

  handlePos = (event) => {
    const {PageOffset} = this.state;
    const _pos = event.currentTarget.getBoundingClientRect().top + window.scrollY;
    if( (PageOffset !== _pos ) && this._isMounted === true)
    {
      this.setState({PageOffset: _pos})
    }
  }

  hideTooltip = () => {
    const { hideTooltip } = this.props;
    const { hoverBar } = this.state;

    if (hoverBar) hoverBar.classList.remove('barHover');
    this.setState({hoverBar: null});

    hideTooltip();
  };

  handleChange =  (event) => {
    this.setState({selectedOption : event.target.value});
  };

  render() {
    const {
      classes,
      tooltipOpen, tooltipLeft, tooltipTop, tooltipData ,
    } = this.props;

    const { data, selectedItems , selectedOption, selfRect} = this.state;
    let offset = 0;
    if(selfRect !== null)
    {
      offset = selfRect.top;
      if(offset === null) offset = 0;
    }
    const width = (window.innerWidth - 10) ;
    const height =  window.innerHeight -  offset - 40 - 45;
    const margin = {
      top: 0,
      right: 10,
      bottom: 0,
      left: 10
    };

    const { pageYOffset, xMax, yMax } = getParams(window, width, height, margin);


    let cellwidth = (xMax) / (2 * (selectedItems.length + 1)) ;
    let headerWidth = (cellwidth * 2);

    let tooltipTimeout;

    return (
      <div className={classes.root}
        onMouseMove={event => this.handlePos(event)}
        onTouchMove={event => this.handlePos(event)}>
        <div>
          <div>
            <strong>Profit / Loss vs </strong>&nbsp; &nbsp; &nbsp;
            <Select native onChange={this.handleChange}>
              <option value={"YTDForecast"}>Forecast</option>
              <option value={"YTDBudget"}>Budget</option>
            </Select>
          </div>
        </div>

        <div style={{overflowY:'auto' ,maxHeight:`${yMax}px`, overflowX :'hidden'}}>
          <div className="flex" >
            {
              selectedItems.map( (item , i) =>
              {
                return(
                  <div key={i} style={{'width':(cellwidth * 2 + (i===0?headerWidth:0) ) , paddingRight:'1px'}} className={i%2===1?`tableColor1`:``}>
                    <Grid container>
                      <Grid item md={12} sm={12} xs={12}>
                        <div className="flex" align="center">
                          {
                            i===0?
                              <p style={formatedStyle(headerWidth, 12, 0 , 1)} >
                              </p>
                              :
                              ""
                          }

                          <p style={formatedStyle(cellwidth * 2 , 12, 0 , 1)} >
                            {item.year}
                          </p>

                        </div>
                        <div  className="flex" align="right">
                          {
                            i===0?
                            <p style={formatedStyle(headerWidth, 12, 0 , 1)} >
                            </p>
                              :
                              ""
                          }

                          <p style={formatedStyle(cellwidth , 12, 0 , 1)} >
                            <Truncate
                              width={cellwidth}
                              ellipsis={(
                                <span>...</span>
                              )}
                              onTruncate={this.handleTruncate}
                            >
                              Actual
                            </Truncate>

                          </p>


                          <p style={formatedStyle(cellwidth , 12, 0 , 1)} >
                            <Truncate
                              width={cellwidth}
                              ellipsis={(
                                <span>...</span>
                              )}
                              onTruncate={this.handleTruncate}
                            >
                              Budget/FC
                            </Truncate>
                          </p>

                        </div>
                      </Grid>
                    </Grid>
                  </div>
                );

              })
            }
          </div>

          <div className="flex" >
            {
              selectedItems.map( (item , i) =>
              {
                let _incomeData = data[0]['income'][item.year];
                let _expenseData = data[0]['expense'][item.year];

                return (
                  <div key = {parseInt(i) + 100} style={{borderTop: 'solid 1px #d7d7d7',borderRight: 'solid 1px #d7d7d7'}}>
                    {
                      // **************** Income Data *************************
                      _incomeData.map((_rowdata, key) => {

                        return (

                          <div  key= {key} className={key%2===1?i%2===1?`classes.rows tableColor3`:`classes.rows`:`classes.rows tableColor1`}
                               style={{'width': (cellwidth * 2 + (i === 0 ? headerWidth : 0)) }}>
                            <Grid container>
                              <Grid item md={12} sm={12} xs={12}>
                                <div className="flex" align="right" style={{paddingRight:'5px' , height:'20px'}}>
                                  {
                                    i === 0 ?
                                      <div className="flex" style={{borderRight: 'solid 1px #d7d7d7', }} align='left'>
                                        <p style={formatedStyle(headerWidth / 2, 11)} className={` grayHover`}>
                                          {key===0?<strong>Income</strong>:''}
                                        </p>
                                        <p style={formatedStyle(headerWidth / 2, 11)} className={` grayHover`}>
                                          <Truncate
                                            width={headerWidth / 2}
                                            ellipsis={(
                                              <span>...</span>
                                            )}
                                            onTruncate={this.handleTruncate}
                                          >
                                            {_rowdata.IncomeStatementSubCategory}
                                          </Truncate>

                                        </p>
                                      </div>
                                      :
                                      ""
                                  }
                                  <p style={formatedStyle(cellwidth, 11 )} className={`grayHover`}
                                     onClick={event => {
                                       this.handleElement(event, 'table', _rowdata);
                                     }}
                                     onMouseMove={event => {
                                       if (tooltipTimeout) clearTimeout(tooltipTimeout);
                                       this.showTooltip(event, _rowdata , 'YTDActual');
                                     }}
                                     onMouseLeave={event => {
                                       tooltipTimeout = setTimeout(() => {
                                         this.hideTooltip();
                                       }, 300);
                                     }}
                                     onTouchMove={event => {
                                       if (tooltipTimeout) clearTimeout(tooltipTimeout);
                                       this.showTooltip(event, _rowdata , 'YTDActual');
                                     }}
                                     onTouchEnd={event => {
                                       tooltipTimeout = setTimeout(() => {
                                         this.hideTooltip();
                                       }, 300);
                                     }}
                                  >
                                    <Truncate
                                      width={cellwidth}
                                      ellipsis={(
                                        <span>...</span>
                                      )}
                                      onTruncate={this.handleTruncate}
                                    >
                                      {thousandFormat2(_rowdata.YTDActual)}
                                    </Truncate>

                                  </p>
                                  <p style={formatedStyle(cellwidth, 11)} className={`grayHover`}
                                     onClick={event => {
                                       this.handleElement(event, 'table', _rowdata);
                                     }}
                                     onMouseMove={event => {
                                       if (tooltipTimeout) clearTimeout(tooltipTimeout);
                                       this.showTooltip(event, _rowdata , selectedOption);
                                     }}
                                     onMouseLeave={event => {
                                       tooltipTimeout = setTimeout(() => {
                                         this.hideTooltip();
                                       }, 300);
                                     }}
                                     onTouchMove={event => {
                                       if (tooltipTimeout) clearTimeout(tooltipTimeout);
                                       this.showTooltip(event, _rowdata , selectedOption);
                                     }}
                                     onTouchEnd={event => {
                                       tooltipTimeout = setTimeout(() => {
                                         this.hideTooltip();
                                       }, 300);
                                     }}
                                  >
                                    <Truncate
                                      width={cellwidth}
                                      ellipsis={(
                                        <span>...</span>
                                      )}
                                      onTruncate={this.handleTruncate}
                                    >
                                      {thousandFormat2(_rowdata[selectedOption]/*.YTDBudget*/)}
                                    </Truncate>

                                  </p>
                                </div>
                              </Grid>
                            </Grid>
                          </div>
                        )
                      })
                    }

                    {
                      // ***************** Income Total *************************
                    }
                    <div  className={classes.rows}
                         style={{
                           'width': (cellwidth * 2 + (i === 0 ? headerWidth : 0)),
                           borderTop: 'solid 1px #d7d7d7',
                           borderBottom: 'solid 1px #d7d7d7',
                         }}
                          className={i%2===1?`classes.rows tableColor1`:`classes.rows`}
                    >
                      <Grid container>
                        <Grid item md={12} sm={12} xs={12}>
                          <div className="flex" align="right" style={{paddingRight:'5px', height:'20px'}}>
                            {
                              i === 0 ?
                                <div className="flex" style={{borderRight: 'solid 1px #d7d7d7', }} align='left'>
                                  <p style={formatedStyle(headerWidth / 2, 11 , 0 , 1)} className={` grayHover`}>
                                  </p>
                                  <p style={formatedStyle(headerWidth / 2, 11 , 0 , 1)} className={` grayHover`}>
                                    Total
                                  </p>
                                </div>
                                :
                                ""
                            }
                            <p style={formatedStyle(cellwidth, 11 , 0 , 1)} className={` grayHover`}
                               onClick={event => {
                                 this.handleElement(event, 'table', data[0]['incomeTotal'][item.year]);
                               }}
                               onMouseMove={event => {
                                 if (tooltipTimeout) clearTimeout(tooltipTimeout);
                                 this.showTooltip(event, data[0]['incomeTotal'][item.year] , 'YTDActual' , 'Total');
                               }}
                               onMouseLeave={event => {
                                 tooltipTimeout = setTimeout(() => {
                                   this.hideTooltip();
                                 }, 300);
                               }}
                               onTouchMove={event => {
                                 if (tooltipTimeout) clearTimeout(tooltipTimeout);
                                 this.showTooltip(event, data[0]['incomeTotal'][item.year] , 'YTDActual', 'Total');
                               }}
                               onTouchEnd={event => {
                                 tooltipTimeout = setTimeout(() => {
                                   this.hideTooltip();
                                 }, 300);
                               }}
                            >
                              <Truncate
                                width={cellwidth}
                                ellipsis={(
                                  <span>...</span>
                                )}
                                onTruncate={this.handleTruncate}
                              >
                                {thousandFormat2(data[0]['incomeTotal'][item.year].YTDActual)}
                              </Truncate>


                            </p>
                            <p style={formatedStyle(cellwidth, 11 , 0 , 1)} className={` grayHover`}
                               onClick={event => {
                                 this.handleElement(event, 'table', data[0]['incomeTotal'][item.year]);
                               }}
                               onMouseMove={event => {
                                 if (tooltipTimeout) clearTimeout(tooltipTimeout);
                                 this.showTooltip(event, data[0]['incomeTotal'][item.year] , selectedOption, 'Total');
                               }}
                               onMouseLeave={event => {
                                 tooltipTimeout = setTimeout(() => {
                                   this.hideTooltip();
                                 }, 300);
                               }}
                               onTouchMove={event => {
                                 if (tooltipTimeout) clearTimeout(tooltipTimeout);
                                 this.showTooltip(event, data[0]['incomeTotal'][item.year] , selectedOption, 'Total');
                               }}
                               onTouchEnd={event => {
                                 tooltipTimeout = setTimeout(() => {
                                   this.hideTooltip();
                                 }, 300);
                               }}
                            >
                              <Truncate
                                width={cellwidth}
                                ellipsis={(
                                  <span>...</span>
                                )}
                                onTruncate={this.handleTruncate}
                              >
                                {thousandFormat2(data[0]['incomeTotal'][item.year][selectedOption])}
                              </Truncate>

                            </p>
                          </div>
                        </Grid>
                      </Grid>
                    </div>

                    {
                      // *********************** Expense Data *********************
                      _expenseData.map((_rowdata, key) => {

                        return (

                          <div key={key} key= {key} className={key%2===0?i%2===1?`classes.rows tableColor3`:`classes.rows`:`classes.rows tableColor1`}
                               style={{'width': (cellwidth * 2 + (i === 0 ? headerWidth : 0)) }}>
                            <Grid container>
                              <Grid item md={12} sm={12} xs={12}>
                                <div className="flex" align="right" style={{paddingRight:'5px' , height:'20px'}}>
                                  {
                                    i === 0 ?
                                      <div className="flex" style={{borderRight: 'solid 1px #d7d7d7', }} align='left'>
                                        <p style={formatedStyle(headerWidth / 2, 11)} className={` grayHover`}>
                                          {key==0?<strong>Less Expenses</strong>:''}
                                        </p>
                                        <p style={formatedStyle(headerWidth / 2, 11)} className={` grayHover`}>
                                          <Truncate
                                            width={headerWidth / 2}
                                            ellipsis={(
                                              <span>...</span>
                                            )}
                                            onTruncate={this.handleTruncate}
                                          >
                                            {_rowdata.IncomeStatementSubCategory}
                                          </Truncate>


                                        </p>
                                      </div>
                                      :
                                      ""
                                  }
                                  <p style={formatedStyle(cellwidth, 11 )} className={` grayHover`}
                                     onClick={event => {
                                       this.handleElement(event, 'table', _rowdata);
                                     }}
                                     onMouseMove={event => {
                                       if (tooltipTimeout) clearTimeout(tooltipTimeout);
                                       this.showTooltip(event, _rowdata , 'YTDActual');
                                     }}
                                     onMouseLeave={event => {
                                       tooltipTimeout = setTimeout(() => {
                                         this.hideTooltip();
                                       }, 300);
                                     }}
                                     onTouchMove={event => {
                                       if (tooltipTimeout) clearTimeout(tooltipTimeout);
                                       this.showTooltip(event, _rowdata , 'YTDActual');
                                     }}
                                     onTouchEnd={event => {
                                       tooltipTimeout = setTimeout(() => {
                                         this.hideTooltip();
                                       }, 300);
                                     }}
                                  >
                                    <Truncate
                                      width={cellwidth}
                                      ellipsis={(
                                        <span>...</span>
                                      )}
                                      onTruncate={this.handleTruncate}
                                    >

                                    {thousandFormat2(_rowdata.YTDActual)}
                                    </Truncate>

                                  </p>
                                  <p style={formatedStyle(cellwidth, 11)} className={` grayHover`}
                                     onClick={event => {
                                       this.handleElement(event, 'table', _rowdata);
                                     }}
                                     onMouseMove={event => {
                                       if (tooltipTimeout) clearTimeout(tooltipTimeout);
                                       this.showTooltip(event, _rowdata , selectedOption);
                                     }}
                                     onMouseLeave={event => {
                                       tooltipTimeout = setTimeout(() => {
                                         this.hideTooltip();
                                       }, 300);
                                     }}
                                     onTouchMove={event => {
                                       if (tooltipTimeout) clearTimeout(tooltipTimeout);
                                       this.showTooltip(event, _rowdata , selectedOption);
                                     }}
                                     onTouchEnd={event => {
                                       tooltipTimeout = setTimeout(() => {
                                         this.hideTooltip();
                                       }, 300);
                                     }}
                                  >
                                    <Truncate
                                      width={cellwidth}
                                      ellipsis={(
                                        <span>...</span>
                                      )}
                                      onTruncate={this.handleTruncate}
                                    >
                                      {thousandFormat2(_rowdata[selectedOption])}
                                    </Truncate>


                                  </p>
                                </div>
                              </Grid>
                            </Grid>
                          </div>
                        )

                      })
                    }

                    {
                      // ********************** Expense Total ***********************
                    }

                    <div
                      className={i%2===1?`classes.rows tableColor1`:`classes.rows`}
                         style={{
                           'width': (cellwidth * 2 + (i === 0 ? headerWidth : 0)),
                           borderTop: 'solid 1px #d7d7d7',
                           borderBottom: 'solid 1px #d7d7d7',
                         }}>
                      <Grid container>
                        <Grid item md={12} sm={12} xs={12}>
                          <div className="flex" align="right" style={{paddingRight:'5px', height:'20px'}}>
                            {
                              i === 0 ?
                                <div className="flex" style={{borderRight: 'solid 1px #d7d7d7', }} align='left'>
                                  <p style={formatedStyle(headerWidth / 2, 11 , 0 , 1)} className={` grayHover`}>
                                  </p>
                                  <p style={formatedStyle(headerWidth / 2, 11 , 0 , 1)} className={` grayHover`}>
                                    Total
                                  </p>
                                </div>
                                :
                                ""
                            }
                            <p style={formatedStyle(cellwidth, 11 , 0 , 1)} className={` grayHover`}
                               onClick={event => {
                                 this.handleElement(event, 'table', data[0]['expenseTotal'][item.year]);
                               }}
                               onMouseMove={event => {
                                 if (tooltipTimeout) clearTimeout(tooltipTimeout);
                                 this.showTooltip(event, data[0]['expenseTotal'][item.year] , 'YTDActual', 'Total');
                               }}
                               onMouseLeave={event => {
                                 tooltipTimeout = setTimeout(() => {
                                   this.hideTooltip();
                                 }, 300);
                               }}
                               onTouchMove={event => {
                                 if (tooltipTimeout) clearTimeout(tooltipTimeout);
                                 this.showTooltip(event, data[0]['expenseTotal'][item.year] , 'YTDActual', 'Total');
                               }}
                               onTouchEnd={event => {
                                 tooltipTimeout = setTimeout(() => {
                                   this.hideTooltip();
                                 }, 300);
                               }}
                            >
                              <Truncate
                                width={cellwidth}
                                ellipsis={(
                                  <span>...</span>
                                )}
                                onTruncate={this.handleTruncate}
                              >
                                {thousandFormat2(data[0]['expenseTotal'][item.year].YTDActual)}
                              </Truncate>

                            </p>
                            <p style={formatedStyle(cellwidth, 11 , 0 , 1)} className={` grayHover`}
                               onClick={event => {
                                 this.handleElement(event, 'table', data[0]['expenseTotal'][item.year]);
                               }}
                               onMouseMove={event => {
                                 if (tooltipTimeout) clearTimeout(tooltipTimeout);
                                 this.showTooltip(event, data[0]['expenseTotal'][item.year] , selectedOption, 'Total');
                               }}
                               onMouseLeave={event => {
                                 tooltipTimeout = setTimeout(() => {
                                   this.hideTooltip();
                                 }, 300);
                               }}
                               onTouchMove={event => {
                                 if (tooltipTimeout) clearTimeout(tooltipTimeout);
                                 this.showTooltip(event, data[0]['expenseTotal'][item.year] , selectedOption, 'Total');
                               }}
                               onTouchEnd={event => {
                                 tooltipTimeout = setTimeout(() => {
                                   this.hideTooltip();
                                 }, 300);
                               }}
                            >
                              <Truncate
                                width={cellwidth}
                                ellipsis={(
                                  <span>...</span>
                                )}
                                onTruncate={this.handleTruncate}
                              >
                                {thousandFormat2(data[0]['expenseTotal'][item.year][selectedOption])}
                              </Truncate>

                            </p>
                          </div>
                        </Grid>
                      </Grid>
                    </div>

                    {
                      // ******************************* Profit /Loss ************************
                    }

                    <div  className={classes.rows}
                         style={{
                           'width': (cellwidth * 2 + (i === 0 ? headerWidth : 0)),
                         }}>

                      <Grid container>
                        {
                          data[0]['profit'][item.year].length !== 0?
                            <Grid item md={12} sm={12} xs={12}>
                              <div className="flex tableColor1" align="right" style={{paddingRight: '5px', height:'20px'}}>
                                {
                                  i === 0 ?
                                    <div className="flex" style={{borderRight: 'solid 1px #d7d7d7',}} align='left'>
                                      <p style={formatedStyle(headerWidth, 11 , 0 , 1)} className={` grayHover`}>
                                        Profit/Loss
                                      </p>
                                    </div>
                                    :
                                    ""
                                }
                                <p style={formatedStyle(cellwidth, 11, 0 , 1)} className={` grayHover`}
                                   onClick={event => {
                                     this.handleElement(event, 'table', data[0]['profit'][item.year][0]);
                                   }}
                                   onMouseMove={event => {
                                     if (tooltipTimeout) clearTimeout(tooltipTimeout);
                                     this.showTooltip(event, data[0]['profit'][item.year][0], 'YTDActualProfit', 'Profit/Loss');
                                   }}
                                   onMouseLeave={event => {
                                     tooltipTimeout = setTimeout(() => {
                                       this.hideTooltip();
                                     }, 300);
                                   }}
                                   onTouchMove={event => {
                                     if (tooltipTimeout) clearTimeout(tooltipTimeout);
                                     this.showTooltip(event, data[0]['profit'][item.year][0], 'YTDActualProfit', 'Profit/Loss');
                                   }}
                                   onTouchEnd={event => {
                                     tooltipTimeout = setTimeout(() => {
                                       this.hideTooltip();
                                     }, 300);
                                   }}
                                >
                                  <Truncate
                                    width={cellwidth}
                                    ellipsis={(
                                      <span>...</span>
                                    )}
                                    onTruncate={this.handleTruncate}
                                  >
                                    {thousandFormat2(data[0]['profit'][item.year][0].YTDActualProfit)}
                                  </Truncate>

                                </p>
                                <p style={formatedStyle(cellwidth, 11 , 0 , 1)} className={` grayHover`}
                                   onClick={event => {
                                     this.handleElement(event, 'table', data[0]['profit'][item.year][0]);
                                   }}
                                   onMouseMove={event => {
                                     if (tooltipTimeout) clearTimeout(tooltipTimeout);
                                     this.showTooltip(event, data[0]['profit'][item.year][0], 'YTDBudgetProfit', 'Profit/Loss');
                                   }}
                                   onMouseLeave={event => {
                                     tooltipTimeout = setTimeout(() => {
                                       this.hideTooltip();
                                     }, 300);
                                   }}
                                   onTouchMove={event => {
                                     if (tooltipTimeout) clearTimeout(tooltipTimeout);
                                     this.showTooltip(event, data[0]['profit'][item.year][0], 'YTDBudgetProfit', 'Profit/Loss');
                                   }}
                                   onTouchEnd={event => {
                                     tooltipTimeout = setTimeout(() => {
                                       this.hideTooltip();
                                     }, 300);
                                   }}
                                >
                                  <Truncate
                                    width={cellwidth}
                                    ellipsis={(
                                      <span>...</span>
                                    )}
                                    onTruncate={this.handleTruncate}
                                  >
                                    {thousandFormat2(data[0]['profit'][item.year][0].YTDBudgetProfit)}
                                  </Truncate>

                                </p>
                              </div>
                            </Grid>
                            :
                            ""
                        }
                        {
                          // **************************** Profit percent *************************
                        }
                        <Grid item md={12} sm={12} xs={12}>
                          <div className="flex" align = "right"
                               style={{paddingRight:'5px', borderTop: 'solid 1px #d7d7d7', borderBottom: 'solid 1px #d7d7d7'}}>
                            {
                              i === 0 ?
                                <div className="flex" style={{borderRight: 'solid 1px #d7d7d7'}} align ='left'>
                                  <p style={formatedStyle(headerWidth , 11 , 0 , 1)} className={` grayHover`}>
                                    % Profit
                                  </p>
                                </div>
                                :
                                ""
                            }
                            <p style={formatedStyle(cellwidth, 11 , 0 , 1 )} className={` grayHover`}
                               onClick={event => {
                                 this.handleElement(event, 'table', data[0]['profits_pc'][item.year]);
                               }}
                               onMouseMove={event => {
                                 if (tooltipTimeout) clearTimeout(tooltipTimeout);
                                 this.showTooltip(event, data[0]['profits_pc'][item.year] , 'YTDActual', 'percent');
                               }}
                               onMouseLeave={event => {
                                 tooltipTimeout = setTimeout(() => {
                                   this.hideTooltip();
                                 }, 300);
                               }}
                               onTouchMove={event => {
                                 if (tooltipTimeout) clearTimeout(tooltipTimeout);
                                 this.showTooltip(event, data[0]['profits_pc'][item.year] , 'YTDActual', 'percent');
                               }}
                               onTouchEnd={event => {
                                 tooltipTimeout = setTimeout(() => {
                                   this.hideTooltip();
                                 }, 300);
                               }}
                            >
                              <Truncate
                                width={cellwidth}
                                ellipsis={(
                                  <span>...</span>
                                )}
                                onTruncate={this.handleTruncate}
                              >
                                {thousandFormat(data[0]['profits_pc'][item.year].YTDActual)} %
                              </Truncate>

                            </p>
                            <p style={formatedStyle(cellwidth, 11 , 0 , 1)} className={` grayHover`}
                               onClick={event => {
                                 this.handleElement(event, 'table', data[0]['profits_pc'][item.year]);
                               }}
                               onMouseMove={event => {
                                 if (tooltipTimeout) clearTimeout(tooltipTimeout);
                                 this.showTooltip(event, data[0]['profits_pc'][item.year] , selectedOption, 'percent');
                               }}
                               onMouseLeave={event => {
                                 tooltipTimeout = setTimeout(() => {
                                   this.hideTooltip();
                                 }, 300);
                               }}
                               onTouchMove={event => {
                                 if (tooltipTimeout) clearTimeout(tooltipTimeout);
                                 this.showTooltip(event, data[0]['profits_pc'][item.year] , selectedOption, 'percent');
                               }}
                               onTouchEnd={event => {
                                 tooltipTimeout = setTimeout(() => {
                                   this.hideTooltip();
                                 }, 300);
                               }}
                            >
                              <Truncate
                                width={cellwidth}
                                ellipsis={(
                                  <span>...</span>
                                )}
                                onTruncate={this.handleTruncate}
                              >
                                {thousandFormat(data[0]['profits_pc'][item.year][selectedOption])} %
                              </Truncate>

                            </p>
                          </div>
                        </Grid>
                      </Grid>
                    </div>

                  </div>
                )
              })
            }
          </div>
        </div>
        {tooltipOpen && (
          <Tooltip
            top={tooltipTop + pageYOffset}
            left={tooltipLeft}
            style={tooltip}
          >
            {tooltipData.option ?
              <div style={{minWidth:'200px'/*,minHeight:'50px'*/}}>
                <div className="ft-12">FY: <strong>{(tooltipData["FY"])}</strong></div>
                {
                  tooltipData["IncomeStatementSubCategory"] !== undefined?
                  <div className="ft-12">GL Sub Type: <strong>{(tooltipData["IncomeStatementSubCategory"])}</strong>
                  </div>
                    :
                    ""
                }
                {
                  tooltipData["IncomeStatementCategory"] !== undefined?
                  <div
                    className="ft-12">IncomeStatementCategory: <strong>{tooltipData["IncomeStatementCategory"]}</strong>
                  </div>
                    :
                    ""
                }
                <div className="ft-12">{tooltipData.disp }:
                  <strong>
                    {tooltipData.disp==='percent'?'':'$'}
                    {thousandFormat(tooltipData[tooltipData.option])}
                    {tooltipData.disp==='percent'?'%':''}
                  </strong>
                </div>
              </div>
              :
              <div>
                No data
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

  detailData: PropTypes.object.isRequired,

  selectedYears: PropTypes.array.isRequired,
  selectedTopItems:PropTypes.array.isRequired,
};

export default withStyles(styles)(withTooltip(BottomChart));
