package controllers

import (
	"encoding/json"
	"net/http"

	"opaweb/serv"
	"opaweb/tools"

	"github.com/julienschmidt/httprouter"
)

func ViStart(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	re := tools.GetWsReq(r)
	serv.StartRec(re.UqRoom)
}

func ViStop(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	re := tools.GetWsReq(r)
	serv.StopRec(re.UqRoom)
}

func ViUptime(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	re := tools.GetWsReq(r)
	serv.UpdateRoomTiming(re.UqRoom)
}

func Virt(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	wse := tools.GetSetsForVirt(ps)

	ob, _ := json.Marshal(wse)

	info := map[string]any{
		"ob": string(ob),
	}

	GenerateHTMLEmp(w, r, info, "stru/virt")
}
