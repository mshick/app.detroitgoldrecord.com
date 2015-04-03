#!/bin/bash
log="/var/log/ec2-backup.log"
volume="vol-c1ea95c4"
region="us-west-2"
age="31"

results=$(/home/ec2-user/bin/ec2-automate-backup -v "${volume}" -r "${region}" -k $age)

EXITVALUE=$?
msg="[$(date +%Y-%m-%d:%H:%M:%S%z)]"

if [ $EXITVALUE = 0 ]; then
    msg="${msg} Snapshot successful"
    code=0
else
    msg="${msg} ERROR: ${results}"
    code=1
fi

echo $msg >> $log
exit $code
