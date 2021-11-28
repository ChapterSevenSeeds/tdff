import { Button, Grid, LinearProgress, makeStyles, Typography, useTheme } from '@material-ui/core';
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { FixedSizeList as List } from 'react-window';
import { WorkerMessageTypes } from '../models/enums';
import Stats from './Stats';
import Filtering from './Filtering';
import Row from './Row';

const useStyles = makeStyles({
    fileGridContainer: {
        textOverflow: 'ellipsis', 
		whiteSpace: 'nowrap', 
		overflow: 'hidden'
	}
});

export default function App() {
	const theme = useTheme();
	const classes = useStyles();
	const [session, setSession] = useState({ data: null });
	const [files, setFiles] = useState([]);
	const [loading, setLoading] = useState(false);
	const [percentDone, setPercentDone] = useState(0);

	const filesGross = useRef([]);
	
	const groupListRef = useRef();

	useEffect(() => {
		filesGross.current = files;
	}, [files]);

	const parseFile = useCallback((e) => {
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
						setFiles(e.data.value.files);
						parser.terminate();
						setLoading(false);
						break;
				}
			}
			parser.postMessage(e.target.files[0].path);
		}
	}, []);

	const resetItems = useCallback(() => {
		setFiles(session?.data?.files ?? []);
	}, [session]);

	const setNewFiles = useCallback(newFiles => setFiles(newFiles), []);

	const handleSelectItem = useCallback(e => {
		setFiles(files => {
			files[+e.target.name].selected = e.target.checked;
			return [...files];
		});
	}, [files]);

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
				<Stats session={session} />
				<Filtering 
					resetItems={resetItems} 
					setNewFiles={setNewFiles} 
					session={session}
					files={filesGross}
				/>
			</>}
			<List
				ref={groupListRef}
				itemData={{ files, handleSelectItem, theme, classes }}
				height={1000}
				itemCount={files.length}
				width='100%'
				overscanCount={15}
				itemSize={35}
			>
				{Row}
			</List>
			
		</div>
	)
}

