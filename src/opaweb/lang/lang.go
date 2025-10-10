// Package lang
package lang

import (
	"encoding/json"
	"fmt"
	"os"

	"opaweb/applog"
	"opaweb/common"
)

const TRFOLDER = "tra"

var lame map[string]string

func readJSON(filename string) (ret *[]byte) {
	lang := common.Env(false).Lang
	lap := fmt.Sprintf("%s/%s/%s/%s.json", common.Env(false).Static, TRFOLDER, lang, filename)

	_, err := os.Stat(lap)
	if err != nil {
		return
	}

	laf, err := os.ReadFile(lap)
	if err != nil {
		applog.Danger("Cannot open file", err)
		return
	}

	ret = &laf

	return
}

func LoadMessages() {
	pcont := readJSON("messages")

	if pcont == nil {
		return
	}

	json.Unmarshal(*pcont, &lame)
}

func NeedTra() bool {
	return len(lame) != 0
}

func Re(str ...string) string {
	if len(str) == 0 {
		return ""
	}

	key := str[0]

	if len(lame) == 0 {
		return key
	}

	ret, ok := lame[key]
	if !ok {
		return key
	}

	if len(str) == 2 {
		ret = fmt.Sprintf(ret, str[1])
	}

	return ret
}
