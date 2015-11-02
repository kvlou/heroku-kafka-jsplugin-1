'use strict';

let cli = require('heroku-cli-util');
let co = require('co');
let HerokuKafkaResource = require('./resource.js').HerokuKafkaResource;

function addonInfoWithName(addonInfo, name) {
  return addonInfo.info.filter(function (field) {
    return field.name == name;
  })[0];
}

function formatInfo(addonInfo) {
  var out = ["=== HEROKU_KAFKA"];
  out.push("Name:                   " + addonInfoWithName(addonInfo, 'Name').values[0]);
  out.push("Created:                " + addonInfoWithName(addonInfo, 'Created').values[0]);
  out.push("Plan:                   " + addonInfoWithName(addonInfo, 'Plan').values[0]);
  var nodes = addonInfoWithName(addonInfo, 'Status').values;
  var firstNode = nodes.shift();
  out.push("Status:                 " + firstNode);
  nodes.forEach(function (node) {
    out.push("                        " + node);
  });
  out.push("Messages In Per Second: " + addonInfo.metrics.messages_in_per_sec.toFixed(2));
  out.push("Bytes In Per Second:    " + addonInfo.metrics.bytes_in_per_sec.toFixed(2));
  out.push("Bytes Out Per Second:   " + addonInfo.metrics.bytes_out_per_sec.toFixed(2));
  return out.join("\n");
}


function* kafkaInfo (context, heroku) {
  var info = yield new HerokuKafkaResource(heroku, process.env, context).info();
  if (info) {
    console.log(formatInfo(info));
  } else {
    process.exit(1);
  }
}

module.exports = {
  topic: 'kafka',
  command: 'info',
  description: 'shows information about the state of your Heroku Kafka cluster',
  help: `
    Shows the state of your Heroku Kafka cluster.

    Examples:

    $ heroku kafka:info
`,
  needsApp: true,
  needsAuth: true,
  run: cli.command(co.wrap(kafkaInfo))
};
