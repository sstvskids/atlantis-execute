// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as net from 'net';
import { exists, readFileSync } from 'fs';
import { Server } from 'ws';
import WebSocket = require('ws');

// const PIPE_NAME = '\\\\.\\pipe\\OxygenU';
var ctx: vscode.ExtensionContext;
var statusBarItem: vscode.StatusBarItem;
const ws = new Server({
	port: 10634
})

function isValidEditor(editor?: vscode.TextEditor) {
	if (!editor || ['lua', 'luau'].indexOf(String(editor.document.languageId)) === -1) {
		if (statusBarItem) {
			statusBarItem.hide();
		}
	} else {
		if (statusBarItem) {
			statusBarItem.show();
		}
	}
}

function executeScript(script: string) {
	if (ws.clients.size === 0) return vscode.window.showErrorMessage("Oxygen U websocket is not connected.");

	for (const client of ws.clients)
		client.send(script)
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	ctx = context;

	if (!statusBarItem) {
		statusBarItem = Object.assign(vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left), {
			command: 'o2u-execute.execute',
			tooltip: 'Executes the script from your active editor',
			text: '$(debug-start) O2U Execute'
		});

		isValidEditor(vscode.window.activeTextEditor);

		context.subscriptions.push(statusBarItem);
	}

	console.log('Oxygen U Execute has been activated');

	context.subscriptions.push(vscode.commands.registerCommand('o2u-execute.execute', () => {
		const script = vscode.window.activeTextEditor?.document.getText();

		if (typeof script === 'string') {
			executeScript(script);
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('o2u-execute.executeFile', (data) => {
		if (typeof data === 'object' && 'fsPath' in data) {
			executeScript(readFileSync(data.fsPath, 'utf8'));
		}
	}));
}

// this method is called when your extension is deactivated
export function deactivate() {
	if (ctx) {
		for (const subscription of ctx.subscriptions) {
			subscription.dispose();
		}

		ctx.subscriptions.splice(0, 9e9);
	}
}

vscode.window.onDidChangeActiveTextEditor(isValidEditor);