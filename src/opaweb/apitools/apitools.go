package apitools

import (
	"encoding/json"
	"io"
	"opaweb/applog"
)

// FormToJSON converts form data into json
func FormToJSON(body io.Reader, v interface{}) {
	decoder := json.NewDecoder(body)
	if err := decoder.Decode(v); err != nil {
		applog.Danger("Cannot parse form", err)
	}
}
