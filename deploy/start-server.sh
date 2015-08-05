#!/bin/bash
isExistApp=`ps -eaf |grep cp-badges-service |grep -v grep| awk '{ print $2; }'`
if [[ -n $isExistApp ]]; then
    service cp-badges-service stop
fi

service cp-badges-service start
