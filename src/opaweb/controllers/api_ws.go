package controllers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"opaweb/tools"

	"github.com/julienschmidt/httprouter"
)

func WsChat(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	GenerateHTMLEmp(w, r, nil, "stru/ix")
}

func WsMeet(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	uqroom := tools.RandUID()
	http.Redirect(w, r, ro("ws_me_get", uqroom), http.StatusSeeOther)
}

func WsMeetGet(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	qv := r.URL.Query()
	nikin := qv.Get("n")
	st := qv.Get("st")
	ca := qv.Get("ca")
	mi := qv.Get("mi")

	getCam := false
	if len(ca) > 0 {
		va, _ := strconv.Atoi(ca)
		getCam = va > 0
	}

	getMi := true
	if len(mi) > 0 {
		va, _ := strconv.Atoi(mi)
		getMi = va > 0
	}

	uqroom := ps.ByName("uqroom")

	env := tools.Env(true)

	urlist := fmt.Sprintf("https://%s:%d/lir/%s", env.Ws.URL, env.Ws.Port, uqroom)

	info := map[string]any{
		"uqroom": uqroom,
		"camic": map[string]bool{
			"mic":     getMi,
			"cam":     getCam,
			"tophint": true,
		},
		"nikin":  nikin,
		"st":     st,
		"urlist": urlist,
	}

	GenerateHTMLEmp(w, r, info, "stru/st_meet", "stru/camic")
}

func WsMeetStart(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	w.Header().Set("Content-Type", "application/json")

	wse := tools.GetSetsFromReq(r)

	data := map[string]any{
		"sets": wse,
		"camic": map[string]bool{
			"mic":     wse.Mic,
			"cam":     wse.Cam,
			"tophint": false,
		},
		"recserv": wse.Recserv,
	}

	co := GetHTMLAjax(data,
		"stru/sta", "stru/camic",
		"stru/_reca", "stru/_tabtns",
		"stru/_selfvi", "stru/_chata",
	)

	ans := tools.AjaAns{
		Res:  true,
		Sets: wse,
		Cont: co,
	}

	output, _ := json.Marshal(ans)

	w.Write(output)
}
