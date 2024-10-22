package controllers

import (
	"bytes"
	"fmt"
	"html/template"
	"net/http"
	"opaweb/applog"
)

func getSiteTemplates(filenames []string, fm template.FuncMap) (tmpl *template.Template) {
	var files []string

	for _, file := range filenames {
		files = append(files, fmt.Sprintf("templates/site/%s.html", file))
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
	}

	return
}

func GenerateHTMLEmp(writer http.ResponseWriter, data interface{}, filenames []string) {
	funcMap := getFm()

	filenames = append(filenames, "layout_emp")

	getSiteTemplates(filenames, funcMap).ExecuteTemplate(writer, "layout_emp", data)
}

func GetHTMLAjax(data interface{}, filenames []string) string {
	funcMap := getFm()

	filenames = append(filenames, "layout_ajax")

	t := getSiteTemplates(filenames, funcMap)

	var buf bytes.Buffer

	if err := t.ExecuteTemplate(&buf, "layout_ajax", data); err != nil {
		applog.Danger("GenerateHTMLAjax", err)
	}

	return buf.String()
}
