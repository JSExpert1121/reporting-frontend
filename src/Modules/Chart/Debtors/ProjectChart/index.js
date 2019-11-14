import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import { Typography, Grid } from '@material-ui/core';

import { scaleLinear, scaleBand, scaleOrdinal } from '@vx/scale';
import { BarStackHorizontal } from '@vx/shape';
import { withTooltip, Tooltip } from "@vx/tooltip";
import { AxisBottom } from '@vx/axis';
import { localPoint } from "@vx/event";
import { max } from "d3-array";

import {
	getIndexFromObjList,
	isEqualList,
	isEqualObjList,
	thousandFormat
} from "../../../../Utils/Functions";
import {
	daysRangeKeys, debtorKeyTextMap, debtorColors, ship, thinAxis, barThinHeight
} from "../../../../Assets/js/constant";

import { styles } from './style';

const Color = require('color');

const xSelector = d => d.Total;
const ySelector = d => d.ProjectName;


class ProjectChart extends Component {

	_isMounted = false;
	constructor(props) {
		super(props);

		this.state = {
			data: [],
			keys: [],
			colors: [],

			selectedItems: { clients: [], projects: [], bars: [] },		// added by rui
			activeBar: null
		};

		this._prepareData = this._prepareData.bind(this);
		this._handleElementSelect = this._handleElementSelect.bind(this);
		this._deSelectAll = this._deSelectAll.bind(this);
	}

	onResize() {
		if (this._isMounted === true)
			this.setState({ resize: !this.state.resize });
	}

	componentDidMount() {
		this._isMounted = true;
		this._prepareData();
		window.addEventListener('resize', this.onResize.bind(this));
	}

	componentDidUpdate(prevProps, prevState) {
		if (
			prevProps.detailData.length !== this.props.detailData.length
			|| prevProps.selectedYears.length !== this.props.selectedYears.length
			|| !isEqualList(prevProps.selectedDaysRanges, this.props.selectedDaysRanges)
			|| !isEqualList(prevProps.selectedItems, this.props.selectedItems)
			|| !isEqualObjList(prevProps.selectedItemStacks, this.props.selectedItemStacks)
		) {
			if (this._isMounted === true) {
				this._deSelectAll();
				this._prepareData();
			}
		}
	}

	componentWillUnmount() {
		this._isMounted = false;
		window.removeEventListener('resize', this.onResize.bind(this));
	}

	_prepareData = () => {
		const { detailData, selectedDaysRanges, selectedItems, selectedItemStacks } = this.props;
		const keys = selectedDaysRanges.length === 0 || selectedDaysRanges[selectedDaysRanges.length - 1] === 'Total' ? daysRangeKeys : selectedDaysRanges;

		let colors = keys.reduce((ret, key) => {
			ret.push(debtorColors[key]);
			return ret;
		}, []);

		let data = {};
		detailData.forEach(d => {
			if ((selectedItems.length === 0 && selectedItemStacks.length === 0) || selectedItems.indexOf(d.Director) > -1) {
				if (!data[d.ClientName]) data[d.ClientName] = {};
				if (!data[d.ClientName][d.ProjectName]) {
					data[d.ClientName][d.ProjectName] = {
						Total: 0,
						InvoiceNumber: d.InvoiceNumber,
						details: d
					};
				}

				const curData = data[d.ClientName][d.ProjectName];
				keys.forEach(key => {
					if (!curData[key])
						curData[key] = 0;
					curData['Total'] += d[key];
					curData[key] += d[key];
				});
			} else {
				if (selectedItemStacks.length > 0) {
					keys.forEach(key => {
						const stack = {
							director: d.Director,
							daysRange: key
						};

						if (getIndexFromObjList(selectedItemStacks, stack) > -1) {
							if (!data[d.ClientName]) data[d.ClientName] = {};
							if (!data[d.ClientName][d.ProjectName]) {
								data[d.ClientName][d.ProjectName] = {
									Total: 0,
									InvoiceNumber: d.InvoiceNumber,
									details: d
								};
							}

							const curData = data[d.ClientName][d.ProjectName];
							if (!curData[key])
								curData[key] = 0;
							curData['Total'] += d[key];
							curData[key] += d[key];
						}
					});
				}
			}
		});

		this.setState({
			data: Object.keys(data).map(ClientName => {
				return Object.keys(data[ClientName]).map(ProjectName => {
					let d = data[ClientName][ProjectName];
					d.ClientName = ClientName;
					d.ProjectName = ProjectName;

					keys.forEach(key => {
						if (!d[key]) d[key] = 0
					});

					return d;
				});
			}),
			keys: keys,
			colors: colors,
		});
	};

