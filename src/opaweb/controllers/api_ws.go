package controllers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"

	"opaweb/applog"
	"opaweb/common"

	"github.com/julienschmidt/httprouter"
)

func WSChat(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	GenerateHTMLEmp(w, r, nil, "stru/ix")
}

func WsMeet(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	uqroom := common.CreateUID()
	http.Redirect(w, r, ro("ws_me_get", uqroom), http.StatusSeeOther)
}

func WsMeetGet(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	uqroom := ps.ByName("uqroom")

	info := map[string]interface{}{
		"uqroom": uqroom,
		"camic":  map[string]bool{"mic": true, "cam": true, "tophint": true},
	}

	GenerateHTMLEmp(w, r, info, "stru/st_meet", "stru/camic")
}

func WsMeetStart(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	w.Header().Set("Content-Type", "application/json")

	wse := common.GetSetsFromReq(r)

	data := map[string]interface{}{
		"sets":    wse,
		"camic":   map[string]bool{"mic": wse.Mic, "cam": wse.Cam, "tophint": false},
		"recserv": wse.Recserv,
	}

	co := GetHTMLAjax(data,
		"stru/sta", "stru/camic",
		"stru/_reca", "stru/_tabtns", "stru/_selfvi",
	)

	ans := common.AjaAns{
		Res:  true,
		Sets: wse,
		Cont: co,
	}

	output, _ := json.Marshal(ans)

	w.Write(output)
}

func WsVirt(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	wse := common.GetSetsForVirt(ps)

	ob, _ := json.Marshal(wse)

	info := map[string]interface{}{
		"ob": string(ob),
	}

	GenerateHTMLEmp(w, r, info, "stru/virt")
}

func getFi(uqroom_in, ke_in string) string {
	fn := fmt.Sprintf("vi_%s_%s.webm", uqroom_in, ke_in)

	return fn
}

func getPtFi(fn_in string) string {
	env := common.Env(true)

	pt := fmt.Sprintf("%s/%s", env.RecFolder, fn_in)

	return pt
}

func WsVi(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	uqroom := ps.ByName("uqroom")
	ke := ps.ByName("ke")

	fn := getFi(uqroom, ke)
	pt := getPtFi(fn)

	f, err := os.Open(pt)
	if err != nil {
		applog.Danger("Vi opening file", err)
		return
	}

	defer func() {
		err := f.Close()
		if err != nil {
			applog.Danger("Vi closing file", err)
		}
	}()

	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", fn))
	w.Header().Set("Content-Type", "application/octet-stream")
	w.WriteHeader(http.StatusOK)

	_, err = io.Copy(w, f)
	if err != nil {
		applog.Danger("Vi copying file", err)
	}
}

func WsViRem(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	w.Header().Set("Content-Type", "application/json")

	re := common.GetWsReq(r)

	fn := getFi(re.UqRoom, re.Ke)

	ans := common.AjaAns{
		Res: false,
	}

	output, _ := json.Marshal(ans)

	if fn != re.Fi {
		applog.Danger("Rem file", "Filenames not the same")

		w.Write(output)

		return
	}

	pt := getPtFi(fn)

	err := os.Remove(pt)
	if err != nil {
		applog.Danger("Removing file", err)
	}

	ans.Res = true
	output, _ = json.Marshal(ans)

	w.Write(output)
}
