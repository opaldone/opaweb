// Package serv
package serv

import (
	"crypto/tls"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"slices"
	"sort"
	"strconv"
	"sync"
	"syscall"
	"time"

	"opaweb/applog"
	"opaweb/tools"

	"github.com/gorilla/websocket"
)

const (
	fRoot            = "./envir/rec"
	fAru             = "aru"
	fRooms           = "rooms"
	fPrcs            = "prcs"
	fVid             = "vid"
	fLogs            = "logs"
	monitorProcSteps = 10
	monitorLeaveSec  = 20
)

type OsaType struct {
	Pxv  int `json:"pxv,omitempty"`
	Pff  int `json:"pff,omitempty"`
	Pgoo int `json:"pgoo,omitempty"`
}

type RevisFile struct {
	Dt       string
	Tm       string
	Sz       string
	Filename string
	Link     string
}

type KeysRevisFile struct {
	Keys []string
	Mapa map[string][]RevisFile
}

var (
	roomsTiming map[string]time.Time
	mtx         sync.RWMutex
)

func deleteRoom(roomid string) {
	mtx.Lock()
	defer mtx.Unlock()

	delete(roomsTiming, roomid)
}

func isRunningProc(pid int) bool {
	proc, _ := os.FindProcess(pid)

	err := proc.Signal(syscall.Signal(0))

	return err == nil
}

func fexists(pa string) bool {
	_, err := os.Stat(pa)
	return !errors.Is(err, os.ErrNotExist)
}

func mkfolder(reFolder string, folder string) {
	pa := folder
	if len(reFolder) > 0 {
		pa = fmt.Sprintf("%s/%s", reFolder, folder)
	}

	if !fexists(pa) {
		err := os.Mkdir(pa, os.ModePerm)
		if err != nil {
			applog.Danger("mkfolder", err)
		}
	}
}

func createEmptyFile(pa string) {
	fl, err := os.Create(pa)
	if err != nil {
		applog.Danger("createEmptyFile", err)
	}
	defer fl.Close()
}

func getRoomFolder(roomid string) string {
	return fmt.Sprintf("%s/%s/%s", fRoot, fRooms, roomid)
}

func checkFolders(roomid string) {
	roomFolder := getRoomFolder(roomid)

	mkfolder(fRoot, fRooms)
	mkfolder("", roomFolder)
	mkfolder(roomFolder, fPrcs)
	mkfolder(roomFolder, fLogs)
	mkfolder(roomFolder, fVid)
}

func jsonProcesses(roomid string) string {
	return fmt.Sprintf("%s/%s/pr.json", getRoomFolder(roomid), fPrcs)
}

func getOsa(roomid string) *OsaType {
	jsfile := jsonProcesses(roomid)

	if !fexists(jsfile) {
		return nil
	}

	osjson, err := os.Open(jsfile)
	if err != nil {
		return nil
	}
	defer osjson.Close()

	decoder := json.NewDecoder(osjson)
	ous := &OsaType{}
	err = decoder.Decode(ous)
	if err != nil {
		return nil
	}

	return ous
}

func callbash(bashin string, args ...string) {
	runner := fmt.Sprintf("%s/%s/%s", fRoot, fAru, bashin)

	cmd := exec.Command(runner, args...)

	go func() {
		defer cmd.Wait()
		err := cmd.Start()
		if err != nil {
			applog.Danger(fmt.Sprintf("callbash %s", bashin), err)
		}
	}()
}

func monitorProc(roomid string) {
	ticker := time.NewTicker(3 * time.Second)
	defer ticker.Stop()

	osain := getOsa(roomid)
	pids := []int{}
	steps := 0

	for range ticker.C {
		if osain != nil && len(pids) == 0 {
			pids = append(pids, osain.Pxv)
			pids = append(pids, osain.Pff)
			pids = append(pids, osain.Pgoo)
		}

		if osain == nil {
			steps++
			osain = getOsa(roomid)
		}

		if osain == nil && steps >= monitorProcSteps {
			StopRec(roomid)
			return
		}

		if len(pids) == 0 {
			continue
		}

		for _, pid := range pids {
			if isRunningProc(pid) {
				continue
			}

			StopRec(roomid)
			return
		}
	}
}

