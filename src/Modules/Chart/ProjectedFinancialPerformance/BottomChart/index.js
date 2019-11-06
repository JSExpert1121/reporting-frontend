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


class BottomChart extends Component {

  _isMounted = false;
  constructor(props) {
    super(props);

    this.state = {
      resize: false,
      data: [],
      hoverBar: null,
      columnIndexes: [],
      profitIndexes:[],
      selectedIdRects: [],
      selectedItems: [],
      selectedOption: "Forecast"
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
    const indexes = ["Actual", "Budget", "Forecast", "ActualVsBudgetVariance","ActualVsForecastVariance"
      , "YTDActual", "YTDBudget", "YTDForecast","YTDActualVsBudgetVariance", "YTDActualVsForecastVariance"];
    const profit_indexes = ["ActualProfit", "BudgetProfit", "ForecastProfit", "ActualVsBudgetProfitVariance","ActualVsForecastProfitVariance"
      , "YTDActualProfit", "YTDBudgetProfit", "YTDForecastProfit","YTDActualVsBudgetProfitVariance", "YTDActualVsForecastProfitVariance"];

    this.setState({columnIndexes:indexes , profitIndexes:profit_indexes})
    this.prepareData();
    window.addEventListener('resize', this.onResize.bind(this));
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
          this.prepareData();
      }
  }

