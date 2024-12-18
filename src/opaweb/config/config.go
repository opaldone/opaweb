package config

import (
	"encoding/json"
	"os"

	"opaweb/applog"
	"opaweb/common"
)

type Configuration struct {
	Appname   string              `json:"appname"`
	Debug     bool                `json:"debug"`
	Address   string              `json:"address"`
	Port      int                 `json:"port"`
	Acmehost  string              `json:"acmehost"`
	DirCache  string              `json:"dirCache"`
	RecFolder string              `json:"recFolder,omitempty"`
	Crt       string              `json:"crt,omitempty"`
	Key       string              `json:"key,omitempty"`
	Static    string              `json:"static"`
	Ws        *wsConfig           `json:"ws"`
	IceList   []map[string]string `json:"iceList"`
}

type wsConfig struct {
	WsUrl   string `json:"wsurl"`
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

func SetCsrf() {
	csrf_key = common.CreateUUID()
}

// Env returns config
func Env(reload bool) *Configuration {
	if reload {
		LoadConfig()
	}

	return config
}

func GetKeyCSRF() string {
	return csrf_key
}
