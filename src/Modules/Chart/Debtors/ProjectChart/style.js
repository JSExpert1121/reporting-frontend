import { barThinHeight } from "../../../../Assets/js/constant";

export const styles = theme => ({
	root: {

	},
	wrapper: {
		borderBottom: 'solid 1px #DDD',
		'& p': {
			height: barThinHeight + 'px',
			margin: '0',
			padding: '0 3px',
			lineHeight: barThinHeight + 'px'
		}
	}
});
