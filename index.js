#!/usr/bin/env node
const { Command } = require("commander");
const parse = require("csv-parse");
const fs = require("fs");
const { copyFile, unlink } = require("fs").promises;
const path = require("path");
const program = new Command();

program
 .name('dams-files');

program
  .command("copy <source> <destination>")
  .description("copy listed files from dest to source", {
    source: "path to source directory",
    dest: "path to destination directory"
  })
  .requiredOption(
    "-l, --filelist <path>",
    "path to filelist csv (single column, no headers)"
  )
  .option("--overwrite", "overwrite destination file if it exists")
  .option("--no-overwrite", "do not overwrite destination file if it exists")
  .action(async (source, destination, { filelist, overwrite }) => {
    const parser = parse();
    fs.createReadStream(filelist).pipe(parser);
    for await (const [filename] of parser) {
      const sourcePath = path.join(source, filename);
      const destPath = path.join(destination, filename);
      const mode = overwrite ? 0 : fs.constants.COPYFILE_EXCL;

      try {
        await copyFile(sourcePath, destPath, mode);
        console.log("Copied", filename);
      } catch (e) {
        console.warn("Could not copy file:", sourcePath, e);
      }
    }
  });

program
  .command("remove <source>")
  .description("copy listed files from dest to source", {
    source: "path to source directory"
  })
  .requiredOption(
    "-l, --filelist <path>",
    "path to filelist csv (single column, no headers)"
  )
  .action(async (source, { filelist }) => {
    const parser = parse();
    fs.createReadStream(filelist).pipe(parser);
    for await (const [filename] of parser) {
      const sourcePath = path.join(source, filename);
      try {
        await unlink(sourcePath);
        console.log("Removed", filename);
      } catch (e) {
        console.warn("Could not remove file:", sourcePath, e);
      }
    }
  });
program.parse(process.argv);
