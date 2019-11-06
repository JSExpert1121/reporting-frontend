import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { MDBContainer, MDBRow, MDBCol , MDBView , MDBMask} from "mdbreact";
import { withStyles } from '@material-ui/core/styles';
import {
  Typography
} from '@material-ui/core'
import { styles } from './style';
import logo from '../../../Assets/image/logo.jpg'
import {filter_styles} from './style.css'

import ReactDOM from 'react-dom';
class Intro extends Component {

  constructor(props) {
    super(props);

    this.state = {
      offsetY : 0,
    };
  }

  componentDidMount() {
    console.log('Intro');
    var rect = ReactDOM.findDOMNode(this)
      .getBoundingClientRect()
    this.setState({offsetY:rect.y});
  }

  componentWillUnmount() {

  }

  render() {
    const { classes, dir } = this.props;
    const {offsetY} = this.state;

    return (
      <div className={classes.root} style ={{height:`${window.innerHeight-offsetY-5}px`}} dir={dir}>
        <div style={{marginLeft:'10px'}}>
          <h2>Unreal Architecture Pty Ltd</h2>
        </div>
        <div id="logo" className = {classes.bgImage} >
          <a href = "#" className = "column col-xs-6" id = "zoomIn" style={{width:'100%',height:'100%'}}>
            <img src={logo} style={{width:'100%',height:'100%'}} className="img-fluid" alt="" />
          </a>
        </div>
      </div>
    );
  }

}


Intro.propTypes = {
  classes: PropTypes.object.isRequired,
  dir: PropTypes.string.isRequired,
};

export default withStyles(styles)(Intro);
