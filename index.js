const chalk = require('chalk');
const clear = require('clear');
const CLI = require('clui');
const figlet = require('figlet');
const inquirer = require('inquirer');
const Preferences = require('preferences');
const Spinner = CLI.Spinner;
const GitHubApi = require('github');
const _ = require('lodash');
const git = require('simple-git')();
const touch = require('touch');
const fs = require('fs');
const files = require('./lib/files');
const prefs = new Preferences('createjsapp');
const github = new GitHubApi({
  version: '3.0.0'
});

clear();
console.log(
  chalk.yellow(
    figlet.textSync('create-js-app', { horizontalLayout: 'full' })
  )
);

//if (files.directoryExists('.git')) {
//console.log(chalk.red('This project is already setup'));
//process.exit();
//}

function getGithubCredentials(callback) {
  const questions = [
    {
      name: 'username',
      type: 'input',
      message: 'Enter your Github username or e-mail address:',
      validate: function(value) {
        if (value.length) {
          return true;
        } else {
          return 'Please enter your username or e-mail address';
        }
      }
    },
    {
      name: 'password',
      type: 'password',
      message: 'Enter your password:',
      validate: function(value) {
        if (value.length) {
          return true;
        } else {
          return 'Please enter your password:';
        }
      }
    }
  ];

  inquirer.prompt(questions).then(callback);
}

getGithubCredentials(function() {
  console.log(arguments);
});
