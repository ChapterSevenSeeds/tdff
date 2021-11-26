import { Button, Card, CardContent, CardHeader, TextField, Grid, LinearProgress, Table, TableCell, TableContainer, TableBody, TableRow, Typography, useTheme, Accordion, AccordionSummary, AccordionDetails } from '@material-ui/core';
import React, { useRef, useState } from 'react'
import { VariableSizeList as List } from 'react-window';
import { deepPurple, green } from '@material-ui/core/colors';
import toWords from 'split-camelcase-to-words';
import { ParserStatusMessages } from '../models/enums';
import { ExpandMoreOutlined, ImportContactsOutlined, PlaylistAddCheckOutlined, SettingsApplicationsOutlined, TimerOutlined } from '@material-ui/icons';
import humanizeDuration from "humanize-duration";

const ROW_HEIGHT = 35;

export default function App() {
	const theme = useTheme();
	const [session, setSession] = useState({ data: null });
	const [groups, setGroups] = useState([]);
	const [loading, setLoading] = useState(false);
	const [percentDone, setPercentDone] = useState(0);
	const [filter, setFilter] = useState('');
	const groupListRef = useRef();

	function parseFile(e) {
		const parser = new Worker(new URL('../tools/parser.js', import.meta.url));
		if (e?.target?.files?.length === 1) {
			setLoading(true);
			parser.onmessage = (e) => {
				switch (e.data.type) {
					case ParserStatusMessages.CompletionUpdate:
						setPercentDone(e.data.value);
						break;
					case ParserStatusMessages.Finished:
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

	const Row = ({ index, style }) => (
		<div style={style}>
			{groups?.[index]?.map((file, fileIndex) =>
				<div key={fileIndex} style={{ height: ROW_HEIGHT, backgroundColor: [deepPurple[100], green[100]][index % 2] }}>{file}</div>)}
		</div>
	);

	function itemSize(index) {
		return groups[index]?.length * ROW_HEIGHT;
	}

	function applyFilter() {
		const filterController = new Worker(new URL('../tools/filterController.js', import.meta.url));
		filterController.onmessage = e => {
			setGroups(e.data);
			groupListRef.current.resetAfterIndex(0, true);
			filterController.terminate();
		};

		filterController.postMessage({
			token: filter,
			items: session.data.groups
		});
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
												Basic Configuration
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
					<AccordionSummary expandIcon={<ExpandMoreOutlined />}>Filters</AccordionSummary>
					<AccordionDetails>
						<TextField value={filter} onChange={e => setFilter(e.target.value)} variant='standard' color='primary' label='Filter String' style={{ minWidth: '500px' }} />
						<Button onClick={applyFilter}>Apply</Button>
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
				itemSize={itemSize}
			>
				{Row}
			</List>
		</div >
	)
}

