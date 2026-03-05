package main

import (
	"fmt"
	"log"
	"net/http"
	"time"

	_ "net/http/pprof"

	"opaweb/controllers"
	"opaweb/tools"

	"github.com/gorilla/csrf"
	"golang.org/x/crypto/acme/autocert"
)

var ct = map[string]int64{
	"ReadTimeout":  10,
	"WriteTimeout": 120,
	"IdleTimeout":  120,
}

func main() {
	runInit()

	e := tools.Env(false)

	csrfH := csrf.Protect(
		[]byte(tools.GetKeyCSRF()),
		csrf.Path("/"),
	)

	if e.Acme {
		startAcme(e, csrfH)
		return
	}

	startSelf(e, csrfH)
}

func shows(e *tools.Configuration, ttl string) {
	fmt.Printf("\n%s [%s]\n"+
		"started at: %s\n",
		e.Appname, ttl,
		time.Now().Format("2006-01-02 15:04:05"),
	)
}

func startPprof() {
	// http://localhost:9090/debug/pprof/goroutine?debug=1

	go func() {
		http.ListenAndServe(":9090", nil)
	}()
}

func startSelf(e *tools.Configuration, cs func(http.Handler) http.Handler) {
	shows(e, "self")

	startPprof()

	mux := controllers.GetRouters()

	server := &http.Server{
		Addr:           fmt.Sprintf("%s:%d", e.Address, e.Port),
		Handler:        cs(mux),
		ReadTimeout:    time.Duration(ct["ReadTimeout"] * int64(time.Second)),
		WriteTimeout:   time.Duration(ct["WriteTimeout"] * int64(time.Second)),
		IdleTimeout:    time.Duration(ct["IdleTimeout"] * int64(time.Second)),
		MaxHeaderBytes: 1 << 20,
	}

	log.Fatalln(server.ListenAndServeTLS(e.Crt, e.Key))
}

func startAcme(e *tools.Configuration, cs func(http.Handler) http.Handler) {
	shows(e, "acme")

	certManager := &autocert.Manager{
		Prompt:     autocert.AcceptTOS,
		HostPolicy: autocert.HostWhitelist(e.Acmehost...),
		Cache:      autocert.DirCache(e.DirCache),
	}

	mux := controllers.GetRouters()

	server := &http.Server{
		Addr:           fmt.Sprintf(":%d", e.Port),
		Handler:        cs(mux),
		ReadTimeout:    time.Duration(ct["ReadTimeout"] * int64(time.Second)),
		WriteTimeout:   time.Duration(ct["WriteTimeout"] * int64(time.Second)),
		IdleTimeout:    time.Duration(ct["IdleTimeout"] * int64(time.Second)),
		TLSConfig:      certManager.TLSConfig(),
		MaxHeaderBytes: 1 << 20,
	}

	// go http.ListenAndServe(":http", certManager.HTTPHandler(nil))

	log.Fatalln(server.ListenAndServeTLS("", ""))
}
