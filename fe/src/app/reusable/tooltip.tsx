import React from 'react';
import * as mui from '@mui/material';
import * as icons from '@mui/icons-material';
import { css } from '@emotion/react';

function Tooltip(P: mui.TooltipProps ) {
	const newProps = {
		enterDelay: 500,
		enterNextDelay: 500,
		arrow: true,
		...P
	};
	/* fontSize: '0.8em'*/
	return (<mui.Tooltip {...newProps}></mui.Tooltip>);
}

export default Tooltip;
