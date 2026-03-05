package controllers

import "strings"

func fletters(s string) string {
	var bld strings.Builder

	for word := range strings.FieldsSeq(s) {
		runes := []rune(word)
		if len(runes) > 0 {
			bld.WriteRune(runes[0])
		}
	}

	return bld.String()
}
