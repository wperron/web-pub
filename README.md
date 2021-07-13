# web-pub

CLI tool to publish JAMstack files to cloud storage like S3

## Required Permissions

- `--allow-read=.` Requires reading the local filesystem to a) access `Deno.cwd`
  and b) to read the files that will be uploaded. It is suggested to only allow
  reading the directory that will be uploaded as the program doesn't require
  more permissions than that.
- `--allow-net` Requires network access to upload the files over to S3.
- `--allow-env` Requires access to the environment variables to read the AWS
  credentials.
