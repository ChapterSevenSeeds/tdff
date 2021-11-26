import { render } from 'react-dom';
import App from './components/App';
import React from 'react';
import { ThemeProvider } from '@material-ui/styles';
import { createTheme, CssBaseline } from '@material-ui/core';
import { deepPurple, green, lightBlue, purple, teal } from '@material-ui/core/colors';

// Since we are using HtmlWebpackPlugin WITHOUT a template, we should create our own root node in the body element before rendering into it
const root = document.createElement('div');

root.id = 'root';
document.body.appendChild(root);

// Now we can render our application into it
render(
    <>
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
        <CssBaseline />
        <ThemeProvider theme={createTheme({
            palette: {
                primary: deepPurple,
                secondary: green,
            },
        })}>
            <App />
        </ThemeProvider>
    </>
    , document.getElementById('root'));
