import { combineReducers } from 'redux';

import auth from './Auth';
import fees from './Fees';
import feesprojection from './FeesProjection';
import debtors from './Debtors';
import financialYTD from './FinancialYTD';
import projectedfinancialPerformance from './ProjectedFinancialPerformance';
import yearlyfinancialYTD from './YearlyFinancialYTD';
import BalanceSheet from './BalanceSheet';
import WorkInHand from './WorkInHand';
import ProjectPerformance from './ProjectPerformance'
import Expenses from './Expenses'
import Summary from './Summary'
import CashFlow from './CashFlow'
import ProjectedCashFlow from './ProjectedCashFlow'
import Default from './Default'
import WorkGenerated from './WorkGenerated'
import KPI from './KPI'
import People from './People'
import Opportunity from './Opportunity'
export default combineReducers({
  auth,
  fees,
  feesprojection,
  debtors,
  ProjectedCashFlow,
  financialYTD,
  yearlyfinancialYTD,
  projectedfinancialPerformance,
  BalanceSheet,
  WorkInHand,
  ProjectPerformance,
  Expenses,
  Summary,
  CashFlow ,
  WorkGenerated,
  KPI,
  People,
  Opportunity,
  Default
});
