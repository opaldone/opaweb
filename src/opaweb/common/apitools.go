package common

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
	Nik    string `json:"nik,omitempty"`
	Mic    bool   `json:"mic,omitempty"`
	Cam    bool   `json:"cam,omitempty"`
	Ke     string `json:"ke,omitempty"`
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

func newSettings(uqroom, nik, wsurl, ke string,
	mic, cam, virt bool,
) (wset *WsSettings) {
	env := Env(true)
	res := WsSettings{}

	res.UqRoom = uqroom
	res.UqUser = CreateUID()
	res.PerRoom = env.Ws.PerRoom
	res.Nik = nik
	res.Mic = mic
	res.Cam = cam
	res.Virt = virt
	res.Recserv = len(env.RecFolder) > 0
	res.WsURL = fmt.Sprintf(wsurl,
		env.Ws.WsURL,
		res.UqRoom,
		res.UqUser,
		res.PerRoom,
		nik,
		ke,
	)
	res.IceList = env.IceList

	wset = &res

	return
}

func GetSetsFromReq(r *http.Request) (wset *WsSettings) {
	var re WsRequest
	doJSONFromBody(r.Body, &re)

	wset = newSettings(
		re.UqRoom, re.Nik,
		"%s/ws/%s/%s/%d?nik=%s%s", "",
		re.Mic, re.Cam, false,
	)

	return
}

func GetSetsForVirt(ps httprouter.Params) (wset *WsSettings) {
	uqroom := ps.ByName("uqroom")
	ke := ps.ByName("ke")

	wset = newSettings(
		uqroom, "virt",
		"%s/ws/%s/%s/%d?nik=%s&ke=%s", ke,
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
