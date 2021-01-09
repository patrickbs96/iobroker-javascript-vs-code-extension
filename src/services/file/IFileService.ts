import { Uri } from "vscode";

export interface IFileService {
    saveToFile(uri: Uri, content: string): Promise<void>
    readFromFile(uri: Uri): Promise<string>
    fileExists(uri: Uri): boolean
    rename(oldFile: Uri, newFile: Uri): Promise<void>
}
