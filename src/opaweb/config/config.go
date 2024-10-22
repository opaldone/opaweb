package config

import (
	"encoding/json"
	"opaweb/applog"
	"os"
)

type Configuration struct {
	Appname      string    `json:"appname"`
	Debug        bool      `json:"debug"`
	Address      string    `json:"address"`
	Acmehost     string    `json:"acmehost"`
	DirCache     string    `json:"dirCache"`
	DirVid       string    `json:"dirVid"`
	Port         int       `json:"port"`
	Crt          string    `json:"crt,omitempty"`
	Key          string    `json:"key,omitempty"`
	ReadTimeout  int64     `json:"readTimeout"`
	WriteTimeout int64     `json:"writeTimeout"`
	IdleTimeout  int64     `json:"idleTimeout"`
	Static       string    `json:"static"`
	Ws           *wsConfig `json:"ws"`
}

type wsConfig struct {
	WsUrl   string              `json:"wsurl"`
	PerRoom int                 `json:"perroom"`
	IceList []map[string]string `json:"iceList"`
}

var config *Configuration

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
func Env() *Configuration {
	return config
}
