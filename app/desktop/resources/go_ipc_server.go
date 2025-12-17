package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"os"
	"sync"
	"time"
)

// JSON-RPC 2.0 request / response / notification 포맷 정의

type rpcRequest struct {
	JSONRPC string          `json:"jsonrpc"`
	ID      json.RawMessage `json:"id,omitempty"`    // 생략되면 notification
	Method  string          `json:"method"`
	Params  json.RawMessage `json:"params,omitempty"`
}

type rpcError struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

// JSON-RPC 2.0 response: result / error 중 하나만 사용, method 필드 없음
type rpcResponse struct {
	JSONRPC string          `json:"jsonrpc"`
	ID      json.RawMessage `json:"id"`              // response 는 항상 id 필수 (null 포함)
	Result  interface{}     `json:"result,omitempty"`
	Error   *rpcError       `json:"error,omitempty"`
}

// JSON-RPC notification: id 없는 request 형태
type rpcNotification struct {
	JSONRPC string      `json:"jsonrpc"`
	Method  string      `json:"method"`
	Params  interface{} `json:"params,omitempty"`
}

type vpnStatusPayload struct {
	Status    bool   `json:"status"`
	Timestamp int64  `json:"timestamp"`
}

// VPN 상태를 관리하는 전역 변수 (시뮬레이션용)
var (
	vpnEnabled bool
	vpnMu      sync.RWMutex
)

const jsonRPCVersion = "2.0"

func setVPN(enabled bool) {
	vpnMu.Lock()
	defer vpnMu.Unlock()
	vpnEnabled = enabled
}

func getVPN() bool {
	vpnMu.RLock()
	defer vpnMu.RUnlock()
	return vpnEnabled
}

func makeVPNStatus() vpnStatusPayload {
	return vpnStatusPayload{
		Status:    getVPN(),
		Timestamp: time.Now().UnixMilli(),
	}
}

// 3초마다 상태 Notification 전송
func startStatusStream() {
	ticker := time.NewTicker(3 * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		sendNotification("vpn_status", makeVPNStatus())
	}
}

// stdin JSON-RPC Request/Notification 처리
func startCommandListener() {
	scanner := bufio.NewScanner(os.Stdin)
	// 최대 1MB 까지 허용
	scanner.Buffer(make([]byte, 0, 64*1024), 1024*1024)

	for scanner.Scan() {
		line := scanner.Bytes()

		var req rpcRequest
		if err := json.Unmarshal(line, &req); err != nil {
			// Parse error: 요청 id를 알 수 없으므로 id = null
			sendResponse(json.RawMessage("null"), nil, &rpcError{
				Code:    -32700,
				Message: "parse error",
				Data:    err.Error(),
			})
			continue
		}

		// 기본 유효성 검사
		if req.JSONRPC != jsonRPCVersion || req.Method == "" {
			// Invalid Request: id는 알 수 있으면 그대로, 없으면 null
			id := req.ID
			if len(id) == 0 {
				id = json.RawMessage("null")
			}
			sendResponse(id, nil, &rpcError{
				Code:    -32600,
				Message: "invalid request",
				Data:    "jsonrpc must be 2.0 and method is required",
			})
			continue
		}

		handleRequest(req)
	}

	if err := scanner.Err(); err != nil {
		fmt.Fprintf(os.Stderr, "stdin 읽기 오류: %v\n", err)
	}
}

// 메소드별 분기
func handleRequest(req rpcRequest) {
	switch req.Method {
	case "vpn_on":
		setVPN(true)
		payload := makeVPNStatus()
		sendResponse(req.ID, payload, nil)
		sendNotification("vpn_status", payload)

	case "vpn_off":
		setVPN(false)
		payload := makeVPNStatus()
		sendResponse(req.ID, payload, nil)
		sendNotification("vpn_status", payload)

	default:
		sendResponse(req.ID, nil, &rpcError{
			Code:    -32601,
			Message: "method not found",
			Data:    req.Method,
		})
	}
}

// JSON-RPC Response 전송
func sendResponse(id json.RawMessage, result interface{}, rpcErr *rpcError) {
	// id 가 비어 있으면 notification 이므로 응답을 보내지 않음
	if len(id) == 0 {
		return
	}

	resp := rpcResponse{
		JSONRPC: jsonRPCVersion,
		ID:      id,
		Result:  result,
		Error:   rpcErr,
	}
	writeLine(resp)
}

// JSON-RPC Notification 전송 (서버 -> 클라이언트)
func sendNotification(method string, payload interface{}) {
	notification := rpcNotification{
		JSONRPC: jsonRPCVersion,
		Method:  method,
		Params:  payload,
	}
	writeLine(notification)
}

// stdout 한 줄에 JSON 출력
func writeLine(v interface{}) {
	jsonBytes, err := json.Marshal(v)
	if err != nil {
		fmt.Fprintf(os.Stderr, "JSON 인코딩 오류: %v\n", err)
		return
	}
	fmt.Println(string(jsonBytes))
}

func main() {
	setVPN(true)
	go startStatusStream()
	startCommandListener()
}