	_handleElementSelect = (event, element, i, j, k) => {
		const { selectedItems } = this.state;
		// added by rui
		if (j === undefined) {
			if (event.shiftKey) {
				if (element === 'Client') {
					const idx = selectedItems.clients.indexOf(i);
					if (idx >= 0) {
						selectedItems.clients.splice(idx, 1);
					} else {
						selectedItems.clients.push(i);
					}
					const prefix = `${i}-`;
					selectedItems.projects = selectedItems.projects.filter(project => !project.startsWith(prefix));
					selectedItems.bars = selectedItems.bars.filter(bar => !bar.startsWith(prefix));
				}
			} else {
				if (element === 'Client') {
					const idx = selectedItems.clients.indexOf(i);
					if (idx >= 0 && selectedItems.clients.length === 1) selectedItems.clients = [];
					else selectedItems.clients = [i];
					selectedItems.projects = [];
					selectedItems.bars = [];
				}
			}
		} else {
			if (event.shiftKey) {
				if (element === 'Client') {
					const value = `${i}-${j}`;
					const idx = selectedItems.projects.indexOf(value);
					if (idx >= 0) selectedItems.projects.splice(idx, 1);
					else selectedItems.projects.push(value);
					selectedItems.clients = selectedItems.clients.filter(client => client !== i);
					const prefix = `${i}-${j}-`;
					selectedItems.bars = selectedItems.bars.filter(bar => !bar.startsWith(prefix));
					// } else {
					// 	const value = `${i}-${j}-${k}`;
					// 	const idx = selectedItems.bars.indexOf(value);
					// 	if (idx >= 0) selectedItems.bars.splice(idx, 1);
					// 	else selectedItems.bars.push(value);
					// 	selectedItems.clients = selectedItems.clients.filter(client => client !== i);
					// 	const prefix = `${i}-`;
					// 	selectedItems.projects = selectedItems.projects.filter(project => !project.startsWith(prefix));
				}
			} else {
				if (element === 'Client') {
					const value = `${i}-${j}`;
					const idx = selectedItems.projects.indexOf(value);
					if (idx >= 0 && selectedItems.projects.length === 1) selectedItems.projects = [];
					else selectedItems.projects = [value];
					selectedItems.clients = [];
					selectedItems.bars = [];
				} else {
					const value = `${i}-${j}-${k}`;
					const idx = selectedItems.bars.indexOf(value);
					if (idx >= 0 && selectedItems.bars.length === 1) selectedItems.bars = [];
					else selectedItems.bars = [value];
					selectedItems.clients = [];
					selectedItems.projects = [];
				}
			}
		}

		this.setState({
			selectedItems: { ...selectedItems }
		});
	};

	_showTooltip = (event, bar, position) => {
		const { activeBar } = this.state;
		if (activeBar) activeBar.classList.remove('barHover');
		event.target.classList.add('barHover');
		this.setState({ activeBar: event.target });

		const offsetX = window.innerWidth < 768 ? 0 : window.innerWidth / 3 - 10;
		let offsetY = 0;
		for (let i = 0; i < position; i++) {
			offsetY += this.state.data[i].length * barThinHeight;
		}
		offsetY -= document.getElementById("wrapper").scrollTop;

		const tooltipData = {
			...bar.bar.data.details,
			key: bar.key,
			index: bar.index,
			Total: bar.bar.data.Total
		};
		console.log(localPoint(event).y);
		this.props.showTooltip({
			tooltipData: tooltipData,
			tooltipTop: localPoint(event).y + offsetY + 40,
			tooltipLeft: localPoint(event).x + offsetX,
		});
	};

