package main

import (
	"fmt"
	"log"
	"net/http"
	"opaweb/config"
	"opaweb/controllers"
	"time"

	"golang.org/x/crypto/acme/autocert"
)

func main() {
	runInit()

	e := config.Env()

	if e.Debug {
		startDevTLS(e)
		return
	}

	startTLS(e)
}

func startDevTLS(e *config.Configuration) {
	fmt.Printf("\n[%s] %s started\ncrt\t\t%s\nkey\t\t%s\naddress\t\t%s:%d\n",
		"debug", e.Appname,
		e.Crt, e.Key,
		e.Address, e.Port,
	)

	mux := controllers.GetRouters()

	server := &http.Server{
		Addr:           fmt.Sprintf("%s:%d", e.Address, e.Port),
		Handler:        mux,
		ReadTimeout:    time.Duration(e.ReadTimeout * int64(time.Second)),
		WriteTimeout:   time.Duration(e.WriteTimeout * int64(time.Second)),
		MaxHeaderBytes: 1 << 20,
	}

	log.Fatalln(server.ListenAndServeTLS(e.Crt, e.Key))
}

func startTLS(e *config.Configuration) {
	fmt.Printf("\n[%s] %s started\nacmehost\t%s\ndirCache\t%s\naddress\t\t%s:%d\n",
		"prod", e.Appname,
		e.Acmehost, e.DirCache, e.Address, e.Port,
	)

	certManager := &autocert.Manager{
		Prompt:     autocert.AcceptTOS,
		HostPolicy: autocert.HostWhitelist(e.Acmehost),
		Cache:      autocert.DirCache(e.DirCache),
	}

	// go http.ListenAndServe(":http", certManager.HTTPHandler(http.HandlerFunc(httpRedirect)))

	mux := controllers.GetRouters()

	server := &http.Server{
		Addr:           fmt.Sprintf(":%d", e.Port),
		Handler:        mux,
		ReadTimeout:    time.Duration(e.ReadTimeout * int64(time.Second)),
		WriteTimeout:   time.Duration(e.WriteTimeout * int64(time.Second)),
		IdleTimeout:    time.Duration(e.IdleTimeout * int64(time.Second)),
		TLSConfig:      certManager.TLSConfig(),
		MaxHeaderBytes: 1 << 20,
	}

	log.Fatalln(server.ListenAndServeTLS("", ""))
}
