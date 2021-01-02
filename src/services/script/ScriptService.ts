
import { inject, injectable } from "inversify";
import { win32 } from "path";
import { Uri, window, WorkspaceFolder } from "vscode";
import { Script, ScriptId, ScriptObject } from "../../models/Script";
import TYPES from "../../Types";
import { IFileService } from "../file/IFileService";
import { IWorkspaceService } from "../workspace/IWorkspaceService";
import { IScriptService } from "./IScriptService";

@injectable()
export class ScriptService implements IScriptService {
    constructor(
        @inject(TYPES.services.workspace) private workspaceService: IWorkspaceService,
        @inject(TYPES.services.file) private fileService: IFileService,
    ) {}

    async getIoBrokerId(fileUri: Uri): Promise<ScriptId> {
        if (fileUri.scheme !== "file") {
            return "";
        }
        
        const workspace = await this.workspaceService.getWorkspaceToUse();
        const idSuffixPath = fileUri.path.substr(workspace.uri.path.length);
        const suffixLength = idSuffixPath.lastIndexOf(".");

        var path = idSuffixPath.substring(0, suffixLength);
        path = this.replaceAll(path, "/", ".");
        path = this.replaceAll(path, " ", "_");

        return new ScriptId(`script.js${path}`);
    }
    
    getRelativeFilePath(script: Script): string {
        var path = script._id.replace("script.js.", "");
        path = this.replaceAll(path, ".", "/");
        path = this.replaceAll(path, "_", " ");
        const extension = script.common.engineType === "Javascript/js" ? "js" : ""; // TODO support for different file formats
        return `${path}.${extension}`;
    }

    async saveToFile(script: Script, workspaceFolder: WorkspaceFolder): Promise<void> {
        const relativeFilePath = this.getRelativeFilePath(script);
        const uri = Uri.joinPath(workspaceFolder.uri, relativeFilePath);

        if (script.common.source) {
            await this.fileService.saveToFile(uri, script.common.source);            
        } else {
            throw new Error(`Cannot save script '${script._id}' to file, because it has no source set`);
        }
    }
    
    async saveAllToFile(scripts: ScriptObject[], workspaceFolder: WorkspaceFolder): Promise<void> {
        for (const script of scripts) {
            await this.saveToFile(script.value, workspaceFolder);
        }
    }

    private replaceAll(s: string, searchValue: string, replaceValue: string): string {
        return s.split(searchValue).join(replaceValue);
    }
}