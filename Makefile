.PHONY: release package-release

release:
	./docker-push.sh
	appctl app release --path .

package-release:
	appctl app release --path .
