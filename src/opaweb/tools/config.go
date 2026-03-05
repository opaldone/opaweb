package tools

import (
	"encoding/json"
	"os"
	"os/exec"

	"opaweb/applog"
)

type Configuration struct {
	Appname  string              `json:"appname"`
	Address  string              `json:"address"`
	Port     int                 `json:"port"`
	Static   string              `json:"static"`
	Acme     bool                `json:"acme"`
	Acmehost []string            `json:"acmehost"`
	DirCache string              `json:"dirCache"`
	Crt      string              `json:"crt,omitempty"`
	Key      string              `json:"key,omitempty"`
	Lang     string              `json:"lang"`
	Ws       *wsConfig           `json:"ws"`
	IceList  []map[string]string `json:"iceList"`
	Recserv  bool                `json:"recserv"`
	Recorder *ConfRecorder       `json:"recorder,omitempty"`
}

type ConfRecorder struct {
	URLVirt  string `json:"urlVirt"`
	SoundLib string `json:"soundLib"`
	IHw      string `json:"iHw"`
	ScrRes   string `json:"scrRes"`
	LogLevel string `json:"logLevel"`
	Timeout  int    `json:"timeout"`
}

type wsConfig struct {
	URL     string `json:"url"`
	Port    int    `json:"port"`
	PerRoom int    `json:"perroom"`
}

var (
	config  *Configuration
	csrfKey string
)

func checkRecProgramsExist() {
	mp := map[string]int{
		"Xvfb":          1,
		"google-chrome": 1,
		"ffmpeg":        1,
	}

	sum := 0
	val := 0
	for prg, v := range mp {
		sum += v

		_, err := exec.LookPath(prg)
		if err != nil {
			continue
		}

		val += v
	}

	config.Recserv = (sum == val)
}

// LoadConfig loads config
func LoadConfig() {
	file, err := os.Open("config.json")
	if err != nil {
		applog.Danger("Cannot open config file", err)
	}
	defer file.Close()

	decoder := json.NewDecoder(file)
	config = &Configuration{}
	err = decoder.Decode(config)
	if err != nil {
		applog.Danger("Cannot get configuration from file", err)
		return
	}

	checkRecProgramsExist()
}

// Env returns config
func Env(reload bool) *Configuration {
	if reload {
		LoadConfig()
	}

	return config
}

func SetCsrf() {
	csrfKey = CreateUID()
}

func GetKeyCSRF() string {
	return csrfKey
}
