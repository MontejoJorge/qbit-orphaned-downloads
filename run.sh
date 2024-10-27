#!/bin/sh

INTERVAL_HOURS=${INTERVAL_HOURS:-6}

while true
do
  echo "Runing script - $(date)"
  pnpm start
  echo "Runing again in ${INTERVAL_HOURS} hours"
  sleep ${INTERVAL_HOURS}h
done
