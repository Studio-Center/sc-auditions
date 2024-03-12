#!/bin/bash
DIR=/var/www/html
PATH=/usr/sbin:/usr/bin:/sbin:/bin:/usr/sbin:/usr/bin
#NODE_PATH=/root/.nvm/versions/node/v4.8.4/lib
NODE=/root/.nvm/versions/node/v4.8.4/bin/node

test -x $NODE || exit 0

function start_app {
  NODE_ENV=production nohup "$NODE" "$DIR/server.js" 1>>"$DIR/logs/sc-auditions.log" 2>&1 &
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
      echo "usage: sc-audtions {start|stop|restart}" ;;
esac
exit 0
