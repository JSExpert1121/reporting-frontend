import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { styles } from './style';
import { creators as SummaryActions } from '../../../Reducers/Summary';

import { Editor, EditorState, RichUtils } from 'draft-js';
import { convertToHTML, convertFromHTML } from 'draft-convert';
import { makeDimDate } from "../../../Utils/Functions";
import './style.css'
import YearSelector from "../../../Common/Selectors/YearSelectorSingle";
import MonthSelector from "../../../Common/Selectors/MonthSelector";
import {
	financialMonth
} from "../../../Utils/Functions";

class ExecutiveSummary extends Component {

	_isMounted = false;
	constructor(props) {
		super(props);

		this.state = {
			editorState: EditorState.createEmpty(),
			editable: false,
			clipContext: ""
		};
		this.onChange = (editorState) => this.setState({ editorState });
		this.toggleBlockType = (type) => this._toggleBlockType(type);
		this.toggleInlineStyle = (style) => this._toggleInlineStyle(style);
		this.focus = () => this.refs.editor.focus();
	}

	componentDidMount() {
		this._isMounted = true;

		this.props.summaryGetRequest(this.props.defaultDimDate);

		this.props.updateFilter({
			label: this.props.defaultYear.toString(),
			month_label: this.props.defaultMonth.toString(),
			selectedYears: [this.props.defaultYear],
			selectedMonths: [this.props.defaultMonth],
			dimDate: this.props.defaultDimDate
		});

	}

	componentWillUnmount() {
		this._isMounted = false;
	}

	componentDidUpdate(prevProps, prevState) {

		if (
			prevProps.summary !== this.props.summary /*||
      prevState.editable !== this.state.editable*/
			||
			prevProps.defaultYear !== this.props.defaultYear ||
			prevProps.defaultMonth !== this.props.defaultMonth
		) {
			let { editorState } = this.state;
			const { summary } = this.props;

			if (this._isMounted === true) {
				if (prevProps.defaultYear !== this.props.defaultYear ||
					prevProps.defaultMonth !== this.props.defaultMonth) {

					this.props.summaryGetRequest(this.props.defaultDimDate);
					this.props.updateFilter({
						label: this.props.defaultYear.toString(),
						month_label: this.props.defaultMonth.toString(),
						selectedYears: [this.props.defaultYear],
						selectedMonths: [this.props.defaultMonth],
						dimDate: this.props.defaultDimDate
					});
				}

				if (summary.length >= 1) {
					let content = summary[0]['data'].replace(/ /g, '+')
					this.setState({ clipContext: content });
					content = new Buffer(content, 'base64').toString();
					this.onChange(EditorState.push(editorState, convertFromHTML(content)));
				}
				else {
					this.setState({ editorState: EditorState.createEmpty() });
				}
			}
		}
	}

	_onEdit = (event) => {
		this.setState({ editable: true });
	}

	_onSave = (event) => {
		const { selectedYears, selectedMonths } = this.props;
		let { editorState } = this.state;
		let content = convertToHTML(this.state.editorState.getCurrentContent());

		let enc_content = new Buffer(content).toString('base64');

		let _DimDate = makeDimDate(selectedYears[0], selectedMonths[0], this.props.defaultStartMonth);
		this.props.summarySetRequest(_DimDate, /*new Buffer(*/  enc_content /*).toString('base64')*/);

		this.setState({ clipContext: content, editable: false });
		this.onChange(EditorState.push(editorState, convertFromHTML(content)));


	}

	_toggleInlineStyle(inlineStyle) {
		this.onChange(
			RichUtils.toggleInlineStyle(
				this.state.editorState,
				inlineStyle
			)
		);
	}

	_toggleBlockType(blockType) {
		this.onChange(
			RichUtils.toggleBlockType(
				this.state.editorState,
				blockType
			)
		);
	}

	_handleYear = (event) => {
		const { selectedMonths } = this.props;

		let _dimDate;
		_dimDate = makeDimDate(event.selectedYears[0], selectedMonths[0], this.props.defaultStartMonth);

		this.props.summaryGetRequest(_dimDate);
		this.setState({ dimDate: _dimDate });
		this.props.updateFilter(event);

		this.props.defaultHandler({
			defaultDimDate: _dimDate,
			defaultYear: (event.selectedYears[0]),
			defaultMonth: (selectedMonths[0])
		});

	};

	_handleMonth = (event) => {
		const { selectedYears } = this.props;

		let _dimDate;
		let printf = require('printf');
		if (event.selectedMonths[0] < this.props.defaultStartMonth)
			_dimDate = printf("%04d%02d01", selectedYears[0] - 1, financialMonth(event.selectedMonths[0], this.props.defaultStartMonth));
		else
			_dimDate = printf("%04d%02d01", selectedYears[0], financialMonth(event.selectedMonths[0], this.props.defaultStartMonth));

		this.props.summaryGetRequest(_dimDate);
		this.setState({ dimDate: _dimDate });
		// global filter setting
		this.props.updateFilter(event);
		this.props.defaultHandler({
			defaultDimDate: _dimDate,
			defaultYear: (selectedYears[0]),
			defaultMonth: (event.selectedMonths[0])
		});
	};

