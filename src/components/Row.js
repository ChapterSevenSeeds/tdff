import React, { memo } from "react";
import { Grid, Checkbox, Typography } from '@material-ui/core';
import { deepPurple, green } from "@material-ui/core/colors";
import { cloneDeep, isEqual } from "lodash";

// This is uncomfortably hacky for me. 
const comparerCache = {};

function rowComparer(previousProps, newProps) {
    if (previousProps.index !== newProps.index) return false;

    return isEqual(comparerCache[previousProps.index], newProps.data.files[newProps.index]);
}

export default memo(props => {
    const item = props.data.files[props.index];
    comparerCache[props.index] = cloneDeep(item);

    return (
        <Grid container alignItems='center' alignContent='center' wrap='nowrap' className={props.data.classes.fileGridContainer} style={{ ...props.style, backgroundColor: [deepPurple[100], green[100]][item.orderedGroupIndex % 2], color: [props.data.theme.palette.text.primary, props.data.theme.palette.text.secondary][+item.filtered] }}>
            <Grid item>
                <Checkbox checked={item.selected} name={props.index.toString()} onChange={props.data.handleSelectItem} color='primary' size='small' />
            </Grid>
            <Grid item>
                <Typography variant='body2'>{item.file}</Typography>
            </Grid>
        </Grid>
    );
}, rowComparer);