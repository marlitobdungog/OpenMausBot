.PHONY: release package-release

release: package-release

package-release:
	appctl app release --path .
