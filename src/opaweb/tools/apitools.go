package tools

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"opaweb/applog"

	"github.com/julienschmidt/httprouter"
)

type WsRequest struct {
	UqRoom string `json:"uqroom,omitempty"`
	UqUser string `json:"uquser,omitempty"`
	Nik    string `json:"nik,omitempty"`
	Mic    bool   `json:"mic,omitempty"`
	Cam    bool   `json:"cam,omitempty"`
	Fi     string `json:"fi,omitempty"`
}

type WsSettings struct {
	WsURL   string              `json:"wsurl,omitempty"`
	UqRoom  string              `json:"uqroom,omitempty"`
	UqUser  string              `json:"uquser,omitempty"`
	PerRoom int                 `json:"perroom,omitempty"`
	Nik     string              `json:"nik,omitempty"`
	Mic     bool                `json:"mic"`
	Cam     bool                `json:"cam"`
	Virt    bool                `json:"virt"`
	Recserv bool                `json:"recserv"`
	IceList []map[string]string `json:"iceList"`
}

type AjaAns struct {
	Res  bool        `json:"res"`
	Sets *WsSettings `json:"sets,omitempty"`
	Cont string      `json:"cont,omitempty"`
}

func doJSONFromBody(body io.Reader, v any) {
	decoder := json.NewDecoder(body)
	if err := decoder.Decode(v); err != nil {
		applog.Danger("Cannot parse form", err)
	}
}

func newSettings(uqroom string, nik string, wsurl string, mic bool, cam bool, virt bool) *WsSettings {
	env := Env(true)
	res := WsSettings{}

	var uquserNew string
	if virt {
		uquserNew = fmt.Sprintf("%s-viuser", uqroom)
	} else {
		uquserNew = CreateUID()
	}

	res.UqRoom = uqroom
	res.UqUser = uquserNew
	res.PerRoom = env.Ws.PerRoom
	res.Nik = nik
	res.Mic = mic
	res.Cam = cam
	res.Virt = virt
	res.Recserv = env.Recserv
	res.WsURL = fmt.Sprintf(wsurl,
		env.Ws.URL,
		env.Ws.Port,
		res.UqRoom,
		res.UqUser,
		res.PerRoom,
		nik,
	)
	res.IceList = env.IceList

	return &res
}

func GetSetsFromReq(r *http.Request) (wset *WsSettings) {
	var re WsRequest
	doJSONFromBody(r.Body, &re)

	wset = newSettings(
		re.UqRoom, re.Nik,
		"wss://%s:%d/ws/%s/%s/%d?nik=%s",
		re.Mic, re.Cam, false,
	)

	return
}

func GetSetsForVirt(ps httprouter.Params) (wset *WsSettings) {
	uqroom := ps.ByName("uqroom")

	wset = newSettings(
		uqroom, "virt",
		"wss://%s:%d/ws/%s/%s/%d?nik=%s",
		false, false, true,
	)

	return
}

func GetWsReq(r *http.Request) (wre *WsRequest) {
	var re WsRequest
	doJSONFromBody(r.Body, &re)

	wre = &re

	return
}