	_hideTooltip = () => {
		const { activeBar } = this.state;
		if (activeBar) activeBar.classList.remove('barHover');
		this.setState({ activeBar: null });

		this.props.hideTooltip();
	};

	_deSelectAll = () => {
		this.setState({
			selectedItems: { clients: [], projects: [], bars: [] }
		});
	};

	render() {
		const {
			classes,
			tooltipOpen, tooltipData, tooltipTop, tooltipLeft
		} = this.props;
		const { data, keys, colors, selectedItems } = this.state;

		const selected = !(selectedItems.projects.length === 0 &&
			selectedItems.clients.length === 0 &&
			selectedItems.bars.length === 0);
		console.log("ChartData: ", selectedItems);

		const height = (window.innerHeight - 100) / 3;
		const width = window.innerWidth * 2 / 3 - 40;
		const xMax = width;

		if (data.length === 0 || keys.length === 0) return null;

		let yScales = [];
		let xMaxValue = 0;

		data.forEach(d => {
			yScales.push(
				scaleBand({
					rangeRound: [barThinHeight * d.length, 0],
					domain: d.map(ySelector),
					padding: 0.2,
				})
			);

			let m = max(d, xSelector);
			if (m > xMaxValue) xMaxValue = m;
		});


		const xScale = scaleLinear({
			rangeRound: [0, xMax],
			domain: [0, xMaxValue],
			nice: true,
		});

		const color = scaleOrdinal({
			domain: keys,
			range: colors,
		});

		let tooltipTimeout;

		return (
			<div className={classes.root}>
				<div className="well">
					<Typography variant="h6" className="subtitle mb-10">By Project</Typography>
				</div>

				<div className="well">
					<div style={ship(height)} id="wrapper">
						{data.map((d1, i) => {
							const yMax = d1.length * barThinHeight;

							return (
								<Grid container key={i} className={classes.wrapper}>
									<Grid item md={4} sm={12} xs={12}>
										<Grid container>
											<Grid
												item md={5}
												className={selectedItems.clients.includes(i) ? "grayHover bkgActive" : "grayHover"}
												onClick={event => this._handleElementSelect(event, 'Client', i)}
											>
												{d1[0].ClientName}
											</Grid>
											<Grid item md={2}>
												{d1.map((d2, j) => {
													return (
														<p
															key={`${i}-${j}`}
															className={selectedItems.projects.includes(`${i}-${j}`) ? "grayHover bkgActive" : "grayHover"}
															onClick={event => this._handleElementSelect(event, 'Client', i, j)}
														>
															{d2.InvoiceNumber}
														</p>
													)
												})}
											</Grid>
											<Grid item md={5}>
												{d1.map((d2, j) => {
													return (
														<p
															key={`${i}-${j}`}
															className={selectedItems.projects.includes(`${i}-${j}`) ? "grayHover bkgActive" : "grayHover"}
															onClick={event => this._handleElementSelect(event, 'Client', i, j)}
														>
															{d2.ProjectName}
														</p>
													)
												})}
											</Grid>
										</Grid>
									</Grid>

									<Grid item md={8} sm={12} xs={12}>
										<div>
											<svg width={width} height={yMax}>
												<rect x={0} y={0} width={width} height={yMax} fill="transparent" onClick={this._deSelectAll} />

												<BarStackHorizontal
													data={d1}
													keys={keys}
													height={yMax}
													y={ySelector}
													xScale={xScale}
													yScale={yScales[i]}
													color={color}
												>
													{barStacks => {
														return barStacks.map((barStack, j) => {
															const len = barStack.bars.length - 1;
															return barStack.bars.map((bar, k) => {
																const barValue = `${i}-${j}-${k}`;
																const projValue = `${i}-${len - k}`;
																const active = !selected ||
																	selectedItems.clients.includes(i) ||
																	selectedItems.projects.includes(projValue) ||
																	selectedItems.bars.includes(barValue);
																return (
																	<rect
																		key={`barstack-horizontal-${barStack.index}-${bar.index}`}
																		x={bar.x + 6}
																		y={bar.y}
																		width={bar.width}
																		height={16.6}
																		fill={active ? bar.color : Color(bar.color).alpha(0.5).toString()}
																		onClick={event => {
																			this._handleElementSelect(event, 'Bar', i, j, k);
																		}}
																		onMouseLeave={event => {
																			tooltipTimeout = setTimeout(() => {
																				this._hideTooltip();
																			}, 300);
																		}}
																		onMouseMove={event => {
																			if (tooltipTimeout) clearTimeout(tooltipTimeout);
																			this._showTooltip(event, bar, i);
																		}}
																		onTouchEnd={event => {
																			tooltipTimeout = setTimeout(() => {
																				this._hideTooltip();
																			}, 300);
																		}}
																		onTouchMove={event => {
																			if (tooltipTimeout) clearTimeout(tooltipTimeout);
																			this._showTooltip(event, bar, i);
																		}}
																		className={selectedItems.bars.includes(barValue) ? 'barActive' : ''}
																	/>
																);
															});
														});
													}}
												</BarStackHorizontal>
											</svg>

											{tooltipOpen && (
												<Tooltip
													top={tooltipTop}
													left={tooltipLeft}
													style={{
														minWidth: 60,
														backgroundColor: 'white',
														color: 'black',
													}}
												>
													<p className="tooltipPanel">{'Client: '}<strong>{tooltipData.ClientName}</strong></p>
													<p className="tooltipPanel">{'Project: '}<strong>{tooltipData.ProjectName}</strong></p>
													<p className="tooltipPanel">{'Director: '}<strong>{tooltipData.Director}</strong></p>
													<br />
													<p className="tooltipPanel">{'Age: '}<strong>{debtorKeyTextMap[tooltipData.key]}</strong></p>
													<p className="tooltipPanel">{'Amount: '}<strong>${thousandFormat(tooltipData.InvoiceAmount)}</strong></p>
												</Tooltip>
											)}
										</div>
									</Grid>
								</Grid>
							)
						})}
					</div>

					<div style={thinAxis} onClick={this._deSelectAll}>
						<Grid container>
							<Grid item md={4} sm={12} xs={12}></Grid>

							<Grid item md={8} sm={12} xs={12}>
								<svg width={width} height={barThinHeight}>
									<rect x={0} y={0} width={width} height={barThinHeight} fill={'transparent'} />

									<AxisBottom
										scale={xScale}
										top={0}
										hideAxisLine={true}
										stroke="black"
										numTicks={8}
										tickStroke="#a9a9a9"
										tickLabelProps={(value, index) => ({
											fill: 'black',
											fontSize: 11,
											textAnchor: 'middle',
											dy: '0.2em'
										})}
										tickComponent={({ formattedValue, ...tickProps }) => (
											<text {...tickProps}>
												${formattedValue}
											</text>
										)}
									/>
								</svg>
							</Grid>
						</Grid>
					</div>
				</div>
			</div>
		);
	}
}


ProjectChart.propTypes = {
	classes: PropTypes.object.isRequired,

	detailData: PropTypes.array.isRequired,

	selectedYears: PropTypes.array.isRequired,
	selectedDaysRanges: PropTypes.array.isRequired,
	selectedItems: PropTypes.array.isRequired,
	selectedItemStacks: PropTypes.array.isRequired,

	handleFilter: PropTypes.func.isRequired
};

export default withStyles(styles)(withTooltip(ProjectChart));
