import { barThinHeight } from "../../../../Assets/js/constant";

export const styles = theme => ({
  root: {
    minHeight: '150px',
  },

  bottomLine: {
    borderBottom: 'solid 1px #a9a9a9'
  },

  container: {
    height: '180px',
    width: '100%',
    background:'#eeeeee',
    position: 'relative'
  },
  fake: {
    position: 'absolute',
    background: 'transparent',
    width: '100%',
    height: '180px',
    '&:hover': {
      border: 'solid 2px #939393'
    }
  },

  collapse_icon:{
    width: '1.2rem',
    height: '1.2rem',
    transition: 'transform 0.3s ease-in-out',
    background_size: 'contain',
    background_repeat: 'no_repeat',
    background_image: 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAQAAABIkb+zAAABGklEQVR4Ae3RAcZCQRiF4buDfwshBGi+2UQgcIGAVtpSIuS/KyilG+UTcbk6zIH3GQBm3mM6AAAAAAAAAACA+eqf/yZBXcV/2XeCVPYx1FXj/FjGUMd45AQp/1HHGGLZNL+e61jHnKDmv8652YT1IvPfE2LX/Sh27/ycsF60yT/lk58JYn6eU4MJccjnlAmZ/33i0OAH4jg9Qcw/5g9YJpS+m6n0xvzpCfVe+nn59S7kGyYo+YYJWz3fO+E2PaFs9XzPhMy/6fmWCXq+YUJs9HzrhLh+JsQmrnq+bYKeb52g53snXPR88wQ93z9Bz/dP0PP9E/R89wQ93zpBz7dO0POtE/R86wQ93zpBzzdP+MoHAAAAAAAAAADAExTnTW20AtjhAAAAAElFTkSuQmCC)',
    opacity: '0.6'
  }

});
