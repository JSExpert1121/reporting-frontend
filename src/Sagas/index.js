import { takeLatest, all } from 'redux-saga/effects';

import { creators as FeesActions } from '../Reducers/Fees';
import { creators as FeesProjectionActions } from '../Reducers/FeesProjection';
import { creators as DebtorsActions } from '../Reducers/Debtors';
import { creators as FinancialYTDActions} from '../Reducers/FinancialYTD';
import { creators as ProjectedFinancialPerformanceActions} from '../Reducers/ProjectedFinancialPerformance';
import { creators as YearlyFinancialYTDActions} from '../Reducers/YearlyFinancialYTD';
import { creators as BalanceSheetActions} from '../Reducers/BalanceSheet';
import { creators as WorkInHandActions} from '../Reducers/WorkInHand';
import { creators as ProjectPerformanceActions} from '../Reducers/ProjectPerformance';
import { creators as ExpensesActions} from '../Reducers/Expenses';
import { creators as SummaryActions} from '../Reducers/Summary';
import { creators as CashFlowActions} from '../Reducers/CashFlow';
import { creators as ProjectedCashFlowActions} from '../Reducers/ProjectedCashFlow';
import { creators as WorkGeneratedActions} from '../Reducers/WorkGenerated';
import { creators as DefaultActions} from '../Reducers/Default';
import { creators as KPIActions} from '../Reducers/KPI';
import { creators as PeopleActions} from '../Reducers/People'
import { creators as OpportunityActions} from '../Reducers/Opportunity'

import { getFeesSummary, getFeesDetail } from './FeesSaga';
import { getFeesProjectionSummary, getFeesProjectionDetail } from './FeesProjectionSaga';
import { getDebtorsSummary, getDebtorsDetail } from './DebtorsSaga';
import { getFinancialYTDSummary , getFinancialYTDDetail} from './FinancialYTDSaga';
import { getProjectedFinancialPerformanceSummary , getProjectedFinancialPerformanceDetail} from './ProjectedFinancialPerformanceSaga';
import { getYearlyFinancialYTDSummary , getYearlyFinancialYTDDetail} from './YearlyFinancialYTDSaga';
import { getBalanceSheetQuerys} from './BalanceSheetSaga';
import { getWorkInHandSummary , getWorkInHandDetail} from './WorkInHandSaga';
import { getProjectPerformanceSummary , getProjectPerformanceDetail} from './ProjectPerformanceSaga';
import { getExpensesSummary , getExpensesDetail} from './ExpensesSaga';
import { getSummary , setSummary} from './SummarySaga';
import { getTopData , getMiddleData , getBottomData} from './CashFlowSaga';
import { getPCFTopData , getPCFMiddleData , getPCFBottomData} from './ProjectedCashFlowSaga';
import { getDefaultInfo} from './DefaultSaga';
import { getWorkGeneratedQuery} from './WorkGeneratedSaga'
import { getKPISummary} from './KPISaga'
import { getPeopleSummary, getPeopleDetail } from './PeopleSaga';
import { getOpportunitySummary, getOpportunityDetail} from './OpportunitySaga';

export default function * root () {
  yield all([

    takeLatest(FeesActions.feesSummaryRequest, getFeesSummary),

    takeLatest(FeesActions.feesDetailRequest, getFeesDetail),

    takeLatest(FeesProjectionActions.feesprojectionSummaryRequest, getFeesProjectionSummary),

    takeLatest(FeesProjectionActions.feesprojectionDetailRequest, getFeesProjectionDetail),

    takeLatest(DebtorsActions.debtorsSummaryRequest, getDebtorsSummary),

    takeLatest(DebtorsActions.debtorsDetailRequest, getDebtorsDetail),

    takeLatest(FinancialYTDActions.fytdSummaryRequest, getFinancialYTDSummary),

    takeLatest(FinancialYTDActions.fytdDetailRequest, getFinancialYTDDetail),

    takeLatest(ProjectedFinancialPerformanceActions.prjfinancialperfSummaryRequest, getProjectedFinancialPerformanceSummary),

    takeLatest(ProjectedFinancialPerformanceActions.prjfinancialperfDetailRequest, getProjectedFinancialPerformanceDetail),

    takeLatest(YearlyFinancialYTDActions.yearlyytdSummaryRequest, getYearlyFinancialYTDSummary),

    takeLatest(YearlyFinancialYTDActions.yearlyytdDetailRequest, getYearlyFinancialYTDDetail),

    takeLatest(BalanceSheetActions.glbsQuerysRequest , getBalanceSheetQuerys),

    takeLatest(WorkInHandActions.workinhandSummaryRequest , getWorkInHandSummary),

    takeLatest(WorkInHandActions.workinhandDetailRequest , getWorkInHandDetail),

    takeLatest(ProjectPerformanceActions.projectperformanceSummaryRequest , getProjectPerformanceSummary),

    takeLatest(ProjectPerformanceActions.projectperformanceDetailRequest , getProjectPerformanceDetail),

    takeLatest(ExpensesActions.expensesSummaryRequest , getExpensesSummary),

    takeLatest(ExpensesActions.expensesDetailRequest , getExpensesDetail),

    takeLatest(SummaryActions.summaryGetRequest , getSummary),

    takeLatest(SummaryActions.summarySetRequest , setSummary),

    takeLatest(CashFlowActions.cashflowTopRequest , getTopData),

    takeLatest(CashFlowActions.cashflowMiddleRequest , getMiddleData),

    takeLatest(CashFlowActions.cashflowBottomRequest , getBottomData),

    takeLatest(ProjectedCashFlowActions.projectedcashflowTopRequest , getPCFTopData),

    takeLatest(ProjectedCashFlowActions.projectedcashflowMiddleRequest , getPCFMiddleData),

    takeLatest(ProjectedCashFlowActions.projectedcashflowBottomRequest , getPCFBottomData),

    takeLatest(DefaultActions.defaultGetRequest ,  getDefaultInfo),

    takeLatest(WorkGeneratedActions.workgeneratedQueryRequest ,  getWorkGeneratedQuery),

    takeLatest(KPIActions.kpiSummaryRequest ,  getKPISummary),

    takeLatest(PeopleActions.peopleSummaryRequest ,  getPeopleSummary),

    takeLatest(PeopleActions.peopleDetailRequest ,  getPeopleDetail),

    takeLatest(OpportunityActions.opportunitySummaryRequest ,  getOpportunitySummary),

    takeLatest(OpportunityActions.opportunityDetailRequest ,  getOpportunityDetail),
  ]);
}
