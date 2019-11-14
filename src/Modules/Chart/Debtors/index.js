import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from "react-redux";

import { withStyles } from '@material-ui/core/styles';
import Grid from "@material-ui/core/Grid";

import { creators as DebtorsActions } from '../../../Reducers/Debtors';

import YearSelector from "../../../Common/Selectors/YearSelector";
import DebtorsDaysChart from "./DebtorsDaysChart";
import AgeingChart from './AgeingChart';
import ItemsChart from './ItemsChart';
import ProjectChart from './ProjectChart';

import { styles } from './style';


class Debtors extends Component {

	_isMounted = false;
	constructor(props) {
		super(props);
		console.log(props);
		this.state = {
			selectedYears: [2019],
			label: '2019'
		};

		this._handleYear = this._handleYear.bind(this);
		this._handleFilter = this._handleFilter.bind(this);
	}

	onResize() {
		if (this._isMounted === true)
			this.setState({ resize: !this.state.resize });
	}

	componentDidMount() {
		this._isMounted = true;
		window.addEventListener('resize', this.onResize.bind(this));

		const { selectedYears, defaultYear, defaultMonth } = this.props;
		this.props.updateFilter({ selectedYears: [defaultYear], label: defaultYear.toString() });
		this.props.getDebtorsSummary([defaultYear]/*selectedYears*/);
		this.props.getDebtorsDetail([defaultYear]/*selectedYears*/);
	}

	componentWillUnmount() {
		this._isMounted = false;
		window.removeEventListener('resize', this.onResize.bind(this));
	}

	_handleYear = (event) => {
		this.props.getDebtorsSummary(event.selectedYears);
		this.props.getDebtorsDetail(event.selectedYears);
		this._handleFilter(event);
	};

	_handleFilter = (event) => {
		this.props.updateFilter(event);
	};

	render() {
		const {
			classes, dir,
			summaryData, detailData,
			selectedYears, label, selectedMonths, selectedDaysRanges, selectedItems, selectedItemStacks
		} = this.props;

		return (
			<div className={classes.root} dir={dir}>
				<div className="wrapper">
					<YearSelector
						selectedYears={selectedYears}
						label={label}
						onChange={this._handleYear}
					/>
					<div className="right well"></div>
				</div>

				<DebtorsDaysChart
					summaryData={summaryData}
					selectedYears={selectedYears}
					selectedMonths={selectedMonths}
					defaultStartMonth={this.props.defaultStartMonth}
					defaultMonth={this.props.defaultMonth}
					handleFilter={this._handleFilter}
				/>

				<div className={classes.container}>
					<div className={classes.fake}></div>
					<Grid container>
						<Grid item md={6} sm={6} xs={6} className={`${classes.item} well`}>
							<AgeingChart
								detailData={detailData}
								selectedYears={selectedYears}
								selectedDaysRanges={selectedDaysRanges}
								handleFilter={this._handleFilter}
							/>
						</Grid>
						<Grid item md={6} sm={6} xs={6} className={`${classes.item} well`}>
							<ItemsChart
								detailData={detailData}
								selectedYears={selectedYears}
								selectedDaysRanges={selectedDaysRanges}
								selectedItemStacks={selectedItemStacks}
								selectedItems={selectedItems}
								handleFilter={this._handleFilter}
							/>
						</Grid>
					</Grid>
				</div>

				<ProjectChart
					detailData={detailData}
					selectedYears={selectedYears}
					selectedDaysRanges={selectedDaysRanges}
					selectedItems={selectedItems}
					selectedItemStacks={selectedItemStacks}
					handleFilter={this._handleFilter}
				/>
			</div>
		);
	}

}


Debtors.propTypes = {
	classes: PropTypes.object.isRequired,
	dir: PropTypes.string.isRequired,

	summaryData: PropTypes.array.isRequired,
	detailData: PropTypes.array.isRequired,

	selectedYears: PropTypes.array.isRequired,
	label: PropTypes.string.isRequired,
	selectedMonths: PropTypes.array.isRequired,
	selectedDaysRanges: PropTypes.array.isRequired,
	selectedItemStacks: PropTypes.array.isRequired,
	selectedItems: PropTypes.array.isRequired,
	defaultYear: PropTypes.number.isRequired,
	defaultMonth: PropTypes.number.isRequired,
	defaultDimDate: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
	summaryData: state.debtors.summaryData,
	detailData: state.debtors.detailData,

	selectedYears: state.debtors.selectedYears,
	label: state.debtors.label,
	selectedMonths: state.debtors.selectedMonths,
	selectedDaysRanges: state.debtors.selectedDaysRanges,
	selectedItems: state.debtors.selectedItems,
	selectedItemStacks: state.debtors.selectedItemStacks,
});

const mapDispatchToProps = dispatch => ({
	getDebtorsSummary: (selectedYears) => dispatch(DebtorsActions.debtorsSummaryRequest(selectedYears)),
	getDebtorsDetail: (selectedYears) => dispatch(DebtorsActions.debtorsDetailRequest(selectedYears)),
	updateFilter: (filter) => dispatch(DebtorsActions.debtorsUpdateFilter(filter)),
});

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(Debtors));
