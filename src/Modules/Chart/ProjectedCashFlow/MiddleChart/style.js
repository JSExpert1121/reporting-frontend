import { barThinHeight } from "../../../../Assets/js/constant";
export const styles = theme => ({
  root: {
      
    },

    wrapper: {
      borderTop: 'solid 1px #a9a9a9',
      '& p': {
        height: barThinHeight + '100px',
        margin: '1',
        topmargin: '1',
        padding: '0 3px',
        lineHeight: barThinHeight + 'px'
      }
    },

     item_wrapper: {
        borderRight: 'solid 1px #a9a9a9',
          height: barThinHeight,
          padding: '0 3px',
          lineHeight: barThinHeight + 'px'
    }
});
