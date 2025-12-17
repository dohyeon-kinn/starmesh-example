## JSON-RPC Architecture

This project handles communication between Electron's Main process and a Go binary-based Child process using the JSON-RPC 2.0 specification. The Renderer process can handle asynchronous requests (Request/Response) and notifications through `window.api`.

### Architecture

The communication flow is as follows:
1. **Renderer Process (React)**: Calls APIs through `window.api`
2. **Preload Script (preload.ts)**: Safely exposes APIs via `contextBridge` and communicates with Main Process using `ipcRenderer`
3. **Main Process (main/index.ts)**: Handles IPC events with `ipcMain` and manages Go process with `ChildProcessManager`
4. **Go IPC Server**: Exchanges JSON-RPC messages via stdin/stdout

### Request/Response (Asynchronous Request-Response)

Requests are processed asynchronously and return a Promise. Each request has a unique ID and waits for a response.

**How it works:**
- When a method like `window.api.vpnOn()` is called from the Renderer, it returns a Promise
- The Preload script uses `ipcRenderer.invoke()` to forward the request to the Main Process
- The Main Process's `ipcMain.handle()` receives the request and calls `ChildProcessManager.request()`
- `ChildProcessManager` generates a unique ID using a timestamp and counter, then sends the JSON-RPC request to the Go process via stdin
- When the Go process sends a response via stdout, `ChildProcessManager` matches the ID and resolves the pending Promise

**Error handling:**
- If the response contains an `error` field, it can be checked via `response.error`
- If a request timeout occurs (default 10 seconds) or the process terminates, the Promise is rejected
- When the process terminates, all pending requests are automatically cancelled

**Type definitions:**
- `RpcRequest`: Contains `jsonrpc`, `id`, `method`, and `params` fields
- `RpcResponse`: Contains `jsonrpc`, `id`, and either `result` or `error` fields
- All types are defined in `main/rpc.ts`

### Notification (Event Listener)

Notifications are one-way messages sent from the server to the client. Unlike Requests, they have no ID and are handled through event listeners.

**How it works:**
- When the Go process sends a Notification via stdout, `ChildProcessManager` distinguishes it from a Response by checking for the presence of an `id` field
- Notifications are passed to the Main Process through the `onNotification` callback
- The Main Process sends IPC events to the Renderer process using `webContents.send()`
- The Preload script's listener function receives events via `ipcRenderer.on()` and executes the callback
- Since a cleanup function is returned when registering a listener, React's `useEffect` can automatically remove the listener when the component unmounts

**Features:**
- One-way communication: Only sent from server → client
- Event-based: Multiple listeners can be registered
- Automatic cleanup: A cleanup function is returned when registering a listener to prevent memory leaks
- Real-time updates: Can receive notifications immediately when state changes

**Type definitions:**
- `RpcNotification`: Contains `jsonrpc`, `method`, and `params` fields, but no `id`
- The `NotificationMethod` type restricts available notification methods

### Type Definition File (types/index.d.ts)

`renderer/types/index.d.ts` defines the types for `window.api` in the Renderer process. It allows TypeScript to recognize the types of APIs exposed by the Preload script via `contextBridge.exposeInMainWorld()`.

**Role:**
- Declares `window.api` types globally to provide TypeScript type checking and autocomplete
- Ensures type consistency between Preload script and Renderer process
- Enables autocomplete and type checking when using `window.api` in the IDE

**Usage:**
- When adding a new method in Preload, the same type must be added to the `Window` interface in `types/index.d.ts`
- This ensures type safety when using `window.api` in the Renderer

### Adding New Methods

#### Adding a Request Method

1. **`main/rpc.ts`**: Add the new method name to the `RpcRequestMethod` type
2. **`main/preload.ts`**: Add the new method to `contextBridge.exposeInMainWorld('api', {...})`, call Main Process with `ipcRenderer.invoke()`
3. **`main/index.ts`**: Register IPC event handler with `ipcMain.handle()`, call `childProcess.request()`
4. **`renderer/types/index.d.ts`**: Add the new method type to the `api` property in the `Window` interface

#### Adding a Notification Method

1. **`main/rpc.ts`**: Add the new notification method name to the `NotificationMethod` type
2. **`main/preload.ts`**: Add a listener function, receive events with `ipcRenderer.on()`, return a cleanup function
3. **`main/index.ts`**: Add a new case to the `onNotification` callback's switch statement, send to Renderer with `webContents.send()`
4. **`renderer/types/index.d.ts`**: Add the new listener method type to the `api` property in the `Window` interface

<br><br><br>

## Build

### 0. Prerequisites
Install Go (required for building the Go IPC server):
```bash
brew install go
```

### 1. Go IPC Server Build
Build the Go IPC server binary:
```bash
cd resources
make all
```

To build for specific platforms:
- macOS: `make macos` or `make macos-x64`, `make macos-arm64`
- Linux: `make linux-all` or `make linux-x64`, `make linux-arm64`, `make linux-arm`
- Windows: `make win` or `make win-x64`, `make win-arm64`, `make win-ia32`

### 2. Package
Package the Electron app:
```bash
yarn package
```

### 3. Make
Create distributable installer files:
```bash
yarn make
```

<br><br><br>

## Supported OS and Architectures

| GitHub Actions Runner | Architecture | Platform |
|----------------------|-------------|----------|
| `ubuntu-latest` + `x64` | x64 | Linux (x64) |
| `ubuntu-24.04-arm` + `armv7l` | armv7l | Linux (ARMv7l, 32bit ARM) |
| `ubuntu-24.04-arm` + `arm64` | arm64 | Linux (ARM64) |
| `macos-latest` + `arm64` | arm64 | macOS (Apple Silicon, ARM64) |
| `macos-15-intel` + `x64` | x64 | macOS (Intel, x64) |
| `windows-latest` + `x64` | x64 | Windows 10/11 (64bit, x64) |
| `windows-11-arm` + `arm64` | arm64 | Windows 11 on ARM (ARM64) |
| `windows-latest` + `ia32` | ia32 | Windows 10/11 (32bit, ia32) |

<br><br><br>

## Release Process

### Stable Release

Stable releases are created from branches with the format `v{version}`.

- Git branch name: `v0.0.1`, `v1.0.0`, etc.
- Git release(tag)  name: `v0.0.1`
- File name: `StarMesh-0.0.1-{arch}.{ext}`

### Beta Release

Beta releases are created from branches with the format `v{version}-beta.{betaVersion}`.

- Git branch name: `v0.0.1-beta.1`, `v0.0.1-beta.2`, etc.
- Git release(tag) name: `beta.1-v0.0.1`
- File name: `StarMesh-0.0.1-beta.1-{arch}.{ext}`

#### How to Create a Beta Release

1. Create a beta branch:
   ```bash
   git checkout -b v0.0.1-beta.1
   ```

2. Push the branch to automatically create a release:
   ```bash
   git push origin v0.0.1-beta.1
   ```

3. GitHub Actions will automatically:
   - Extract the base version (`0.0.1`) and beta version (`1`) from the branch name
   - Add `-beta.1` suffix to the file name
   - Use `beta-v0.0.1-beta.1` format for the tag name
   - Mark it as a Pre-release

### Environment Variables

- `PRE_RELEASE`: When set to `true`, the release is treated as a beta release
- `BETA_VERSION`: Beta version number (e.g., `1`, `2`)

These environment variables are automatically set by the GitHub Actions workflow.

<br><br><br>