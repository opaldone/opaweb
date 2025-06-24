package controllers

import (
	"bytes"
	"fmt"
	"html/template"
	"net/http"

	"opaweb/applog"
	"opaweb/common"
	"opaweb/lang"

	"github.com/gorilla/csrf"
)

func getSiteTemplates(filenames []string, fm template.FuncMap) (tmpl *template.Template) {
	var files []string

	for _, file := range filenames {
		files = append(files, fmt.Sprintf("templates/%s.html", file))
	}

	if fm == nil {
		tmpl = template.Must(template.New("").ParseFiles(files...))
		return
	}

	tmpl = template.Must(template.New("").Funcs(fm).ParseFiles(files...))

	return
}

func getFm() (fm template.FuncMap) {
	fm = template.FuncMap{
		"attr": func(s string) template.HTMLAttr {
			return template.HTMLAttr(s)
		},
		"safe": func(s string) template.HTML {
			return template.HTML(s)
		},
		"ro": ro,
		"dd": func(v interface{}) template.HTML {
			return template.HTML(
				common.ShowJson(v, false),
			)
		},
		"re": lang.Re,
	}

	return
}

func GenerateHTMLEmp(w http.ResponseWriter, r *http.Request, info interface{}, pages ...string) {
	funcMap := getFm()

	data := map[string]interface{}{
		csrf.TemplateTag: csrf.TemplateField(r),
	}

	if info != nil {
		data["info"] = info
	}

	data["lang"] = common.Env(false).Lang
	data["stat"] = common.Env(false).Static
	data["needtra"] = 0
	if lang.NeedTra() {
		data["needtra"] = 1
	}

	list_pages := []string{
		"lays/layout",
	}

	list_pages = append(list_pages, pages...)

	getSiteTemplates(list_pages, funcMap).ExecuteTemplate(w, "layout", data)
}

func GetHTMLAjax(data interface{}, pages ...string) string {
	funcMap := getFm()

	list_pages := []string{
		"lays/layout_ajax",
	}

	list_pages = append(list_pages, pages...)

	t := getSiteTemplates(list_pages, funcMap)

	var buf bytes.Buffer

	if err := t.ExecuteTemplate(&buf, "layout_ajax", data); err != nil {
		applog.Danger("GenerateHTMLAjax", err)
	}

	return buf.String()
}
