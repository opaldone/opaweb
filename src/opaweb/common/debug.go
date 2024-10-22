package common

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

// DebugJ pretty print structures
func DebugJ(v interface{}, echo bool) string {
	b, err := json.MarshalIndent(v, "", "  ")
	if err == nil {
		if echo {
			fmt.Println(string(b))
			return ""
		}
		return string(b)
	}

	fmt.Println(err)
	return ""
}

// DebugResponseBody prints response body
func DebugResponseBody(r *http.Response) {
	b, _ := io.ReadAll(r.Body)
	fmt.Println(string(b))
}

// DebugRequestBody prints request body
func DebugRequestBody(r *http.Request) {
	len := r.ContentLength
	body := make([]byte, len)
	r.Body.Read(body)
	fmt.Println(string(body))
}

// DebugRequestSimpleForm prints simple form
func DebugRequestSimpleForm(r *http.Request) {
	r.ParseForm()
	fmt.Println(r.Form)
}