  prepareData = () => {
    const { detailData , selectedTopItems} = this.props;
    const { columnIndexes , profitIndexes} = this.state;
    let data = [];

    let incomeData = [] , expenseData = [] , profits = [];
    let incomeTotal = [], expenseTotal = [] , profits_pc = [];


    selectedTopItems.sort( (a , b) => ( a['year'] - b['year']));
    this.setState({selectedItems:selectedTopItems});

    if(Object.keys(detailData).length === 0)
      return;

    columnIndexes.forEach(i => {
        incomeTotal[i] = 0;
        expenseTotal[i] = 0;
        profits_pc[i] = 0;
    });

    Object.keys(detailData).map(key => {
      detailData[key].forEach(item => {
        if(key === "IncomeExpense")
        {
          let data_existing = 0;
          if(item.IncomeStatementCategory === "Income")
          {
            incomeData.forEach( (d , k) =>{
              if(item.IncomeStatementCategory === d.IncomeStatementCategory &&
                item.IncomeStatementSubCategory === d.IncomeStatementSubCategory )
              {
                columnIndexes.forEach( (inx)=>{

                  d[inx] += item[inx];

                });
                data_existing = 1;

              }
            })

            if(data_existing === 0)
            {
              incomeData.push(item);
            }

          } else {
            expenseData.forEach( (d) =>{
              if(item.IncomeStatementCategory === d.IncomeStatementCategory &&
                item.IncomeStatementSubCategory === d.IncomeStatementSubCategory )
              {
                columnIndexes.forEach( (inx)=>{
                  d.inx += item.inx;
                });
                data_existing = 1;
              }
            })
            if(data_existing === 0)
              expenseData.push(item);

          }
        } else {
          let data_existing = 0;
          profits.forEach( (d) =>{
            profitIndexes.forEach( (inx)=>{
                d.inx += item.inx;
              });
              data_existing = 1;
          })

          if(data_existing === 0)
            profits.push(item);

        }
      });
    });

    // calculate totals

    columnIndexes.forEach(i => {

        incomeData.forEach( j =>{
          incomeTotal[i] += j[i];
        });

        expenseData.forEach( j =>{
          expenseTotal[i] += j[i];
        });

          profits_pc[i] = ((incomeTotal[i] - expenseTotal[i]) / incomeTotal[i]) * 100;

       });

      // fix variance value
      profits_pc['ActualVsBudgetVariance'] =  profits_pc['Actual'] - profits_pc['Budget'];
      profits_pc['ActualVsForecastVariance'] =  profits_pc['Actual'] - profits_pc['Forecast'];
      profits_pc['YTDActualVsBudgetVariance'] =  profits_pc['YTDActual'] - profits_pc['YTDBudget'];
      profits_pc['YTDActualVsForecastVariance'] =  profits_pc['YTDActual'] - profits_pc['YTDForecast'];


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

    if(event.clientY  > window.innerHeight - 400) {
      if(op === 'Profit/Loss')
        top = event.clientY - 500;
      else
        top = event.clientY - 550;
    }else {
      top = event.clientY - 450;
    }

    if( event.clientX > window.innerWidth - 200)
      left = event.clientX - 200;
    else
      left = event.clientX;

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

    const { data, selectedItems , selectedOption, columnIndexes, profitIndexes} = this.state;

    const width = (window.innerWidth - 15) ;
    const height = barThinHeight;
    const margin = {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    };

    const { pageYOffset, xMax, yMax } = getParams(window, width, height, margin);

    let headerWidth = (xMax / 5) ;
    let subRowWidth = (xMax - headerWidth) ;
    let tooltipTimeout;

    if(data.length === 0)
      return "";

    let _incomeData = data[0]['income'];
    let _expenseData = data[0]['expense'];
    let _incomeTotal = data[0]['incomeTotal'];
    let _expenseTotal = data[0]['expenseTotal'];
    let _profit = data[0]['profit'];
    let _profits_pc = data[0]['profits_pc'];

    return (
      <div className={classes.root}>
        <div>
          <div >Profit / Loss vs &nbsp; &nbsp; &nbsp;
            <Select native onChange={this.handleChange}>
              <option value={"Forecast"}>Forecast</option>
              <option value={"Budget"}>Budget</option>
            </Select>
          </div>
        </div>

        <div className="flex">
            <div style={{'width': (subRowWidth + headerWidth )}}>
              <Grid container>
                <Grid item md={12} sm={12} xs={12}>

                  <div  className="flex" align="right">

                    <p style={formatedStyle(headerWidth, 14, 0)} className={` subtitle`}>
                    </p>

                    <p style={formatedStyle(subRowWidth / 6 , 14, 0 )} className={`${classes.leftItem} subtitle`}>
                      <Truncate
                        width={subRowWidth / 6}
                        ellipsis={(
                          <span>...</span>
                        )}
                        onTruncate={this.handleTruncate}>
                        MTD Actual
                      </Truncate>

                    </p>
                    <p style={formatedStyle(subRowWidth / 6 , 14, 0 )} className={`${classes.leftItem} subtitle`}>
                      <Truncate
                        width={subRowWidth / 6}
                        ellipsis={(
                          <span>...</span>
                        )}
                        onTruncate={this.handleTruncate}>
                        MTD Budget/FC
                      </Truncate>
                    </p>
                    <p style={formatedStyle(subRowWidth / 6 , 14, 0 )} className={`${classes.leftItem} subtitle`}>
                      <Truncate
                        width={subRowWidth / 6}
                        ellipsis={(
                          <span>...</span>
                        )}
                        onTruncate={this.handleTruncate}>
                        MTD Variance
                      </Truncate>
                    </p>
                    <p style={formatedStyle(subRowWidth / 6 , 14, 0 )} className={`${classes.leftItem} subtitle`}>
                      <Truncate
                        width={subRowWidth / 6}
                        ellipsis={(
                          <span>...</span>
                        )}
                        onTruncate={this.handleTruncate}>
                        Annual Forcast
                      </Truncate>
                    </p>
                    <p style={formatedStyle(subRowWidth / 6 , 14, 0 )} className={`${classes.leftItem} subtitle`}>
                      <Truncate
                        width={subRowWidth / 6}
                        ellipsis={(
                          <span>...</span>
                        )}
                        onTruncate={this.handleTruncate}>
                        Annual Budget
                      </Truncate>
                    </p>
                    <p style={formatedStyle(subRowWidth / 6 , 14, 0 )} className={`${classes.leftItem} subtitle`}>
                      <Truncate
                        width={subRowWidth / 6}
                        ellipsis={(
                          <span>...</span>
                        )}
                        onTruncate={this.handleTruncate}>
                        Variance
                      </Truncate>
                    </p>
                  </div>
                </Grid>
              </Grid>
            </div>

        </div>

        <div className="flex" >

          <div style={{borderTop: 'solid 1px #a9a9a9',borderRight: 'solid 1px #a9a9a9'}}>
              {
                // **************** Income Data *************************
                _incomeData.map((_rowdata, key) => {

                  return (
                    <div  key= {key} className={key%2===0?`classes.rows`:`classes.rows tableColor1`}
                         style={{'width': (subRowWidth + headerWidth )}}>
                      <Grid container>
                        <Grid item md={12} sm={12} xs={12}>
                          <div className="flex" align="right" style={{paddingRight:'5px'}}>
                            {
                              // header and subcategory
                            }
                            <div className="flex" style={{borderRight: 'solid 1px #a9a9a9', }} align='left'>
                              <p style={formatedStyle(headerWidth / 2, 12)} className={` grayHover`}>
                                {key===0?<strong>Income</strong>:''}
                              </p>
                              <p style={formatedStyle(headerWidth / 2, 12)} className={` grayHover`}>
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
                            {
                              // colum datas
                              columnIndexes.map( (columnIndex) => {

                                if( (columnIndex === 'Budget' && selectedOption === 'Forecast') ||
                                    (columnIndex === 'Forecast' && selectedOption === 'Budget') ||
                                    (columnIndex === 'ActualVsBudgetVariance' && selectedOption === 'Forecast') ||
                                    (columnIndex === 'ActualVsForecastVariance' && selectedOption === 'Budget') ||
                                    (columnIndex === 'YTDBudget' && selectedOption === 'Forecast') ||
                                    (columnIndex === 'YTDForecast' && selectedOption === 'Budget') ||
                                    (columnIndex === 'YTDActualVsBudgetVariance' && selectedOption === 'Forecast') ||
                                    (columnIndex === 'YTDActualVsForecastVariance' && selectedOption === 'Budget')
                                )
                                  return ('');
                                else
                                  return(
                                    <p key={columnIndex} style={formatedStyle(subRowWidth / 6, 12 )} className={`${classes.leftItem} grayHover`}
                                       onClick={event => {
                                         this.handleElement(event, 'table', _rowdata);
                                       }}
                                       onMouseMove={event => {
                                         if (tooltipTimeout) clearTimeout(tooltipTimeout);
                                         this.showTooltip(event, _rowdata , columnIndex);
                                       }}
                                       onMouseLeave={event => {
                                         tooltipTimeout = setTimeout(() => {
                                           this.hideTooltip();
                                         }, 300);
                                       }}
                                       onTouchMove={event => {
                                         if (tooltipTimeout) clearTimeout(tooltipTimeout);
                                         this.showTooltip(event, _rowdata , columnIndex);
                                       }}
                                       onTouchEnd={event => {
                                         tooltipTimeout = setTimeout(() => {
                                           this.hideTooltip();
                                         }, 300);
                                       }}
                                    >
                                      <Truncate
                                        width={subRowWidth / 6}
                                        ellipsis={(
                                          <span>...</span>
                                        )}
                                        onTruncate={this.handleTruncate}
                                      >
                                        {thousandFormat2(_rowdata[columnIndex])}
                                      </Truncate>
                                    </p>
                                  )
                              })
                            }
                          </div>
                        </Grid>
                      </Grid>
                    </div>
                  )
                })
              }
          </div>
        </div>

        <div className="flex" >
          <div style={{borderTop: 'solid 1px #a9a9a9',borderRight: 'solid 1px #a9a9a9'}}>
            {
              // **************** Income Total *************************
            }
                  <div  className={`classes.rows`}
                        style={{'width': (subRowWidth + headerWidth )}}>
                    <Grid container>
                      <Grid item md={12} sm={12} xs={12}>
                        <div className="flex" align="right" style={{paddingRight:'5px'}}>
                          {
                            // header and subcategory
                          }
                          <div className="flex" style={{borderRight: 'solid 1px #a9a9a9', }} align='left'>
                            <p style={formatedStyle(headerWidth / 2, 12)} className={` grayHover`}>

                            </p>
                            <p style={formatedStyle(headerWidth / 2, 12)} className={` grayHover`}>
                              <Truncate
                                width={headerWidth / 2}
                                ellipsis={(
                                  <span>...</span>
                                )}
                                onTruncate={this.handleTruncate}
                              >
                                Total
                              </Truncate>
                            </p>
                          </div>
                          {
                            // colum datas
                            columnIndexes.map( (columnIndex) => {

                              if( (columnIndex === 'Budget' && selectedOption === 'Forecast') ||
                                (columnIndex === 'Forecast' && selectedOption === 'Budget') ||
                                (columnIndex === 'ActualVsBudgetVariance' && selectedOption === 'Forecast') ||
                                (columnIndex === 'ActualVsForecastVariance' && selectedOption === 'Budget') ||
                                (columnIndex === 'YTDBudget' && selectedOption === 'Forecast') ||
                                (columnIndex === 'YTDForecast' && selectedOption === 'Budget') ||
                                (columnIndex === 'YTDActualVsBudgetVariance' && selectedOption === 'Forecast') ||
                                (columnIndex === 'YTDActualVsForecastVariance' && selectedOption === 'Budget')
                              )
                                return ('');
                              else
                                return(
                                  <p key={columnIndex} style={formatedStyle(subRowWidth / 6, 12 )} className={`${classes.leftItem} grayHover`}
                                     onClick={event => {
                                       this.handleElement(event, 'table', _incomeTotal);
                                     }}
                                     onMouseMove={event => {
                                       if (tooltipTimeout) clearTimeout(tooltipTimeout);
                                       this.showTooltip(event, _incomeTotal , columnIndex, 'Total');
                                     }}
                                     onMouseLeave={event => {
                                       tooltipTimeout = setTimeout(() => {
                                         this.hideTooltip();
                                       }, 300);
                                     }}
                                     onTouchMove={event => {
                                       if (tooltipTimeout) clearTimeout(tooltipTimeout);
                                       this.showTooltip(event, _incomeTotal , columnIndex, 'Total');
                                     }}
                                     onTouchEnd={event => {
                                       tooltipTimeout = setTimeout(() => {
                                         this.hideTooltip();
                                       }, 300);
                                     }}
                                  >
                                    <Truncate
                                      width={subRowWidth / 6}
                                      ellipsis={(
                                        <span>...</span>
                                      )}
                                      onTruncate={this.handleTruncate}
                                    >
                                      {thousandFormat2(_incomeTotal[columnIndex])}
                                    </Truncate>
                                  </p>
                                )
                            })
                          }
                        </div>
                      </Grid>
                    </Grid>
                  </div>
          </div>
        </div>

        <div className="flex" >
          <div style={{borderTop: 'solid 1px #a9a9a9',borderRight: 'solid 1px #a9a9a9'}}>
            {
              // **************** Expense Data *************************
              _expenseData.map((_rowdata, key) => {
                return (
                  <div  key= {key} className={key%2===0?`classes.rows`:`classes.rows tableColor1`}
                        style={{'width': (subRowWidth + headerWidth )}}>
                    <Grid container>
                      <Grid item md={12} sm={12} xs={12}>
                        <div className="flex" align="right" style={{paddingRight:'5px'}}>
                          {
                            // header and subcategory
                          }
                          <div className="flex" style={{borderRight: 'solid 1px #a9a9a9', }} align='left'>
                            <p style={formatedStyle(headerWidth / 2, 12)} className={` grayHover`}>
                              {key===0?<strong>Expense</strong>:''}
                            </p>
                            <p style={formatedStyle(headerWidth / 2, 12)} className={` grayHover`}>
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
                          {
                            // colum datas
                            columnIndexes.map( (columnIndex) => {

                              if( (columnIndex === 'Budget' && selectedOption === 'Forecast') ||
                                (columnIndex === 'Forecast' && selectedOption === 'Budget') ||
                                (columnIndex === 'ActualVsBudgetVariance' && selectedOption === 'Forecast') ||
                                (columnIndex === 'ActualVsForecastVariance' && selectedOption === 'Budget') ||
                                (columnIndex === 'YTDBudget' && selectedOption === 'Forecast') ||
                                (columnIndex === 'YTDForecast' && selectedOption === 'Budget') ||
                                (columnIndex === 'YTDActualVsBudgetVariance' && selectedOption === 'Forecast') ||
                                (columnIndex === 'YTDActualVsForecastVariance' && selectedOption === 'Budget')
                              )
                                return ('');
                              else
                                return(
                                  <p key={columnIndex} style={formatedStyle(subRowWidth / 6, 12 )} className={`${classes.leftItem} grayHover`}
                                     onClick={event => {
                                       this.handleElement(event, 'table', _rowdata);
                                     }}
                                     onMouseMove={event => {
                                       if (tooltipTimeout) clearTimeout(tooltipTimeout);
                                       this.showTooltip(event, _rowdata , columnIndex);
                                     }}
                                     onMouseLeave={event => {
                                       tooltipTimeout = setTimeout(() => {
                                         this.hideTooltip();
                                       }, 300);
                                     }}
                                     onTouchMove={event => {
                                       if (tooltipTimeout) clearTimeout(tooltipTimeout);
                                       this.showTooltip(event, _rowdata , columnIndex);
                                     }}
                                     onTouchEnd={event => {
                                       tooltipTimeout = setTimeout(() => {
                                         this.hideTooltip();
                                       }, 300);
                                     }}
                                  >
                                    <Truncate
                                      width={subRowWidth / 6}
                                      ellipsis={(
                                        <span>...</span>
                                      )}
                                      onTruncate={this.handleTruncate}
                                    >
                                      {thousandFormat2(_rowdata[columnIndex])}
                                    </Truncate>
                                  </p>
                                )
                            })
                          }
                        </div>
                      </Grid>
                    </Grid>
                  </div>
                )
              })
            }
          </div>
        </div>

        <div className="flex" >
          <div style={{borderTop: 'solid 1px #a9a9a9',borderRight: 'solid 1px #a9a9a9'}}>
            {
              // **************** Expense Total *************************
            }
            <div  className={`classes.rows`}
                  style={{'width': (subRowWidth + headerWidth )}}>
              <Grid container>
                <Grid item md={12} sm={12} xs={12}>
                  <div className="flex" align="right" style={{paddingRight:'5px'}}>
                    {
                      // header and subcategory
                    }
                    <div className="flex" style={{borderRight: 'solid 1px #a9a9a9', }} align='left'>
                      <p style={formatedStyle(headerWidth / 2, 12)} className={` grayHover`}>

                      </p>
                      <p style={formatedStyle(headerWidth / 2, 12)} className={` grayHover`}>
                        <Truncate
                          width={headerWidth / 2}
                          ellipsis={(
                            <span>...</span>
                          )}
                          onTruncate={this.handleTruncate}
                        >
                          Total
                        </Truncate>
                      </p>
                    </div>
                    {
                      // colum datas
                      columnIndexes.map( (columnIndex) => {

                        if( (columnIndex === 'Budget' && selectedOption === 'Forecast') ||
                          (columnIndex === 'Forecast' && selectedOption === 'Budget') ||
                          (columnIndex === 'ActualVsBudgetVariance' && selectedOption === 'Forecast') ||
                          (columnIndex === 'ActualVsForecastVariance' && selectedOption === 'Budget') ||
                          (columnIndex === 'YTDBudget' && selectedOption === 'Forecast') ||
                          (columnIndex === 'YTDForecast' && selectedOption === 'Budget') ||
                          (columnIndex === 'YTDActualVsBudgetVariance' && selectedOption === 'Forecast') ||
                          (columnIndex === 'YTDActualVsForecastVariance' && selectedOption === 'Budget')
                        )
                          return ('');
                        else
                          return(
                            <p key={columnIndex} style={formatedStyle(subRowWidth / 6, 12 )} className={`${classes.leftItem} grayHover`}
                               onClick={event => {
                                 this.handleElement(event, 'table', _expenseTotal);
                               }}
                               onMouseMove={event => {
                                 if (tooltipTimeout) clearTimeout(tooltipTimeout);
                                 this.showTooltip(event, _expenseTotal , columnIndex, 'Total');
                               }}
                               onMouseLeave={event => {
                                 tooltipTimeout = setTimeout(() => {
                                   this.hideTooltip();
                                 }, 300);
                               }}
                               onTouchMove={event => {
                                 if (tooltipTimeout) clearTimeout(tooltipTimeout);
                                 this.showTooltip(event, _expenseTotal , columnIndex, 'Total');
                               }}
                               onTouchEnd={event => {
                                 tooltipTimeout = setTimeout(() => {
                                   this.hideTooltip();
                                 }, 300);
                               }}
                            >
                              <Truncate
                                width={subRowWidth / 6}
                                ellipsis={(
                                  <span>...</span>
                                )}
                                onTruncate={this.handleTruncate}
                              >
                                {thousandFormat2(_expenseTotal[columnIndex])}
                              </Truncate>
                            </p>
                          )
                      })
                    }
                  </div>
                </Grid>
              </Grid>
            </div>
          </div>
        </div>

        <div className="flex" >
          <div style={{borderTop: 'solid 1px #a9a9a9',borderRight: 'solid 1px #a9a9a9'}}>
            {
              // **************** Profit *************************
            }
            <div  className={`classes.rows, tableColor1`}
                  style={{'width': (subRowWidth + headerWidth )}}>
              <Grid container>
                <Grid item md={12} sm={12} xs={12}>
                  <div className="flex" align="right" style={{paddingRight:'5px'}}>
                    {
                      // header and subcategory
                    }
                    <div className="flex" style={{borderRight: 'solid 1px #a9a9a9', }} align='left'>
                      <p style={formatedStyle(headerWidth / 2, 12)} className={` grayHover`}>
                        Profit / Loss
                      </p>
                      <p style={formatedStyle(headerWidth / 2, 12)} className={` grayHover`}>
                        <Truncate
                          width={headerWidth / 2}
                          ellipsis={(
                            <span>...</span>
                          )}
                          onTruncate={this.handleTruncate}
                        >

                        </Truncate>
                      </p>
                    </div>
                    {
                      // colum datas
                      profitIndexes.map( (columnIndex) => {

                        if( (columnIndex === 'BudgetProfit' && selectedOption === 'Forecast') ||
                          (columnIndex === 'ForecastProfit' && selectedOption === 'Budget') ||
                          (columnIndex === 'ActualVsBudgetProfitVariance' && selectedOption === 'Forecast') ||
                          (columnIndex === 'ActualVsForecastProfitVariance' && selectedOption === 'Budget') ||
                          (columnIndex === 'YTDBudgetProfit' && selectedOption === 'Forecast') ||
                          (columnIndex === 'YTDForecastProfit' && selectedOption === 'Budget') ||
                          (columnIndex === 'YTDActualVsBudgetProfitVariance' && selectedOption === 'Forecast') ||
                          (columnIndex === 'YTDActualVsForecastProfitVariance' && selectedOption === 'Budget')
                        )
                          return ('');
                        else
                          return(
                            <p key={columnIndex} style={formatedStyle(subRowWidth / 6, 12 )} className={`${classes.leftItem} grayHover`}
                               onClick={event => {
                                 this.handleElement(event, 'table', _profit[0]);
                               }}
                               onMouseMove={event => {
                                 if (tooltipTimeout) clearTimeout(tooltipTimeout);
                                 this.showTooltip(event, _profit[0] , columnIndex, 'Profit/Loss');
                               }}
                               onMouseLeave={event => {
                                 tooltipTimeout = setTimeout(() => {
                                   this.hideTooltip();
                                 }, 300);
                               }}
                               onTouchMove={event => {
                                 if (tooltipTimeout) clearTimeout(tooltipTimeout);
                                 this.showTooltip(event, _profit[0] , columnIndex, 'Profit/Loss');
                               }}
                               onTouchEnd={event => {
                                 tooltipTimeout = setTimeout(() => {
                                   this.hideTooltip();
                                 }, 300);
                               }}
                            >
                              <Truncate
                                width={subRowWidth / 6}
                                ellipsis={(
                                  <span>...</span>
                                )}
                                onTruncate={this.handleTruncate}
                              >
                                {thousandFormat2(_profit[0][columnIndex])}
                              </Truncate>
                            </p>
                          )
                      })
                    }
                  </div>
                </Grid>
              </Grid>
            </div>
          </div>
        </div>

        <div className="flex" >
          <div style={{borderTop: 'solid 1px #a9a9a9',borderRight: 'solid 1px #a9a9a9',borderBottom: 'solid 1px #a9a9a9'}}>
            {
              // **************** Profit percent *************************
            }
            <div  className={`classes.rows`}
                  style={{'width': (subRowWidth + headerWidth )}}>
              <Grid container>
                <Grid item md={12} sm={12} xs={12}>
                  <div className="flex" align="right" style={{paddingRight:'5px'}}>
                    {
                      // header and subcategory
                    }
                    <div className="flex" style={{borderRight: 'solid 1px #a9a9a9', }} align='left'>
                      <p style={formatedStyle(headerWidth / 2, 12)} className={` grayHover`}>
                        % Profit
                      </p>
                      <p style={formatedStyle(headerWidth / 2, 12)} className={` grayHover`}>
                        <Truncate
                          width={headerWidth / 2}
                          ellipsis={(
                            <span>...</span>
                          )}
                          onTruncate={this.handleTruncate}
                        >

                        </Truncate>
                      </p>
                    </div>
                    {
                      // colum datas
                      columnIndexes.map( (columnIndex) => {

                        if( (columnIndex === 'Budget' && selectedOption === 'Forecast') ||
                          (columnIndex === 'Forecast' && selectedOption === 'Budget') ||
                          (columnIndex === 'ActualVsBudgetVariance' && selectedOption === 'Forecast') ||
                          (columnIndex === 'ActualVsForecastVariance' && selectedOption === 'Budget') ||
                          (columnIndex === 'YTDBudget' && selectedOption === 'Forecast') ||
                          (columnIndex === 'YTDForecast' && selectedOption === 'Budget') ||
                          (columnIndex === 'YTDActualVsBudgetVariance' && selectedOption === 'Forecast') ||
                          (columnIndex === 'YTDActualVsForecastVariance' && selectedOption === 'Budget')
                        )
                          return ('');
                        else
                          return(
                            <p key={columnIndex} style={formatedStyle(subRowWidth / 6, 12 )} className={`${classes.leftItem} grayHover`}
                               onClick={event => {
                                 this.handleElement(event, 'table', _profits_pc);
                               }}
                               onMouseMove={event => {
                                 if (tooltipTimeout) clearTimeout(tooltipTimeout);
                                 this.showTooltip(event, _profits_pc , columnIndex, 'percent');
                               }}
                               onMouseLeave={event => {
                                 tooltipTimeout = setTimeout(() => {
                                   this.hideTooltip();
                                 }, 300);
                               }}
                               onTouchMove={event => {
                                 if (tooltipTimeout) clearTimeout(tooltipTimeout);
                                 this.showTooltip(event, _profits_pc , columnIndex, 'percent');
                               }}
                               onTouchEnd={event => {
                                 tooltipTimeout = setTimeout(() => {
                                   this.hideTooltip();
                                 }, 300);
                               }}
                            >
                              <Truncate
                                width={subRowWidth / 6}
                                ellipsis={(
                                  <span>...</span>
                                )}
                                onTruncate={this.handleTruncate}
                              >
                                {thousandFormat(_profits_pc[columnIndex])}%
                              </Truncate>
                            </p>
                          )
                      })
                    }
                  </div>
                </Grid>
              </Grid>
            </div>
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

                {
                  tooltipData["IncomeStatementSubCategory"] !== undefined?
                  <div className="ft-12">GL Sub Type: <strong>{(tooltipData["IncomeStatementSubCategory"])}</strong>
                  </div>
                    :
                  <div className="ft-12">GL Sub Type: <strong>{tooltipData.disp}</strong>
                  </div>
                }
                {
                  tooltipData["YTDActual"] !== undefined?
                  <div
                    className="ft-12">Full Year Actual Projection: <strong>
                    {tooltipData.disp==='percent'?'':'$'}
                    {thousandFormat(tooltipData["YTDActual"])}
                    {tooltipData.disp==='percent'?'%':''}
                    </strong>
                  </div>
                    :
                    ""
                }
                {
                  this.state.selectedOption === 'Budget'?
                    tooltipData["YTDActualVsBudgetVariance"] !== undefined?
                      <div
                        className="ft-12">Full Year Actual Projection VS {this.state.selectedOption}: <strong>
                        {tooltipData.disp==='percent'?'':'$'}
                        {thousandFormat(tooltipData["YTDActualVsBudgetVariance"])}
                        {tooltipData.disp==='percent'?'%':''}
                        </strong>
                      </div>
                      :
                      ""
                    :
                    tooltipData["YTDActualVsForecastVariance"] !== undefined?
                      <div
                        className="ft-12">Full Year Actual Projection VS {this.state.selectedOption}: <strong>
                        {tooltipData.disp==='percent'?'':'$'}
                        {thousandFormat(tooltipData["YTDActualVsForecastVariance"])}
                        {tooltipData.disp==='percent'?'%':''}
                        </strong>
                      </div>
                      :
                      ""
                }
                {
                  this.state.selectedOption === 'Budget'?
                    tooltipData["YTDBudget"] !== undefined?
                      <div
                        className="ft-12">Full Year {this.state.selectedOption}: <strong>
                        {tooltipData.disp==='percent'?'':'$'}
                        {thousandFormat(tooltipData["YTDBudget"])}
                        {tooltipData.disp==='percent'?'%':''}
                        </strong>
                      </div>
                      :
                      ""
                    :
                    tooltipData["YTDForecast"] !== undefined?
                      <div
                        className="ft-12">Full Year {this.state.selectedOption}: <strong>
                        {tooltipData.disp==='percent'?'':'$'}
                        {thousandFormat(tooltipData["YTDForecast"])}
                        {tooltipData.disp==='percent'?'%':''}
                        </strong>
                      </div>
                      :
                      ""
                }

                {
                  this.state.selectedOption === 'Budget'?
                    tooltipData["Budget"] !== undefined?
                      <div
                        className="ft-12">MTD Compare Proj: <strong>
                        {tooltipData.disp==='percent'?'':'$'}
                        {thousandFormat(tooltipData["Budget"])}
                        {tooltipData.disp==='percent'?'%':''}
                        </strong>
                      </div>
                      :
                      ""
                    :
                    tooltipData["Forecast"] !== undefined?
                      <div
                        className="ft-12">MTD Compare Proj: <strong>
                        {tooltipData.disp==='percent'?'':'$'}
                        {thousandFormat(tooltipData["Forecast"])}
                        {tooltipData.disp==='percent'?'%':''}
                        </strong>
                      </div>
                      :
                      ""
                }
                {
                  this.state.selectedOption === 'Budget'?
                    tooltipData["ActualVsBudgetVariance"] !== undefined?
                      <div
                        className="ft-12">MTD Compare Variable Proj: <strong>
                        {tooltipData.disp==='percent'?'':'$'}
                        {thousandFormat(tooltipData["ActualVsBudgetVariance"])}
                        {tooltipData.disp==='percent'?'%':''}
                        </strong>
                      </div>
                      :
                      ""
                    :
                    tooltipData["ActualVsForecastVariance"] !== undefined?
                      <div
                        className="ft-12">MTD Compare Variable Proj: <strong>
                        {tooltipData.disp==='percent'?'':'$'}
                        {thousandFormat(tooltipData["ActualVsForecastVariance"])}
                        {tooltipData.disp==='percent'?'%':''}</strong>
                      </div>
                      :
                      ""
                }
                {
                  tooltipData["Actual"] !== undefined?
                    <div
                      className="ft-12">MTD Actual: <strong>{tooltipData.disp==='percent'?'':'$'}{thousandFormat(tooltipData["Actual"])}{tooltipData.disp==='percent'?'%':''}</strong>
                    </div>
                    :
                    ""
                }
                {
                  tooltipData.disp==='Profit/Loss'?
                  <div className="ft-12">{tooltipData.disp}:
                    <strong>
                      {tooltipData.disp === 'percent' ? '' : '$'}
                      {thousandFormat(tooltipData[tooltipData.option])}
                      {tooltipData.disp === 'percent' ? '%' : ''}
                    </strong>
                  </div>
                    :
                    ""
                }
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
