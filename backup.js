#!/usr/bin/env node

/*
 * Copyright 2015 Eric Evans <eevans@wikimedia.org>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

/* Grafana dashboard backup script. */

"use strict";

var extend  = require('extend');
var fs      = require('fs');
var preq    = require('preq');
var yaml    = require('js-yaml');


function basicAuthHeader(user, pass) {
    return 'Basic ' + new Buffer(user + ':' + pass).toString('base64');
}

function searchUrl(baseurl, index, match) {
    // FIXME: hard-coded size!!
    var url = baseurl + '/' + index + '/' + '_search?size=' + 100;
    if (match) {
        url = url + '&q=' + match;
    }
    return url;
}

function search(options) {
    return preq.get({
        uri: searchUrl(options.url, options.index, options.match),
        headers: {
            Authorization: basicAuthHeader(options.username, options.password),
        },
    })
    .then(function(res) {
        return res.body;
    });
}

var argv = require('yargs')
    .usage('Usage: $0 -c creds.yaml -u URL -i INDEX [options]')
    .default('d', 'target')
    .default('u', 'https://logstash.wikimedia.org')
    .default('i', 'grafana-dashboards')
    .help('h')
    .alias('h', 'help')
    .alias('D', 'debug')
    .alias('d', 'dir')
    .alias('c', 'credentials')
    .alias('m', 'match')
    .alias('u', 'url')
    .alias('i', 'index')
    .describe('c', 'YAML credentials file')
    .describe('D', 'Enable debug mode')
    .describe('d', 'Backup output directory')
    .describe('m', 'Only backup dashboards matching value')
    .describe('u', 'Elastic search URL')
    .describe('i', 'Elastic search index name')
    .argv;

var options = {};

if (argv.credentials) {
    var creds = yaml.safeLoad(fs.readFileSync(argv.credentials, 'utf8')).credentials;
    options.username = creds.username;
    options.password = creds.password;
}

if (argv.debug) {
    console.error('Using', searchUrl(argv.url, argv.index, argv.match));
}

if (!fs.existsSync(argv.dir)) {
    fs.mkdirSync(argv.dir);
}

options = extend(options, argv);

search(options)
.then(function(res) {
    var hits = res.hits;
    if (argv.debug) {
        console.error('Found', hits.total, 'total matches');
    }
    hits.hits.forEach(function(hit) {
        if (argv.debug) {
            console.error('_id:', hit._id);
        }
        fs.writeFileSync(argv.dir + '/' + hit._id, hit._source.dashboard);
    });
})
.catch(function(error) {
    console.log('Unable to retrieve dashboards: ' + error);
});
