# Opaweb
This is a Web Server for video and audio conferences and it is a client for the [opachat](https://github.com/opaldone/opachat). With the ability of recording a chat session, both on the server and on the client.

## It depends on these great packages
![@gorilla](https://avatars.githubusercontent.com/u/489566?s=15&v=4) https://github.com/gorilla/csrf \
![@gorilla](https://avatars.githubusercontent.com/u/489566?s=15&v=4) https://github.com/gorilla/websocket \
![@julienschmidt](https://avatars.githubusercontent.com/u/944947?s=15&v=4) https://github.com/julienschmidt/httprouter \
![@letsencrypt](https://avatars.githubusercontent.com/u/9289019?s=15&v=4) https://pkg.go.dev/golang.org/x/crypto/acme/autocert

## How to install and compile
##### Clonning
```bash
git clone https://github.com/opaldone/opaweb.git
```
##### Go to the root "opaweb" directory
```bash
cd opaweb
```
##### Set the GOPATH variable to the current directory "opaweb" to avoid cluttering the global GOPATH directory
```bash
export GOPATH=$(pwd)
```
##### Go to the source folder
```bash
cd src/opaweb
```
##### Installing the required Golang packages
```bash
go mod init
```
```bash
go mod tidy
```
##### Return to the "opaweb" root directory, You can see the "opaweb/pkg" folder that contains the required Golang packages
```bash
cd ../..
```
##### Compiling by the "r" bash script
> r - means "run", b - means "build"
```bash
./r b
```
##### Creating the required folders structure and copying the frontend part by the "u" bash script
> The "u" script is a watching script then for stopping press Ctrl+C \
> u - means "update"
```bash
./u
```
##### You can check the "opaweb/bin" folder. It should contain the necessary structure of folders and files
```bash
ls -lash --group-directories-first bin
```
##### Start the server
```bash
./r
```
## About config
The config file is located here __opaweb/bin/config.json__
```JavaScript
{
  "appname": "opaweb", // Just a name of application
  "address": "0.0.0.0", // IP address of the server, zeros mean current host
  "port": 443, // Port, don't forget to open for firewall
  "static": "static", // The folder that stores the frontend part of the site
  "acme": false, // Set to true if You need to use acme/autocert
  "acmehost": "opaldone.click", // The domain name, set acme: true
  "dirCache": "./certs", // The folder where acme/autocert will store the keys, set acme: true
  "crt": "/server.crt", // The path to your HTTPS cert key, set acme: false
  "key": "/server.key", // The path to your HTTPS key, set acme: false
  "recFolder": "/mnt/terik/a_my/admigo_project/opachat/bin/vid", // Folder for temporary copying of the recorded session
  "lang": "en", // Language of the site
  "ws": {
    "wsurl": "wss://opaldone.click:8080", // URL of the opachat server
    "perroom": 100 // How many persons can be in one room
  },
  "iceList": [ // Settings of WebRTC turn server
    {
      "urls": "turn:[some ip]:[some port]", // Example turn:192.177.0.555:3478
      "username": "login", // The login for turn server if exists
      "credential": "password" // The password for turn server
    }
  ]
}
```
