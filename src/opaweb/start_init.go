package main

import (
	"opaweb/lang"
	"opaweb/tools"
)

func runInit() {
	tools.LoadConfig()
	tools.SetCsrf()
	lang.LoadMessages()
}