	render() {
		const { classes, dir, selectedYears, label,
			selectedMonths, month_label } = this.props;
		let { editorState, editable } = this.state;

		class StyleButton extends React.Component {
			constructor() {
				super();
				this.onToggle = (e) => {
					e.preventDefault();
					this.props.onToggle(this.props.style);
				};
			}

			render() {
				let className = 'RichEditor-styleButton';
				if (this.props.active) {
					className += ' RichEditor-activeButton';
				}

				return (
					<span className={className} onMouseDown={this.onToggle}>
						{this.props.label}
					</span>
				);
			}
		}

		let INLINE_STYLES = [
			{ label: 'Bold', style: 'BOLD' },
			{ label: 'Italic', style: 'ITALIC' },
			{ label: 'Underline', style: 'UNDERLINE' },
			{ label: 'Monospace', style: 'CODE' },
		];

		const InlineStyleControls = (props) => {
			let currentStyle = props.editorState.getCurrentInlineStyle();
			return (
				<div className="RichEditor-controls">
					{INLINE_STYLES.map(type =>
						<StyleButton
							key={type.label}
							active={currentStyle.has(type.style)}
							label={type.label}
							onToggle={props.onToggle}
							style={type.style}
						/>
					)}
				</div>
			);
		};

		const BLOCK_TYPES = [
			{ label: 'H1', style: 'header-one' },
			{ label: 'H2', style: 'header-two' },
			{ label: 'H3', style: 'header-three' },
			{ label: 'H4', style: 'header-four' },
			{ label: 'H5', style: 'header-five' },
			{ label: 'H6', style: 'header-six' },
			{ label: 'Blockquote', style: 'blockquote' },
			{ label: 'UL', style: 'unordered-list-item' },
			{ label: 'OL', style: 'ordered-list-item' },
			{ label: 'Code Block', style: 'code-block' },
		];

		const BlockStyleControls = (props) => {
			const { editorState } = props;
			const selection = editorState.getSelection();
			const blockType = editorState
				.getCurrentContent()
				.getBlockForKey(selection.getStartKey())
				.getType();

			return (
				<div className="RichEditor-controls">
					{BLOCK_TYPES.map((type) =>
						<StyleButton
							key={type.label}
							active={type.style === blockType}
							label={type.label}
							onToggle={props.onToggle}
							style={type.style}
						/>
					)}
				</div>
			);
		};

		return (
			<div className={classes.root} dir={dir}>
				<div className="wrapper">
					<div style={{ display: 'flex', }}>
						<YearSelector
							selectedYears={selectedYears.length !== 0 ? selectedYears : [2019]}
							label={label}
							onChange={this._handleYear}
						/>

						<MonthSelector
							selectedMonths={selectedMonths}
							month_label={month_label}
							onChange={this._handleMonth}
						/>

						{editable === true ?
							<div style={{
								marginLeft: '10%', cursor: 'pointer', opacity: 0.6
							}}
								onClick={event => this._onSave(event)}
							>
								<svg width={32} height={32} viewBox="0 -12 32 32" >
									<g transform="scale(0.015 0.015)">
										<path d="M896 0h-896v1024h1024v-896l-128-128zM512 128h128v256h-128v-256zM896 896h-768v-768h64v320h576v-320h74.978l53.022 53.018v714.982z">
										</path>
									</g>
								</svg>
							</div>
							:
							<div style={{
								marginLeft: '10%', cursor: 'pointer', opacity: 0.6
							}}
								onClick={event => this._onEdit(event)}>
								<svg width={32} height={32} viewBox="0 -12 32 32" >
									<g transform="scale(0.015 0.015)">
										<path d="M864 0c88.364 0 160 71.634 160 160 0 36.020-11.91 69.258-32 96l-64 64-224-224 64-64c26.742-20.090 59.978-32 96-32zM64 736l-64 288 288-64 592-592-224-224-592 592zM715.578 363.578l-448 448-55.156-55.156 448-448 55.156 55.156z">
										</path>
									</g>
								</svg>
							</div>
						}
					</div>
				</div>

				<div className="RichEditor-root">

					{editable === true ?
						<div>
							<BlockStyleControls
								editorState={editorState}
								onToggle={this.toggleBlockType}
							/>
							<InlineStyleControls
								editorState={editorState}
								onToggle={this.toggleInlineStyle}
							/>
						</div>
						: ""}

					<div className="RichEditor-editor" onClick={this.focus} >
						<Editor
							ref="editor"
							editorState={this.state.editorState}
							onChange={this.onChange}
							spellCheck={true}
							readOnly={!editable}
						/>
					</div>
				</div>
			</div>
		);
	}

}

ExecutiveSummary.propTypes = {
	classes: PropTypes.object.isRequired,
	dir: PropTypes.string.isRequired,
	dimDate: PropTypes.string.isRequired,
	summary: PropTypes.array.isRequired,
	selectedYears: PropTypes.array.isRequired,
	label: PropTypes.string.isRequired,
	selectedMonths: PropTypes.array.isRequired,
	month_label: PropTypes.string.isRequired,
	defaultYear: PropTypes.number.isRequired,
	defaultMonth: PropTypes.number.isRequired,
	defaultDimDate: PropTypes.string.isRequired,
	defaultHandler: PropTypes.func.isRequired,
	defaultStartMonth: PropTypes.number.isRequired,
};

const mapStateToProps = state => {
	return {
		summary: state.Summary.summary,
		dimDate: state.Summary.dimDate,
		selectedYears: state.Summary.selectedYears,
		label: state.Summary.label,
		selectedMonths: state.Summary.selectedMonths,
		month_label: state.Summary.month_label,
	}
};


const mapDispatchToProps = (dispatch) => {
	return {
		updateFilter: (filter) => dispatch(SummaryActions.summaryUpdateFilter(filter)),
		summaryGetRequest: (dimDate) => dispatch(SummaryActions.summaryGetRequest(dimDate)),
		summarySetRequest: (dimDate, content) => dispatch(SummaryActions.summarySetRequest(dimDate, content)),
	}
};

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(ExecutiveSummary));
