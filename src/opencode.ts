import os from 'os';
import path from 'path';
import fs from 'fs';
import type { wordData } from './types.js';

const homeDir = os.homedir();

// %LOCALAPPDATA%\opencode\opencode.db
// ~/.local/share/opencode/opencode.db
function openCodePath():string{
    var dbPath: string;
    if (os.platform() === "win32") {
    dbPath = path.join(process.env.LOCALAPPDATA || '', "opencode", "storage");
    }else {
        dbPath = path.join(homeDir, ".local", "share", "opencode", "storage");
    }
    return dbPath;
}

function getAllUserMessageIds(): string[] | undefined {
    const storagePath = openCodePath();
    const messageIds: string[] = [];
    if (!fs.existsSync(storagePath)) {
        return
    }
    const sessions = fs.readdirSync(path.join(storagePath, "message"));
    sessions.forEach(file => {
        if (!fs.statSync(path.join(storagePath, "message", file)).isDirectory()) {
            return;
        }
        var messages: string[];
        try {
            messages = fs.readdirSync(path.join(storagePath, "message", file));
        } catch (error) {
            console.error(`Error reading messages for session ${file}:`, error);
            return;
        }
        
        messages.forEach(message => {
            if (message.endsWith(".json") === false) {
                return;
            }
            const messagePath = path.join(storagePath, "message", file, message);
            const content = fs.readFileSync(messagePath, 'utf-8');
            // if (JSON.parse(content)?.role === "user") {
                // idk why this didn't work
                messageIds.push(message.replace(".json", ""));
            // }
        });
    });
    return messageIds;
}

// messageId is of format msg_<sometext>
// dir/part/msg_<sometext>/part_<sometext>.json
function getMessageContent(messageId: string): {text: string, time: number} | undefined {
    if (!messageId.startsWith("msg_")) {
        return
    }
    const storagePath = openCodePath();
    if (!fs.existsSync(storagePath)) {
        return
    }
    const partPath = path.join(storagePath, "part");
    if (!fs.existsSync(path.join(partPath, messageId))) {
        return;
    }
    const files = fs.readdirSync(path.join(partPath, messageId), 'utf-8');
    
    if (files.length === 0) {
        return
    }
    let text = "";
    let time = 0;
    files.forEach(file => {
        if (file.endsWith(".json")) {
            const content = fs.readFileSync(path.join(partPath, messageId, file), 'utf-8');
            // text += JSON.parse(content).text; // maybe push the whole json
            if (JSON.parse(content).type === "text") {
                text += content
                if (JSON.parse(content).time){
                    time = JSON.parse(content).time.start ?? 0
                }else {
                    // console.log(`No time found for message ${messageId} in file ${file}`);
                }
                
            }
            
        }
    });
    return { text, time };
}

export function getOpencodeCount(wordlist: string[]): Record<string, wordData[]> {
    const countMap: Record<string, wordData[]> = {};
    wordlist.forEach(word => countMap[word] = []);
    getAllUserMessageIds()?.forEach(messageId => {
        const content = getMessageContent(messageId);
        if (content) {
            wordlist.forEach(word => {
                if (countMap[word] !== undefined) {
                    countMap[word].push({
                        count: content.text.toLowerCase().split(word.toLowerCase()).length - 1,
                        time: content.time
                    });
                }
            })
        }
    })
    return countMap;
}

// console.log(getOpencodeCount(["the", "and", "I"]))