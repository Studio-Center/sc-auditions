#!/bin/bash

# script directory
#DIR=/var/www/html
DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
#PATH=/usr/sbin:/usr/bin:/sbin:/bin:/usr/sbin:/usr/bin
#NODE_PATH=/root/.nvm/versions/node/v4.8.4/lib
# node binary location used for direct start
NODE=/root/.nvm/versions/node/v4.8.4/bin/node

test -x $NODE || exit 0

function forever_app {
  NODE_ENV=production nohup forever "$DIR/server.js" 1>>"$DIR/logs/sc-auditions.log" 2>&1 &
  echo $! > "$DIR/pids/sc-audtions.pid"
}

function direct_start_app {
  NODE_ENV=production nohup "$NODE" "$DIR/server.js" 1>>"$DIR/logs/sc-auditions.log" 2>&1 &
  echo $! > "$DIR/pids/sc-audtions.pid"
}

function start_app {
  NODE_ENV=production nohup node "$DIR/server.js" 1>>"$DIR/logs/sc-auditions.log" 2>&1 &
  echo $! > "$DIR/pids/sc-audtions.pid"
}

function stop_app {
  kill `cat $DIR/pids/sc-audtions.pid`
}

case $1 in
   forever)
      forever_app ;;
   directstart)
      start_app ;;
   start)
      start_app ;;
    stop)
      stop_app ;;
    restart)
      stop_app
      start_app
      ;;
    *)
      echo "usage: sc-audtions {forever|directstart|start|stop|restart}" ;;
esac
exit 0
