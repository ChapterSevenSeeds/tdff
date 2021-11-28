import React, { memo, useState, useRef, useCallback } from "react";
import { Accordion, AccordionSummary, AccordionDetails, Grid, Typography, useTheme, TextField, Menu, MenuItem, Tooltip, IconButton, Button, LinearProgress, Chip } from "@material-ui/core";
import { AddCircleOutlined, CancelOutlined, DoneOutline, ExpandMoreOutlined, ListAltOutlined } from '@material-ui/icons';
import ExtensionList from '../models/extensionList';
import { WorkerMessageTypes, SelectorCommands } from '../models/enums';

export default memo(props => {
    const { resetItems, setNewFiles, session, files } = props;
    const theme = useTheme();
    const [filter, setFilter] = useState('');
    const [workingPercentDone, setWorkingPercentDone] = useState(0);
    const [workingBarVariant, setWorkingBarVariant] = useState('determinate');
    const [working, setWorking] = useState(false);
    const [filterActive, setFilterActive] = useState(false);
    const [extensionsFilter, setExtensionsFilter] = useState([]);
    const [addExtension, setAddExtension] = useState('');
    const [extensionListMenuAnchorElement, setExtensionListMenuAnchorElement] = useState(null);
    const addExtensionListButtonRef = useRef();

    const handleAddExtensionListButtonClick = useCallback(() => {
        setExtensionListMenuAnchorElement(addExtensionListButtonRef.current);
    }, []);

    const clearFilter = useCallback(() => {
        setFilterActive(false);
        resetItems();
    }, []);

    const handleAddExtensionFilter = useCallback(() => {
        setExtensionsFilter([...extensionsFilter, addExtension[0] === '.' ? addExtension : `.${addExtension}`]);
        setAddExtension('');
    }, [extensionsFilter, addExtension]);

    const handleAddExtensionList = useCallback((e) => {
        setExtensionsFilter([...extensionsFilter, `{${e.target.innerText}}`]);
        setExtensionListMenuAnchorElement(null);
    }, [extensionsFilter]);

    const applyFilter = useCallback(() => {
        let searchRegexString = '';

        if (filter) {
            searchRegexString = filter;

            if (extensionsFilter.length > 0) searchRegexString += ".*?";
        }

        searchRegexString += ExtensionList.constructRegex(extensionsFilter);
        const searchRegex = new RegExp(searchRegexString, "i");

        setWorkingBarVariant('determinate');
        setWorkingPercentDone(0);
        setWorking(true);
        const filterController = new Worker(new URL('../tools/filterController.js', import.meta.url));
        filterController.onmessage = e => {
            switch (e.data.type) {
                case WorkerMessageTypes.CompletionUpdate:
                    setWorkingPercentDone(e.data.value);
                    break;
                case WorkerMessageTypes.Finished:
                    setNewFiles(e.data.value);
                    filterController.terminate();
                    setWorking(false);
                    setFilterActive(true);
                    break;
            }
        };

        filterController.postMessage({
            token: searchRegex,
            items: session.data.files
        });
    }, [filter, extensionsFilter]);

    const handleCloseExtensionListMenu = useCallback(() => setExtensionListMenuAnchorElement(null), []);

    const handleSelectOptionClick = useCallback(type => {
        setWorkingBarVariant('indeterminate');
        setWorking(true);

        const selector = new Worker(new URL('../tools/selector.js', import.meta.url));

        selector.onmessage = e => {
            setNewFiles(e.data);
            selector.terminate();
            setWorking(false);
        };

        selector.postMessage({
            type,
            files: files.current
        });
    }, []);

	const handleSelectAllDupsMatchingFilter = useCallback(() => handleSelectOptionClick(SelectorCommands.DuplicatesMatchingFilter), []);
    const handleSelectAllDups = useCallback(() => handleSelectOptionClick(SelectorCommands.AllDuplicates), []);
    const handleInvertSelection = useCallback(() => handleSelectOptionClick(SelectorCommands.Invert), []);
    const handleClearSelection = useCallback(() => handleSelectOptionClick(SelectorCommands.Clear), []);

    return (
        <>
            <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreOutlined />}>
                    <Grid container spacing={4} alignItems='center' alignContent='center'>
                        <Grid item>
                            <Typography variant='body1'>Filtering/Selecting</Typography>
                        </Grid>
                        <Grid item>
                            <Grid container spacing={1} alignItems='center' alignContent='center'>
                                <Grid item>
                                    {filterActive &&
                                        <DoneOutline style={{ color: theme.palette.success.main }} fontSize='small' />
                                    }
                                    {!filterActive &&
                                        <CancelOutlined style={{ color: theme.palette.error.main }} fontSize='small' />
                                    }
                                </Grid>
                                <Grid item>
                                    <Typography variant='body2'>Filter {filterActive ? 'Active' : 'Inactive'}</Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                        {working &&
                            <Grid item style={{ flexGrow: 1 }}>
                                <Grid container alignItems='center' spacing={1}>
                                    <Grid item>
                                        <Typography variant='body2' style={{ color: theme.palette.text.secondary }}>Working...</Typography>
                                    </Grid>
                                    <Grid item style={{ flexGrow: 1 }}>
                                        <LinearProgress variant={workingBarVariant} value={workingPercentDone} />
                                    </Grid>
                                </Grid>
                            </Grid>
                        }
                    </Grid>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={2} alignItems='center'>
                        <Grid item>
                            <TextField value={filter} onChange={e => setFilter(e.target.value)} variant='standard' color='primary' label='Filter String' style={{ minWidth: '500px' }} />
                        </Grid>
                        <Grid item>
                            <Grid container spacing={1} direction='column'>
                                <Grid item>
                                    <Grid container spacing={1} alignItems='center'>
                                        <Grid item>
                                            <TextField value={addExtension} onChange={e => setAddExtension(e.target.value)} variant='standard' margin='dense' label='Add Extension' />
                                        </Grid>
                                        <Grid item>
                                            <Tooltip title={addExtension ? `Add extension ${addExtension} to the filter list` : ''}>
                                                <div>
                                                    <IconButton onClick={handleAddExtensionFilter} disabled={!addExtension} size='small'>
                                                        <AddCircleOutlined color={!addExtension ? 'disabled' : 'primary'} />
                                                    </IconButton>
                                                </div>
                                            </Tooltip>
                                        </Grid>
                                        <Grid item>
                                            <Tooltip title='Add extension list'>
                                                <IconButton onClick={handleAddExtensionListButtonClick} ref={addExtensionListButtonRef} size='small'>
                                                    <ListAltOutlined color='secondary' />
                                                </IconButton>
                                            </Tooltip>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item style={{ maxWidth: '350px' }}>
                                    <Grid container spacing={1}>
                                        {extensionsFilter.map((extension, index) =>
                                            <Grid item key={index}>
                                                <Chip color={extension[0] === "{" ? 'secondary' : 'primary'} size='small' label={extension} onDelete={() => setExtensionsFilter(extensionsFilter.filter(x => x !== extension))} />
                                            </Grid>
                                        )}
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item>
                            <Grid container direction='column' alignContent='center' spacing={2}>
                                <Grid item>
                                    <Button onClick={applyFilter} variant='contained' color='primary'>Apply</Button>
                                </Grid>
                                <Grid item>
                                    <Button onClick={clearFilter} variant='outlined' color='secondary'>Clear</Button>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item>
                            <Grid container direction='column' alignContent='center' alignItems='center' spacing={1}>
                                <Grid item>
                                    <Button onClick={handleSelectAllDupsMatchingFilter} variant='contained' color='primary'>Select all duplicates matching filter</Button>
                                </Grid>
                                <Grid item>
                                    <Button onClick={handleSelectAllDups} variant='contained' color='primary'>Select all duplicates</Button>
                                </Grid>
                                <Grid item>
                                    <Button onClick={handleInvertSelection} variant='outlined' color='secondary'>Invert Selection</Button>
                                </Grid>
                                <Grid item>
                                    <Button onClick={handleClearSelection} variant='outlined' color='secondary'>Clear Selection</Button>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>
            <Menu
                anchorEl={extensionListMenuAnchorElement}
                keepMounted
                open={Boolean(extensionListMenuAnchorElement)}
                onClose={handleCloseExtensionListMenu}
            >
                {Object.keys(ExtensionList.items).map(list =>
                    <MenuItem key={list} onClick={handleAddExtensionList}
                    >
                        {list}
                    </MenuItem>
                )}
            </Menu>
        </>
    );
});