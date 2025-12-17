# Makefile for go_ipc_server
#
# Build targets (Node.js platform/arch naming):
#   - macOS
#       - macos-x64 : darwin / x64  (Intel Mac)
#       - macos-arm64 : darwin / arm64  (Apple Silicon, M1/M2/M3)
#
#   - Linux
#       - linux-x64 : linux / x64
#       - linux-arm64 : linux / arm64
#       - linux-arm : linux / arm (armv7l, GOARM=7)
#
#   - Windows
#       - win-x64     : win32 / x64
#       - win-arm64   : win32 / arm64
#       - win-ia32    : win32 / ia32
#
#   - All:
#       - all         : macos + linux-all + win
#
#   - Clean:
#       - clean       : remove build artifacts

BINARY = go_ipc_server
SRC    = go_ipc_server.go

.PHONY: \
	all \
	macos macos-x64 macos-arm64 \
	linux linux-all linux-x64 linux-arm64 linux-arm \
	win win-x64 win-ia32 \
	clean


all: macos linux-all win


# --- macOS ---
macos: macos-x64 macos-arm64

macos-x64:
	GOOS=darwin GOARCH=amd64 go build -o $(BINARY)_darwin_x64 $(SRC)

macos-arm64:
	GOOS=darwin GOARCH=arm64 go build -o $(BINARY)_darwin_arm64 $(SRC)


# --- Linux ---
linux: linux-all

linux-all: linux-x64 linux-arm64 linux-arm

linux-x64:
	GOOS=linux GOARCH=amd64 go build -o $(BINARY)_linux_x64 $(SRC)

linux-arm64:
	GOOS=linux GOARCH=arm64 go build -o $(BINARY)_linux_arm64 $(SRC)

linux-arm:
	GOOS=linux GOARCH=arm GOARM=7 go build -o $(BINARY)_linux_arm $(SRC)


# --- Windows ---
win: win-x64 win-arm64 win-ia32

win-x64:
	GOOS=windows GOARCH=amd64 go build -o $(BINARY)_win32_x64.exe $(SRC)

win-ia32:
	GOOS=windows GOARCH=386 go build -o $(BINARY)_win32_ia32.exe $(SRC)

win-arm64:
	GOOS=windows GOARCH=arm64 go build -o $(BINARY)_win32_arm64.exe $(SRC)

# --- Clean ---
clean:
	rm -f \
		$(BINARY)_darwin_x64 \
		$(BINARY)_darwin_arm64 \
		$(BINARY)_linux_x64 \
		$(BINARY)_linux_arm64 \
		$(BINARY)_linux_arm \
		$(BINARY)_win32_x64.exe \
		$(BINARY)_win32_arm64.exe \
		$(BINARY)_win32_ia32.exe