func monitorLeave(roomid string) {
	ticker := time.NewTicker(3 * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		mtx.RLock()
		old, ok := roomsTiming[roomid]
		mtx.RUnlock()

		if !ok {
			StopRec(roomid)
			return
		}

		now := time.Now()
		dur := now.Sub(old).Round(time.Second).Abs().Seconds()

		if dur >= monitorLeaveSec {
			StopRec(roomid)
			return
		}
	}
}

func sendStopMessage(roomid string) {
	e := tools.Env(false)
	wsURL := fmt.Sprintf("wss://%s:%d/wserec/%s", e.Ws.URL, e.Ws.Port, roomid)

	dialer := websocket.Dialer{
		TLSClientConfig: &tls.Config{
			InsecureSkipVerify: true,
		},
	}

	conn, _, err := dialer.Dial(wsURL, nil)
	if err != nil {
		applog.Danger("dialer.Dial", err)
	}
	defer conn.Close()
}

func StopRec(roomid string) {
	sendStopMessage(roomid)
	deleteRoom(roomid)

	osa := getOsa(roomid)

	if osa != nil {
		callbash("k_s",
			strconv.Itoa(osa.Pgoo),
			strconv.Itoa(osa.Pff),
			strconv.Itoa(osa.Pxv),
		)
	}

	jsonfile := jsonProcesses(roomid)
	if fexists(jsonfile) {
		err := os.Remove(jsonfile)
		if err != nil {
			applog.Danger("StopRec removing file", err)
		}
	}
}

func UpdateRoomTiming(roomid string) {
	if roomsTiming == nil {
		return
	}

	mtx.Lock()
	defer mtx.Unlock()

	roomsTiming[roomid] = time.Now()
}

func StartRec(roomid string) {
	jsfile := jsonProcesses(roomid)

	if fexists(jsfile) {
		StopRec(roomid)
		return
	}

	checkFolders(roomid)
	createEmptyFile(jsfile)

	if roomsTiming == nil {
		roomsTiming = make(map[string]time.Time)
	}

	UpdateRoomTiming(roomid)

	e := tools.Env(false)

	if e.Recorder == nil {
		applog.Danger("Recorder", "config of Recorder is not set")
		return
	}

	roomFolder := getRoomFolder(roomid)

	callbash("s_s",
		roomid,
		roomFolder,
		jsfile,
		e.Recorder.URLVirt,
		e.Recorder.SoundLib,
		e.Recorder.IHw,
		e.Recorder.ScrRes,
		e.Recorder.LogLevel,
		strconv.Itoa(e.Recorder.Timeout),
	)

	go monitorProc(roomid)
	go monitorLeave(roomid)
}

func GetVidsFromRoom(roomid string) *KeysRevisFile {
	vidFolder := fmt.Sprintf("%s/%s", getRoomFolder(roomid), fVid)

	files, err := os.ReadDir(vidFolder)
	if err != nil {
		return nil
	}

	if len(files) == 0 {
		return nil
	}

	sort.Slice(files, func(i, j int) bool {
		fi, _ := files[i].Info()
		fj, _ := files[j].Info()
		return fi.ModTime().After(fj.ModTime())
	})

	keys := []string{}
	mapa := make(map[string][]RevisFile)

	for _, f := range files {
		filename := f.Name()
		info, _ := f.Info()
		mt := info.ModTime()
		dt := mt.Format("2006-01-02")
		tm := mt.Format("15:04")
		link := fmt.Sprintf("/revis/%s/vid/%s", roomid, filename)
		sz := fmt.Sprintf("%.1f MB",
			float64(info.Size())/(1024.0*1024.0),
		)

		if !slices.Contains(keys, dt) {
			keys = append(keys, dt)
		}

		item := RevisFile{
			Dt:       dt,
			Tm:       tm,
			Sz:       sz,
			Filename: filename,
			Link:     link,
		}

		_, ok := mapa[dt]
		if !ok {
			mapa[dt] = []RevisFile{}
		}
		mapa[dt] = append(mapa[dt], item)
	}

	ret := KeysRevisFile{
		Keys: keys,
		Mapa: mapa,
	}

	return &ret
}

func DeleteVideo(roomid string, filename string) bool {
	roomFolder := getRoomFolder(roomid)
	pa := fmt.Sprintf("%s/%s/%s", roomFolder, fVid, filename)

	if !fexists(pa) {
		return false
	}

	err := os.Remove(pa)

	return err == nil
}
