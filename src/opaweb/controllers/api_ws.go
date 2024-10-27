package controllers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"opaweb/apitools"
	"opaweb/applog"
	"opaweb/common"
	"opaweb/config"
	"os"

	"github.com/gorilla/csrf"
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
	WsUrl   string              `json:"wsurl,omitempty"`
	UqRoom  string              `json:"uqroom,omitempty"`
	UqUser  string              `json:"uquser,omitempty"`
	PerRoom int                 `json:"perroom,omitempty"`
	Nik     string              `json:"nik,omitempty"`
	Mic     bool                `json:"mic"`
	Cam     bool                `json:"cam"`
	Virt    bool                `json:"virt"`
	IceList []map[string]string `json:"iceList"`
}

type AjaAns struct {
	Res  bool        `json:"res"`
	Sets *WsSettings `json:"sets,omitempty"`
	Cont string      `json:"cont,omitempty"`
}

func WSChat(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	data := map[string]interface{}{
		csrf.TemplateTag: csrf.TemplateField(r),
	}

	GenerateHTMLEmp(w, data, []string{"wschat/ix"})
}

func WsMeet(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	uqroom := common.CreateUUID()
	http.Redirect(w, r, ro("ws_me_get", uqroom), http.StatusSeeOther)
}

func WsMeetGet(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	uqroom := ps.ByName("uqroom")

	data := map[string]interface{}{
		csrf.TemplateTag: csrf.TemplateField(r),
		"uqroom":         uqroom,
		"camic":          map[string]bool{"mic": true, "cam": true, "tophint": true},
	}

	GenerateHTMLEmp(w, data, []string{"wschat/st_meet", "wschat/camic"})
}

func WsMeetStart(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	w.Header().Set("Content-Type", "application/json")

	var re WsRequest
	apitools.FormToJSON(r.Body, &re)

	env := config.Env()
	conf := env.Ws
	s := WsSettings{}

	s.UqRoom = re.UqRoom
	s.UqUser = common.CreateUUID()
	s.PerRoom = conf.PerRoom
	s.Nik = re.Nik
	s.Mic = re.Mic
	s.Cam = re.Cam
	s.Virt = false
	s.WsUrl = fmt.Sprintf("%s/ws/%s/%s/%d?nik=%s",
		conf.WsUrl,
		s.UqRoom,
		s.UqUser,
		s.PerRoom,
		s.Nik,
	)
	s.IceList = conf.IceList

	data := map[string]interface{}{
		"sets":  s,
		"camic": map[string]bool{"mic": re.Mic, "cam": re.Cam, "tophint": false},
		"debug": env.Debug,
	}

	co := GetHTMLAjax(data, []string{"wschat/sta", "wschat/camic"})

	ans := AjaAns{
		Res:  true,
		Sets: &s,
		Cont: co,
	}

	output, _ := json.Marshal(ans)

	w.Write(output)
}

func WsVirt(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	uqroom := ps.ByName("uqroom")
	ke := ps.ByName("ke")

	conf := config.Env().Ws
	s := WsSettings{}

	s.UqRoom = uqroom
	s.UqUser = common.CreateUUID()
	s.PerRoom = conf.PerRoom
	s.Nik = "virt"
	s.Mic = false
	s.Cam = false
	s.Virt = true
	s.WsUrl = fmt.Sprintf("%s/ws/%s/%s/%d?nik=%s&ke=%s",
		conf.WsUrl,
		s.UqRoom,
		s.UqUser,
		s.PerRoom,
		s.Nik,
		ke,
	)
	s.IceList = conf.IceList

	ob, _ := json.Marshal(s)

	data := map[string]interface{}{
		"ob": string(ob),
	}

	GenerateHTMLEmp(w, data, []string{"wschat/virt"})
}

func getFi(uqroom_in, ke_in string) string {
	fn := fmt.Sprintf("vi_%s_%s.webm", uqroom_in, ke_in)

	return fn
}

func getPtFi(fn_in string) string {
	pt := fmt.Sprintf("%s/%s", config.Env().DirVid, fn_in)

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

	var re WsRequest
	apitools.FormToJSON(r.Body, &re)

	fn := getFi(re.UqRoom, re.Ke)

	ans := AjaAns{
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
