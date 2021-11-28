import React, { memo } from "react";
import { Accordion, AccordionSummary, AccordionDetails, Grid, Card, CardHeader, CardContent, TableCell, TableContainer, Table, TableRow, Typography, TableBody, useTheme } from "@material-ui/core";
import toWords from "split-camelcase-to-words";
import { ExpandMoreOutlined, SettingsApplicationsOutlined, PlaylistAddCheckOutlined, TimerOutlined, ImportContactsOutlined } from '@material-ui/icons';
import humanizeDuration from "humanize-duration";

export default memo(props => {
    const { session } = props;
    const theme = useTheme();

    return (
        <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreOutlined />}>Information</AccordionSummary>
            <AccordionDetails>
                <Grid container spacing={2}>
                    <Grid item>
                        <Card variant='outlined'>
                            <CardHeader titleTypographyProps={{ variant: 'h6' }} title={
                                <Grid container spacing={2}>
                                    <Grid item style={{ marginTop: '3px' }}>
                                        <SettingsApplicationsOutlined color='primary' />
                                    </Grid>
                                    <Grid item>
                                        <Typography variant='body1'>Basic Configuration</Typography>
                                    </Grid>
                                </Grid>}
                            />
                            <CardContent>
                                <TableContainer>
                                    <Table size='small'>
                                        <TableBody>
                                            {["mode", "rootFolder", "outputLocation", "minimumFileSize", "maximumFileSize"].map(key =>
                                                <TableRow key={key}>
                                                    <TableCell>{toWords(key)}</TableCell>
                                                    <TableCell style={{ color: theme.palette.text.secondary }}>{session.data[key]}</TableCell>
                                                </TableRow>)}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item>
                        <Card variant='outlined'>
                            <CardHeader titleTypographyProps={{ variant: 'h6' }} title={
                                <Grid container spacing={2}>
                                    <Grid item style={{ marginTop: '3px' }}>
                                        <PlaylistAddCheckOutlined color='primary' />
                                    </Grid>
                                    <Grid item>
                                        Scan Results
                                    </Grid>
                                </Grid>}
                            />
                            <CardContent>
                                <TableContainer>
                                    <Table size='small'>
                                        <TableBody>
                                            {["foldersScanned", "filesScanned", "bytesScanned"].map(key =>
                                                <TableRow key={key}>
                                                    <TableCell>{toWords(key)}</TableCell>
                                                    <TableCell style={{ color: theme.palette.text.secondary }}>{session.data[key]}</TableCell>
                                                </TableRow>)}
                                            <TableRow>
                                                <TableCell><strong>{toWords('totalDuplicates')}</strong></TableCell>
                                                <TableCell style={{ color: theme.palette.error.dark }}>{session.data['totalDuplicates']}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell><strong>{toWords('totalDuplicatesSize')}</strong></TableCell>
                                                <TableCell style={{ color: theme.palette.error.dark }}>{session.data['totalDuplicatesSize']}</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item>
                        <Card variant='outlined'>
                            <CardHeader titleTypographyProps={{ variant: 'h6' }} title={
                                <Grid container spacing={2}>
                                    <Grid item style={{ marginTop: '3px' }}>
                                        <TimerOutlined color='primary' />
                                    </Grid>
                                    <Grid item>
                                        Timing
                                    </Grid>
                                </Grid>}
                            />
                            <CardContent>
                                <TableContainer>
                                    <Table size='small'>
                                        <TableBody>
                                            {["startTime", "endTime"].map(key =>
                                                <TableRow key={key}>
                                                    <TableCell>{toWords(key)}</TableCell>
                                                    <TableCell style={{ color: theme.palette.text.secondary }}>{session.data[key]}</TableCell>
                                                </TableRow>)}
                                            <TableRow>
                                                <TableCell>Duration</TableCell>
                                                <TableCell style={{ color: theme.palette.text.secondary }}>{humanizeDuration(new Date(session.data.endTime) - new Date(session.data.startTime))}</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item>
                        <Card variant='outlined'>
                            <CardHeader titleTypographyProps={{ variant: 'h6' }} title={
                                <Grid container spacing={2}>
                                    <Grid item style={{ marginTop: '3px' }}>
                                        <ImportContactsOutlined color='primary' />
                                    </Grid>
                                    <Grid item>
                                        Inclusions/Exclusions
                                    </Grid>
                                </Grid>}
                            />
                            <CardContent>
                                <TableContainer>
                                    <Table size='small'>
                                        <TableBody>
                                            {["extensionsExcluded", "extensionsIncluded", "foldersExcluded", "fileNamesExcluded"].map(key =>
                                                <TableRow key={key}>
                                                    <TableCell>{toWords(key)}</TableCell>
                                                    <TableCell style={{ color: theme.palette.text.secondary }}>{session.data[key]}</TableCell>
                                                </TableRow>)}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </AccordionDetails>
        </Accordion>
    );
});