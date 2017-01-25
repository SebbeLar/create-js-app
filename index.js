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


function getGithubToken(callback) {
  const prefs = new Preferences('createjsapp');

  if(prefs.github && prefs.github.token) {
    return callback(null, prefs.github.token);
  }

  getGithubCredentials(function(credentials) {
    const status = new Spinner('Authenticating you, please wait...');
    status.start();

    github.authenticate(
      _.extend(
        {
          type: 'basic'
        },
        credentials
      )
    );

    github.authorization.create({
      scopes: ['user', 'public_repo', 'repo', 'repo:status'],
      note: 'create-js-app, CLI for fast scafolding'
    }, function(err, res) {
      status.stop();
      if(err) {
        return callback(err);
      }
      if(res.token) {
        prefs.github = {
          token: res.token
        };
        return callback(null, res.token);
      }
      return callback();
    });
  });
}

function createRepo(callback) {
  const argv = require('minimist')(process.argv.slice(2));

  const questions = [
    {
      type: 'input',
      name: 'name',
      message: 'Enter a name for the repository:',
      default: argv._[0] || files.getCurrentDirectoryBase(),
      validate: function(value) {
        if(value.length) {
          return true;
        } else {
          return 'Please enter a name for the repository';
        }
      }
    },
    {
      type: 'input',
      name: 'description',
      default: argv._[1] || null,
      message: 'Enter a description of the repository:'
    },
    {
      type: 'list',
      name: 'visability',
      message: 'Public pr private:',
      choices: ['public', 'private'],
      default: 'public'
    }
  ];

  inquirer.prompt(questions).then(function(answers) {
    const status = new Spinner('Creating repository...');
    status.start();

    const data = {
      name: answers.name,
      description: answers.description,
      private: (answers.visability === 'private')
    };

    github.repos.create(
      data,
      function(err, res) {
        status.stop();
        if(err) {
          return callback(err);
        }
        return callback(null, res.ssh_url);
      }
    );
  });
}
