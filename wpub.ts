/**
 * Copyright 2021 William Perron. All rights reserved. MIT license.
 *
 * This program syncs a directory to a destination S3 bucket, much like the
 * `aws s3 sync --delete` command does, but additionnaly adds Content-Type
 * headers based on the extension of each file.
 *
 * The arguments parsing is heavily inspired by Deno's [file_server]
 * (https://deno.land/std/http/file_server.ts). Some functions or classes are
 * taken verbatim from that module.
 */

import { S3Bucket } from "https://deno.land/x/s3@0.4.1/mod.ts";
import { walk } from "https://deno.land/std@0.100.0/fs/walk.ts";
import {
  basename,
  extname,
  posix,
} from "https://deno.land/std@0.100.0/path/mod.ts";
import { pooledMap } from "https://deno.land/std@0.100.0/async/pool.ts";
import { readAll } from "https://deno.land/std@0.100.0/io/util.ts";

import { parse, HELPTEXT } from "./config/args.ts";
import type { Args } from "./config/args.ts";

const MEDIA_TYPES: Record<string, string> = {
  ".md": "text/markdown",
  ".html": "text/html",
  ".htm": "text/html",
  ".json": "application/json",
  ".map": "application/json",
  ".txt": "text/plain",
  ".ts": "text/typescript",
  ".tsx": "text/tsx",
  ".js": "application/javascript",
  ".jsx": "text/jsx",
  ".gz": "application/gzip",
  ".css": "text/css",
  ".wasm": "application/wasm",
  ".mjs": "application/javascript",
};

/**
 * yields tuple of entries in [filepath, object key, content-type] format
 */
async function* getFiles(
  target: string,
  version: string,
): AsyncGenerator<[string, string, string]> {
  for await (
    const entry of walk(target, {
      includeFiles: true,
      includeDirs: true,
      // default ignore list
      skip: [/\.git\/*/],
    })
  ) {
    if (entry.isFile) {
      const relative = entry.path.slice(entry.path.indexOf(basename(target)));
      const parts = relative.split("/");
      parts[0] = `${parts[0]}@${version}`;
      const key = parts.join("/");
      const mime = MEDIA_TYPES[extname(key)];
      yield [entry.path, key, mime];
    }
  }
}

function main(): void {
  const args: Args = { _: [] };
  parse(args, Deno.args);
  const target = posix.resolve(args._[0] ?? "");
  const version = args.v ?? args.version ?? "unstable";

  if (args.h ?? args.help) {
    console.log(HELPTEXT);
    Deno.exit(0);
  }

  const bucket = new S3Bucket({
    bucket: args.b ?? args.bucket ?? "",
    accessKeyID: Deno.env.get("AWS_ACCESS_KEY_ID") ?? "",
    secretKey: Deno.env.get("AWS_SECRET_ACCESS_KEY") ?? "",
    sessionToken: Deno.env.get("AWS_SESSION_TOKEN"),
    region: Deno.env.get("AWS_REGION") ?? "",
  });

  pooledMap(20, getFiles(target, version), async ([path, key, contentType]) => {
    const res = await bucket.putObject(
      key,
      await readAll(await Deno.open(path)),
      {
        contentType: contentType,
      },
    );
    console.log(`uploaded ${key} (${res.etag})`);
  });
}

if (import.meta.main) {
  main();
}
