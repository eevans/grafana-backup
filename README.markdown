grafana-backup
==============
Backup Grafana JSON dashboards.

Usage
-----

    $ ./backup.js -h
    Usage: nodejs backup.js -c creds.yaml -u URL -i INDEX [options]
    
    Options:
      -h, --help         Show help                                         [boolean]
      -c, --credentials  YAML credentials file
      -D, --debug        Enable debug mode
      -d, --dir          Backup output directory                 [default: "target"]
      -m, --match        Only backup dashboards matching value
      -u, --url          Elastic search URL
                                         [default: "https://logstash.wikimedia.org"]
      -i, --index        Elastic search index name   [default: "grafana-dashboards"]
    