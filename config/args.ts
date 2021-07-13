// Copyright 2021 William Perron. All rights reserved. MIT license.
import { parse as stdParse } from "https://deno.land/std@0.100.0/flags/mod.ts";

export interface Args {
  _: string[];
  // -b --bucket
  b?: string;
  bucket?: string;
  // -v --version
  v?: string;
  version?: string;
  // -h --help
  h?: boolean;
  help?: boolean;
}

export const HELPTEXT = `Deno S3 module uploader
  uploads the content of a directory to S3

  INSTALL:
  deno install --allow-net --allow-read https://raw.githubusercontent.com/wperron/deno.wperron.io/1.0.2/s3-upload.ts

  USAGE:
  s3-upload [path] [options]

  OPTIONS:
    -h, --help              Prints help information
    -b, --bucket <BUCKET>   Set port
    -v, --version <VERSION> The version of the module being uploaded. defaults to \`unstable\`
`;

// Parse `Deno.args` into the instance of Args passed to the function
export function parse(target: Args, args: string[]) {
  Object.assign(target, stdParse(args));
}