<h1 align="center">
  <img src="./lo.svg" alt="Opaweb">
  <br />
  Opaweb
  <br />
</h1>
<h4 align="center">
A web server for video and audio conferencing that acts as a client for <a href="https://github.com/opaldone/opachat">opachat</a>. It supports chat session recording on both the server and client sides
</h4>
<p align="center">
<img src="https://img.shields.io/badge/opaldone-opaweb-gray.svg?longCache=true&colorB=brightgreen" alt="Opaweb" />
<a href="https://sourcegraph.com/github.com/opaldone/opaweb?badge">
  <img src="https://sourcegraph.com/github.com/opaldone/opaweb/-/badge.svg" alt="Sourcegraph Widget" />
</a>
</p>
<br />

<h3>
Built with these excellent libraries
<img src="https://go.dev/blog/go-brand/Go-Logo/SVG/Go-Logo_Blue.svg" height="45px" vertical-align="middle" />
</h3>

* [gorilla-csrf](https://github.com/gorilla/csrf)
* [gorilla-websocket](https://github.com/gorilla/websocket)
* [julienschmidt-httprouter](https://github.com/julienschmidt/httprouter)
* [acme-autocert](https://pkg.go.dev/golang.org/x/crypto/acme/autocert)

_It doesn't depend on any JavaScript or CSS frameworks; it uses only vanilla JavaScript and pure CSS._
<h1></h1>

### How to install and compile
##### Clonning
```bash
git clone https://github.com/opaldone/opaweb.git
```
##### Go to the root "opaweb" directory
```bash
cd opaweb
```
##### Set your GOPATH to the "opaweb" directory to keep your global GOPATH clean
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
> E_FOLDERS - the array of creating empty folders \
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
### About config
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
    "opaldone.su",
    "206.189.101.23",
    "www.opaldone.su"
  ],

  // The folder where acme/autocert will store the keys, set "acme": true
  "dirCache": "./certs",

  // The paths to your self-signed HTTPS keys, set "acme": false
  "crt": "/server.crt",
  "key": "/server.key",

  // Language of the site
  "lang": "en",

  // Settings for opachat - websocket
  "ws": {
    // URL of the opachat server
    "wsurl": "opaldone.su",
    // Port
    "port": 8080,
    // How many persons can be in one room
    "perroom": 100
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
  ],

  // The parameters for the chat session recording
  "recorder": {
    // Example https://opaldone.su/virt
    "urlVirt": "https://YOUR_URL/virt",
    // Sound library for ffmpeg. We recommend using the pulse
    "soundLib": "pulse",
    // The ID of the output audio stream
    "iHw": "0",
    // Screen resolution of the recod
    "scrRes": "1080x720",
    // The level of the logging from ffmpeg can be info, error or other
    "logLevel": "error",
    // How long should the session recordings be (in seconds)
    "timeout": 120
  }
}
```

### Server-side recording settings

##### Ffmpeg with X11 capture support
```bash
sudo apt update
sudo apt install ffmpeg -y
```
##### Xvfb
It allows you to execute graphical apps without having to use a monitor by connecting some input device. Virtual memory is used to perform graphical operations and it allows the program to run headlessly.
```bash
sudo apt update
sudo apt install xvfb
```
##### Pulseaudio
```bash
sudo apt update
sudo apt install pulseaudio
```
##### Google Chrome stable
```bash
sudo su -l
apt-get -y install wget curl gnupg jq unzip

curl -fsSL https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/google-chrome-keyring.gpg
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-chrome-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" | tee /etc/apt/sources.list.d/google-chrome.list

apt-get -y update
apt-get -y install google-chrome-stable
```
Add chrome managed policies file and set
`CommandLineFlagSecurityWarningsEnabled` to `false`. It will hide warnings in
Chrome. You can set it like so:
```bash
mkdir -p /etc/opt/chrome/policies/managed
echo '{ "CommandLineFlagSecurityWarningsEnabled": false }' >>/etc/opt/chrome/policies/managed/managed_policies.json
```

### License
MIT License - see [LICENSE](LICENSE) for full text
