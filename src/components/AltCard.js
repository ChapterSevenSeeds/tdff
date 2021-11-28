import React from 'react';
import { useTheme } from "@material-ui/core";

export default function AltCard(props) {
    const theme = useTheme();
    return (
        <>
            <span style={{ position: 'relative', left: '8px', zIndex: 1, backgroundColor: 'white', display: 'inline-block', padding: '0px 5px' }}>{props.label}</span>
            <div style={{ padding: '12px', border: `${theme.palette.text.disabled} solid 1px`, borderRadius: '5px', position: 'relative', top: '-10px' }}>
                {props.children}
            </div>
        </>
    );
}