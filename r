#!/bin/bash

cd $(dirname "${BASH_SOURCE[0]}")

declare gpath=$("pwd")
declare project=""
if [[ $gpath =~ (.*\/)(.*) ]]; then
    project=${BASH_REMATCH[2]}
fi
export GOPATH="$gpath"
declare bin="$gpath/bin"
declare binka="$bin/$project"
declare src="$gpath/src/$project"
declare par=$1

if [[ $par == "b" ]]; then
    cd "$src"
    declare err=$(go install 2>&1>/dev/null)

    if [[ ! -z $err ]]; then
        echo "$err"
        printf '─%.s' $(seq 50)
        echo
        exit 0
    fi

    if [[ -e $binka ]]; then
        echo "$project OK"
        printf '─%.s' $(seq 50)
        echo
        exit 0
    fi

    echo "$binka not found"
    exit -1
fi

if [[ $par ]]; then
    echo -e "\nThe parameter \"$par\" is wrong\n"
    exit -1
fi

if [[ -e $binka ]]; then
    cd $bin
    echo -en "\033]0;$project\a"
    $binka
else
    echo -e "$binka not found\n"
fi