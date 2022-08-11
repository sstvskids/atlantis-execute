> Put this in your Oxygen U `autoexec` folder

```lua
local HttpService = game:GetService('HttpService')
local integrity = HttpService:GenerateGUID()
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
	local w = task.wait
	while (w() and shared.WebSocket.integrity == integrity) do
		pcall_check(connect_to_ws)
	end
end)
```