> A universal connection that allows Atlantis to connect to VSCode.

> Put this in your Atlantis `autoexec` folder
> Note; if you don't **always** want the websocket connection running, use the code below the first one, and add it to your `autoexec`.
> To call the function, do `AtlantisConnect()`.

```lua
local integrity = cloneref(game:GetService('HttpService')):GenerateGUID()
local string_format = string.format

shared.WebSocket = shared.WebSocket or {
    socket = nil,
    integrity = nil
}

shared.WebSocket.integrity = integrity

local function pcall_check(...)
    local success, data = pcall(...)

    if (not success) then
        rconsoleerr(string_format('[%s]: %s', 'SCRIPT ERROR', data))

        return false, data
    end

    return true, data
end

local function connect_to_ws()
    local old_socket = shared.WebSocket.socket
    pcall(old_socket and old_socket.Close or function() end, old_socket)

    local socket = WebSocket.connect('ws://localhost:10634')

    if (shared.WebSocket.integrity ~= integrity) then
        return socket:Close()
    end
    
    shared.WebSocket.socket = socket
	
	socket.OnMessage:Connect(function(script)
        local success, call_function = pcall_check(loadstring, script)

        if (success) then
            pcall_check(call_function)
        end
	end)

	socket.OnClose:Wait()
    shared.WebSocket.socket = nil
end

task.spawn(function()
	while (task.wait() and shared.WebSocket.integrity == integrity) do
		pcall_check(connect_to_ws)
	end
end)
```

> The function code to add to your `autoexec` / To run it, do `AtlantisConnect()`

```lua
getgenv().AtlantisConnect = function()
	local integrity = cloneref(game:GetService('HttpService')):GenerateGUID()
	local string_format = string.format

	shared.WebSocket = shared.WebSocket or {
		socket = nil,
		integrity = nil
	}

	shared.WebSocket.integrity = integrity

	local function pcall_check(...)
		local success, data = pcall(...)

		if (not success) then
			rconsoleerr(string_format('[%s]: %s', 'SCRIPT ERROR', data))

			return false, data
		end

		return true, data
	end

	local function connect_to_ws()
		local old_socket = shared.WebSocket.socket
		if old_socket then pcall(old_socket and old_socket.Close or function() end, old_socket) end

		local socket, err = WebSocket.connect('ws://localhost:10634')
		if not socket then return rconsoleerr('[%s]: %s', 'CONNECTION ERROR', err) end

		if (shared.WebSocket.integrity ~= integrity) then
			return socket:Close()
		end
		
		shared.WebSocket.socket = socket
		
		socket.OnMessage:Connect(function(script)
			local success, call_function = pcall_check(loadstring, script)

			if (success) then
				pcall_check(call_function)
			end
		end)

		socket.OnClose:Wait()
		shared.WebSocket.socket = nil
	end

	local connectfunc = task.spawn(function()
		while (task.wait() and shared.WebSocket.integrity == integrity) do
			pcall_check(connect_to_ws)
		end
	end)
	return connectfunc
end
```
