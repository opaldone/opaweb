package applog

import (
	"fmt"
	"os"
)

// Danger put a error message
func Danger(step string, args ...interface{}) {
	fmt.Fprintf(os.Stderr, "[%s] ", step)
	fmt.Fprintln(os.Stderr, args...)
}
