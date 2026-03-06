// Package controllers
package controllers

import (
	"net/http"
	"strings"

	"opaweb/tools"

	"github.com/julienschmidt/httprouter"
)

type route struct {
	method  string
	pattern string
	handle  httprouter.Handle
}

type routes = map[string]route

var list routes

func init() {
	list = routes{
		"home":        route{"GET", "/", WsChat},
		"ws_me":       route{"GET", "/meet", WsMeet},
		"ws_me_get":   route{"GET", "/meet/:uqroom", WsMeetGet},
		"ws_me_start": route{"POST", "/meet-st", WsMeetStart},
		"vi_start":    route{"POST", "/vi-start", ViStart},
		"vi_stop":     route{"POST", "/vi-stop", ViStop},
		"vi_uptime":   route{"POST", "/vi-uptime", ViUptime},
		"vi_del_vid":  route{"POST", "/vi-delete", ViDelete},
		"virt":        route{"GET", "/virt/:uqroom", Virt},
	}
}

// GetRouters returns routers
func GetRouters() (router *httprouter.Router) {
	router = httprouter.New()
	router.ServeFiles("/static/*filepath", http.Dir(tools.Env(false).Static))
	router.ServeFiles("/revis/*filepath", http.Dir("envir/rec/rooms"))

	for _, r := range list {
		router.Handle(r.method, r.pattern, r.handle)
	}

	return
}

func ro(alias string, pars ...string) string {
	pat := list[alias].pattern
	pata := strings.Split(pat, ":")

	if len(pata) == 1 {
		return pat
	}

	if len(pars) == 0 {
		return pat
	}

	purl := ""
	for _, par := range pars {
		if len(purl) > 0 {
			purl += "/"
		}
		purl += par
	}

	ret := pata[0] + purl

	return ret
}
