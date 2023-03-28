import { readdirSync, statSync } from 'fs';
import { join } from 'path';
const path = require("path");

let allFilesAndSubdirectories: string[] = [];

async function getFilesFromDirectory(directoryPath: string) {

    readdirSync(directoryPath).forEach((file: any) => {

        const absoluteFilepath = join(directoryPath, file);

        if (statSync(absoluteFilepath).isDirectory()) {
            getFilesFromDirectory(absoluteFilepath);
        } else {
            allFilesAndSubdirectories.push(win32PathConverter(absoluteFilepath));
        }
    }
    );
}

export function filterFiles(extension: string, files: string[]) {
    return files.filter(
        file => file.endsWith(extension));
}

export function win32PathConverter(path: string) {
    if (process.platform === "win32") {
        if (path.charAt(0) === '/' || path.charAt(0) === '\\') {
            path = path.substring(process.platform === "win32" ? 1 : 0);
        }
        return path.replace(/[\\/]+/g, '/');
    } else {
        return path;
    }
}

export function pathSplitIntoArrays(relativePaths: string[]) {
    const paths: any[] = [];

    for (const path of relativePaths) {
        let p: string[] = path.split('/');
        p = p.filter(ele => ele !== '');
        let temp: string[] = [];
        for (let i = 0; i < p.length; i++) {
            temp.push(p[i]);
            if (!paths.includes(temp)) {
                paths.push([...temp]);
            }
        }
    }

    return paths;
}

export function removeDirPathFromFilesPath(directoryPath: string, files: string[]) {
    const relativePaths: any[] = [];

    files.forEach(element => {
        relativePaths.push(element.replace(directoryPath, ""));
    });

    return relativePaths;
}

export function removeElementsDuplicationFromArray(array: any[]) {
    let hash = [];
    let out = [];
    for (let i = 0, l = array.length; i < l; i++) {
        let key = array[i].join('|');
        if (!hash[key]) {
            out.push(array[i]);
            hash[key] = 'found';
        }
    }

    return out;
}

export function checkIfDirIsPresent(dir: string) {
    try {
        readdirSync(dir);
        return true;
    }
    catch {
        return false;
    }
}

export function dirFilesPathJSON(directoryPath: string, filters: string[]): string {

    if (checkIfDirIsPresent(directoryPath)) {
        directoryPath = win32PathConverter(directoryPath);
        allFilesAndSubdirectories = [];
        let filteredFiles: string[] = [];

        //find all files recursively in a directory 
        getFilesFromDirectory(directoryPath);
        //filter the files list
        filters.forEach(filter => {
            filteredFiles = filteredFiles.concat(filterFiles(filter, allFilesAndSubdirectories));
        });

        const paths: any[] = pathSplitIntoArrays(
            removeDirPathFromFilesPath(directoryPath, filteredFiles));

        return JSON.stringify(removeElementsDuplicationFromArray(paths));
    }
    else { return "undefined"; }
}
