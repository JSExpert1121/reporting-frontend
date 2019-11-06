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
  months,
  MenuProps
} from "../../../Assets/js/constant";


class MonthSelector extends Component {

  constructor(props) {
    super(props);
  }

  handleChange = (event) => {

    const newMonths = event.target.value;

    let _selectedMonths = [], _label;
    _label = newMonths.toString();
    _selectedMonths[0] = newMonths;

    this.props.onChange({
      selectedMonths: _selectedMonths,
      month_label: _label
    })
  };

  render() {
    const { classes, selectedMonths, month_label } = this.props;

    return (
      <div className={`${classes.root}`}>
        <FormControl className={classes.formControl}>
          <Select
            value={selectedMonths}
            onChange={this.handleChange}
            renderValue={selected => month_label}
            MenuProps={MenuProps}
          >
            {months.map(month => (
              <MenuItem key={month} value={month} className={classes.menuItem}>
                <ListItemText primary={month} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
    );
  }

}


MonthSelector.propTypes = {
  classes: PropTypes.object.isRequired,
  selectedMonths: PropTypes.array.isRequired,
  month_label: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default withStyles(styles)(MonthSelector);
