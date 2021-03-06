import 'babel-polyfill';
import chokidar from 'chokidar';
import http from 'http';
import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import env from 'dotenv';
import chalk from 'chalk';
import figlet from 'figlet';
import reporter from './server/lib/webpackReporter';

import { name } from '../package.json';

env.config();

figlet.text(`Welcome to \n ${process.env.APPLICATION_NAME || name}`, {
  verticalLayout: 'full',
  kerning: 'fitted',
}, (err, data) => {
  if (!err) {
    console.log(chalk.green(data));
  }
});

const app = express();
if (process.env.NODE_ENV === 'development') {
  const config = require('../webpack.config.babel.js').default; // eslint-disable-line
  const compiler = webpack(config);

// Serve hot-reloading bundle to client
  app.use(webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath,
    reporter,
  }));
  app.use(webpackHotMiddleware(compiler));

  const watcher = chokidar.watch('./server');

  watcher.on('ready', () => {
    watcher.on('all', () => {
      console.log(chalk.yellow('Hot-reloading server modules...'));
      Object.keys(require.cache).forEach(id => {
        if (/[\/\\]server[\/\\]/.test(id)) delete require.cache[id];
      });
    });
  });

// Do "hot-reloading" of react stuff on the server
// Throw away the cached client modules and let them be re-required next time
  compiler.plugin('done', () => {
    console.log('Clearing /client/ module cache from server');
    Object.keys(require.cache).forEach(id => {
      if (/[\/\\]client[\/\\]/.test(id)) delete require.cache[id];
    });
  });
}

app.use((req, res, next) => {
  require('./server').default(req, res, next); // eslint-disable-line global-require
});


const server = http.createServer(app);
server.listen(process.env.PORT || 3000, '0.0.0.0', err => {
  if (err) throw err;

  const addr = server.address();
  console.log(chalk.blue.bold('Server Started!'));
  console.log(chalk.cyan(`Listening at http://${addr.address}:${addr.port}`));
});
