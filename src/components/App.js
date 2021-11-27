import { Button, Card, CardContent, CardHeader, TextField, Grid, LinearProgress, Table, TableCell, TableContainer, TableBody, TableRow, Typography, useTheme, Accordion, AccordionSummary, AccordionDetails, Divider, IconButton, Tooltip, Chip, Menu, MenuItem } from '@material-ui/core';
import React, { useRef, useState } from 'react'
import { VariableSizeList as List } from 'react-window';
import { deepPurple, green } from '@material-ui/core/colors';
import toWords from 'split-camelcase-to-words';
import { WorkerMessageTypes } from '../models/enums';
import { AddCircleOutlined, AddOutlined, CancelOutlined, DoneOutline, ErrorOutlined, ExpandMoreOutlined, ImportContactsOutlined, ListAltOutlined, PlaylistAddCheckOutlined, SettingsApplicationsOutlined, TimerOutlined } from '@material-ui/icons';
import humanizeDuration from "humanize-duration";
import ExtensionList from '../models/extensionList';
import { createWriteStream } from 'original-fs';

const ROW_HEIGHT = 35;

export default function App() {
	const theme = useTheme();
	const [session, setSession] = useState({ data: null });
	const [groups, setGroups] = useState([]);
	const [loading, setLoading] = useState(false);
	const [percentDone, setPercentDone] = useState(0);
	const [filter, setFilter] = useState('');
	const [filterPercentDone, setFilterPercentDone] = useState(0);
	const [applyingFilter, setApplyingFilter] = useState(false);
	const [filterActive, setFilterActive] = useState(false);
	const [extensionsFilter, setExtensionsFilter] = useState([]);
	const [addExtension, setAddExtension] = useState('');
	const [extensionListMenuAnchorElement, setExtensionListMenuAnchorElement] = useState(null);
	const groupListRef = useRef();
	const addExtensionListButtonRef = useRef();

	function parseFile(e) {
		const parser = new Worker(new URL('../tools/parser.js', import.meta.url));
		if (e?.target?.files?.length === 1) {
			setLoading(true);
			parser.onmessage = (e) => {
				switch (e.data.type) {
					case WorkerMessageTypes.CompletionUpdate:
						setPercentDone(e.data.value);
						break;
					case WorkerMessageTypes.Finished:
						setSession({ data: e.data.value });
						setGroups(e.data.value.groups);
						parser.terminate();
						setLoading(false);
						break;
				}
			}
			parser.postMessage(e.target.files[0].path);
		}
	}

	function applyFilter() {
		let searchRegexString = '';

		if (filter) {
			searchRegexString = filter;

			if (extensionsFilter.length > 0) searchRegexString += ".*?";
		}

		searchRegexString += ExtensionList.constructRegex(extensionsFilter);
		const searchRegex = new RegExp(searchRegexString, "i");

		setFilterPercentDone(0);
		setApplyingFilter(true);
		const filterController = new Worker(new URL('../tools/filterController.js', import.meta.url));
		filterController.onmessage = e => {
			switch (e.data.type) {
				case WorkerMessageTypes.CompletionUpdate:
					setFilterPercentDone(e.data.value);
					break;
				case WorkerMessageTypes.Finished:
					setGroups(e.data.value);
					groupListRef.current.resetAfterIndex(0, true);
					filterController.terminate();
					setApplyingFilter(false);
					setFilterActive(true);
					break;
			}
		};

		filterController.postMessage({
			token: searchRegex,
			items: session.data.groups
		});
	}

	function clearFilter() {
		setFilterActive(false);
		setGroups(session?.data?.groups ?? []);
		groupListRef.current.resetAfterIndex(0, true);
	}

	function handleAddExtensionFilter() {
		setExtensionsFilter([...extensionsFilter, addExtension[0] === '.' ? addExtension : `.${addExtension}`]);
		setAddExtension('');
	}

	function handleAddExtensionListButtonClick() {
		setExtensionListMenuAnchorElement(addExtensionListButtonRef.current);
	}

	function handleAddExtensionList(list) {
		setExtensionsFilter([...extensionsFilter, `{${list}}`]);
		setExtensionListMenuAnchorElement(null);
	}

	return (
		<div>
			<Button
				variant="contained"
				component="label"
				color='primary'
				disabled={loading}
			>
				Open
				<input
					type="file"
					hidden
					onChange={parseFile}
				/>
			</Button>
			{loading &&
			<Grid container direction="column" spacing={2}>
				<Grid item>
					<Typography variant='body1'>Parsing file...</Typography>
				</Grid>
				<Grid item>
					<LinearProgress variant='determinate' value={percentDone} />
				</Grid>
			</Grid>}
			{session.data &&
			<>
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
				<Accordion defaultExpanded>
					<AccordionSummary expandIcon={<ExpandMoreOutlined />}>
						<Grid container spacing={4} alignItems='center' alignContent='center'>
							<Grid item>
								<Typography variant='body1'>Filtering</Typography>
							</Grid>
							<Grid item>
								<Grid container spacing={1} alignItems='center' alignContent='center'>
									<Grid item>
										{filterActive &&
										<DoneOutline style={{ color: theme.palette.success.main }} fontSize='small' />}
										{!filterActive &&
										<CancelOutlined style={{ color: theme.palette.error.main }} fontSize='small' />}
									</Grid>
									<Grid item>
										<Typography variant='body2'>Filter {filterActive ? 'Active' : 'Inactive'}</Typography>
									</Grid>
								</Grid>
							</Grid>
						</Grid>
					</AccordionSummary>
					<AccordionDetails>
						<Grid container direction='column'>
							{applyingFilter && 
							<Grid item>
								<LinearProgress variant='determinate' value={filterPercentDone} />
							</Grid>}
							<Grid item>
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
													</Grid>)}
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
								</Grid>
							</Grid>
						</Grid>
					</AccordionDetails>
				</Accordion>
			</>}
			<List
				ref={groupListRef}
				itemData={groups}
				height={1000}
				itemCount={groups.length}
				estimatedItemSize={35}
				width='100%'
				itemSize={i => groups[i]?.length * ROW_HEIGHT}
			>
				{({ index, style }) => 
				<div style={style}>
					{groups?.[index]?.map((file, fileIndex) =>
					<div key={fileIndex} style={{ height: ROW_HEIGHT, backgroundColor: [deepPurple[100], green[100]][index % 2], color: [theme.palette.text.primary, theme.palette.text.secondary][+file.filtered]}}>{file.file}</div>)}
				</div>}
			</List>
			<Menu
				anchorEl={extensionListMenuAnchorElement}
				keepMounted
				open={Boolean(extensionListMenuAnchorElement)}
				onClose={() => setExtensionListMenuAnchorElement(null)}
			>
				{Object.keys(ExtensionList.items).map(list => 
				<MenuItem key={list} onClick={() => handleAddExtensionList(list)}
				>
					{list}
				</MenuItem>)}
				
			</Menu>
		</div>
	)
}

