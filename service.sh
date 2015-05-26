#!/bin/bash
DIR=/home/rob/sc-audtions
PATH=/usr/sbin:/usr/bin:/sbin:/bin:/usr/sbin:/usr/bin
NODE_PATH=/usr/lib/node_modules
NODE=/usr/bin/node

test -x $NODE || exit 0

function start_app {
  NODE_ENV=development nohup "$NODE" "$DIR/server.js" 1>>"$DIR/logs/sc-audtions.log" 2>&1 &
  echo $! > "$DIR/pids/sc-audtions.pid"
}

function stop_app {
  kill `cat $DIR/pids/sc-audtions.pid`
}

case $1 in
   start)
      start_app ;;
    stop)
      stop_app ;;
    restart)
      stop_app
      start_app
      ;;
    *)
      echo "usage: sc-audtions {start|stop}" ;;
esac
exit 0