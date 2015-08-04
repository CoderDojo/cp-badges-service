#!/bin/bash
isExistApp=`pgrep cp-badges-service`
if [[ -n $isExistApp ]]; then
  service cp-badges-service stop
fi
