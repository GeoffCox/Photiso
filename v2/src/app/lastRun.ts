import * as fs from "fs-extra";
import * as os from "os";
import * as path from "path";

export type LastRunInfo = {
    readonly unorganizedDir: string;
    readonly organizedDir: string;
    readonly duplicatesDir: string;
}

const lastRunDir = path.join(os.tmpdir(), 'photiso');
const lastRunFile = path.format({ dir: lastRunDir, base: 'lastRun.json' });

export async function loadLastRunInfo(): Promise<LastRunInfo> {
    try {
        const data = await fs.readJSON(lastRunFile);
        return <LastRunInfo>data;
    }
    catch (e) {
        console.warn(e);
        return undefined;
    }
};

export async function saveLastRunInfo(info: LastRunInfo): Promise<void> {
    await fs.mkdirp(lastRunDir);
    return fs.writeJSON(lastRunFile, info);
};
