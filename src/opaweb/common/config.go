package common

import (
	"encoding/json"
	"os"

	"opaweb/applog"
)

type Configuration struct {
	Appname   string              `json:"appname"`
	Address   string              `json:"address"`
	Port      int                 `json:"port"`
	Static    string              `json:"static"`
	Acme      bool                `json:"acme"`
	Acmehost  []string            `json:"acmehost"`
	DirCache  string              `json:"dirCache"`
	Crt       string              `json:"crt,omitempty"`
	Key       string              `json:"key,omitempty"`
	RecFolder string              `json:"recFolder,omitempty"`
	Lang      string              `json:"lang"`
	Ws        *wsConfig           `json:"ws"`
	IceList   []map[string]string `json:"iceList"`
}

type wsConfig struct {
	WsURL   string `json:"wsurl"`
	PerRoom int    `json:"perroom"`
}

var (
	config   *Configuration
	csrf_key string
)

// LoadConfig loads config
func LoadConfig() {
	file, err := os.Open("config.json")
	if err != nil {
		applog.Danger("Cannot open config file", err)
	}

	decoder := json.NewDecoder(file)
	config = &Configuration{}
	err = decoder.Decode(config)
	if err != nil {
		applog.Danger("Cannot get configuration from file", err)
	}
}

// Env returns config
func Env(reload bool) *Configuration {
	if reload {
		LoadConfig()
	}

	return config
}

func SetCsrf() {
	csrf_key = CreateUID()
}

func GetKeyCSRF() string {
	return csrf_key
}
