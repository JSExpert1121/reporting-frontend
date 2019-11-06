export const styles = theme => ({
  root: {
    overflowX:'hidden',
    overflowY:'hidden'
  },
  container: {
    position: 'relative'
  },
  fake: {
    position: 'absolute',
    background: 'transparent',
    width: '100%',

    '&:hover': {
      border: 'solid 2px #939393'
    }
  },
  item: {
    zIndex: 99
  }
});
