package lang

import (
	"encoding/json"
	"fmt"
	"os"

	"opaweb/applog"
	"opaweb/common"
)

const TR_FOLDER = "tra"

var lame map[string]string

func read_json(file_name string) (ret *[]byte) {
	lang := common.Env(false).Lang
	lap := fmt.Sprintf("%s/%s/%s/%s.json", common.Env(false).Static, TR_FOLDER, lang, file_name)

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
	p_cont := read_json("messages")

	if p_cont == nil {
		return
	}

	json.Unmarshal(*p_cont, &lame)
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
