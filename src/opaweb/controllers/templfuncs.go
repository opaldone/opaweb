package controllers

import "strings"

func fletters(s string) string {
	var bld strings.Builder
	words := strings.Fields(s)

	for _, word := range words {
		runes := []rune(word)
		if len(runes) > 0 {
			bld.WriteRune(runes[0])
		}
	}

	return bld.String()
}
