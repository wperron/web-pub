build:
	mkdir -p bin/
	deno compile --allow-read --allow-net --allow-env --output ./bin/wpub wpub.ts