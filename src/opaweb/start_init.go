package main

import (
	"opaweb/common"
)

func runInit() {
	common.LoadConfig()
	common.SetCsrf()
}
