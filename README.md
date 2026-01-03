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
> The "u" script reads sub file "watch_files" \
> C_FOLDERS - the array of folders to simple copy \
> W_FILES - the array of files whose changes are tracked
```bash
./watch_files
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
  // Just a name of application
  "appname": "opaweb",
  // IP address of the server, zeros mean current host
  "address": "0.0.0.0",
  // Port, don't forget to open for firewall
  "port": 443,
  // The folder that stores the frontend part of the site
  "static": "static",
  // Set "acme": true if You need to use acme/autocert
  // false - if You use self-signed certificates
  "acme": false,
  // The array of domain names, set "acme": true
  "acmehost": [
    "opaldone.click",
    "206.189.101.23",
    "www.opaldone.click"
  ],
  // The folder where acme/autocert will store the keys, set "acme": true
  "dirCache": "./certs",
  // The paths to your self-signed HTTPS keys, set "acme": false
  "crt": "/server.crt",
  "key": "/server.key",
  // Folder for temporary copying of the recorded session
  "recFolder": "/mnt/terik/a_my/admigo_project/opachat/bin/vid",
  // Language of the site
  "lang": "en",
  "ws": {
    // URL of the opachat server
    "wsurl": "wss://opaldone.click:8080",
    // How many persons can be in one room
    "perroom": 100 // How many persons can be in one room
  },
  // array of STUN or TURN servers for web rtc connection
  "iceList": [
    {
      // Example turn:192.177.0.555:3478
      "urls": "turn:[some ip]:[some port]",
      // The login for turn server if exists
      "username": "login",
      // The password for turn server
      "credential": "password"
    }
  ]
}
```
