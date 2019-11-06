import { timeParse, timeFormat } from 'd3-time-format';

const getParams = (window, width, height, margin={}) => {
  const pageYOffset = window.pageYOffset;
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  return {
    pageYOffset: pageYOffset,
    xMax: xMax,
    yMax: yMax,
  }
};

const  getMonths = (startMonth = 7) => {

  let result = [];
  let j = startMonth - 1;
  for(let i = 0; i < 12; i++)
  {
    if(j > 11) j = 0;
    result.push(j);
    j++;
  }
  return result;
}

const  getFinancialIndex = (m , startMonth = 7) => {
  let sm = startMonth;
  let index = 0;
  while (index < 12) {
    if(sm == m)
      break;
    sm++;
    if(sm > 12)
      sm = 1;
    index++;
  }

  return index;
}
const  getMonths2 = (selectedMonth , startMonth = 7) => {

  let result = [];
  let j = startMonth - 1;
  for(let i = 0; i < 12; i++)
  {
    if(j > 11) j = 0;
    result.push(j);
    if(financialMonth(selectedMonth, startMonth) - 1 == j)
      break;
    j++;
  }
  return result;
}

const parseDate = timeParse('%Y-%m-%d');
const getMonth = date => {
  return parseDate(date).getMonth();
};

const months =["January","February","March","April","May","June","July","August","September","October","November","December"];
const convertMonth = month => {

	for( const [index , value] of months.entries())
	{
		if(value === month)
			return index;
	}
};

const isEqualObjList = (arr1, arr2) => {
  if (arr1.length !== arr2.length) return false;
  if (arr1.length === 0) return true;
  return JSON.stringify(arr1[arr1.length - 1]) === JSON.stringify(arr2[arr2.length - 1]);
};

const isEqualList = (arr1, arr2) => {
  if (arr1.length !== arr2.length) return false;
  if (arr1.length === 0) return true;
  return arr1[arr1.length - 1] === arr2[arr2.length - 1];
};

const isMulti = (arrs) => {
  let isMulti = false;
  arrs.forEach(arr => {
    isMulti = isMulti || arr.length > 0;
  });
  return isMulti;
};

const getIndexFromElementList = (els, el) => {
  for (let i = 0; i < els.length; i++) {
    if (els[i] === el) return i;
  }
  return -1;
};

const getIndexFromObjList = (objs, obj) => {
  for (let i = 0; i < objs.length; i ++) {
    if (JSON.stringify(objs[i]) === JSON.stringify(obj)) return i;
  }
  return -1;
};

const randomColor = () => ('#' + (Math.random() * 0xFFFFFF << 0).toString(16) + '000000').slice(0, 7);

const deActivateEls = (els, className) => {
  els.forEach(el => {
    el.classList.remove(className);
  });
};

const thousandFormat = (value) => {
  let x = parseFloat(value);
  if (!value || isNaN(x)) return '0';
  const converted = Math.round(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');;
  return converted;
};

const thousandFormat2 = (value , ch = '$') => {
  let x = Math.abs(parseFloat(value));
  if (!value || isNaN(x)) return ch + '0' ;
  const converted = Math.round(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');;
  return (value<0?'-':'') + ch + converted;
};

const financialMonth = (month , startMonth = 7) => {

  month = parseInt(month);
  return ((10 + startMonth + month ) % 12) + 1;
};

const financialMonthFrom = (month , startMonth = 7) => {

  month = parseInt(month);
  return ((12 - startMonth + month ) % 12) + 1;
};

const getMonthForPoeplePage = (month) => {
  month = Math.abs(month);
  while (month > 12) {
    month = month % 100;
  }
  return Math.abs(month);
};

const financialYear = (year , month , startMonth) => {
  let y = parseInt(year);
  let m = parseInt(month);
  let s = parseInt(startMonth);
  return m >= s?y-1:y
}

const makeDimDate = (full_year , full_month , startMonth) =>
{
  let printf = require('printf');
  let y = parseInt(full_year);
  let m = parseInt(full_month);
  let s = parseInt(startMonth);
  return printf("%04d%02d01" , m < s?y-1:y , financialMonth(m , s));
}

export {
  getParams,
  getMonth,
  isEqualObjList,
  isEqualList,
  isMulti,
  getIndexFromElementList,
  getIndexFromObjList,
  randomColor,
  deActivateEls,
  thousandFormat,
  financialMonth,
  financialMonthFrom,
  convertMonth,
  thousandFormat2,
  getMonths,
  getMonths2,
  makeDimDate,
  financialYear,
  getFinancialIndex,
  getMonthForPoeplePage
}
