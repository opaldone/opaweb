package main

import (
	"opaweb/common"
	"opaweb/lang"
)

func runInit() {
	common.LoadConfig()
	common.SetCsrf()
	lang.LoadMessages()
}
