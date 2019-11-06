import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import {
  FormControl,
  Input,
  Select,
  MenuItem,
  ListItemText,
  Checkbox
} from '@material-ui/core';

import { styles } from './style';

import {
  single_years,
  MenuProps
} from "../../../Assets/js/constant";


class YearSelectorSingle extends Component {

  constructor(props) {
    super(props);
  }

  handleChange = (event) => {

    const newYears = event.target.value;

    let _selectedYears = [], _label;
    _label = newYears.toString();
    _selectedYears[0] = newYears;

    this.props.onChange({
      selectedYears: _selectedYears,
      label: _label
    })
  };

  render() {
    const { classes, selectedYears, label } = this.props;

    return (
      <div className={`${classes.root}`}>
        <FormControl className={classes.formControl}>
          <Select
            value={selectedYears[0]}
            onChange={this.handleChange}
            renderValue={selected => label}
            MenuProps={MenuProps}
          >
            {single_years.map(year => (
              <MenuItem key={year} value={year} className={classes.menuItem}>
                <ListItemText primary={year} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
    );
  }

}


YearSelectorSingle.propTypes = {
  classes: PropTypes.object.isRequired,
  selectedYears: PropTypes.array.isRequired,
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default withStyles(styles)(YearSelectorSingle);
