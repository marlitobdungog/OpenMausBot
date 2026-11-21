.PHONY: release package-release update-version

VERSION ?=
BRANCH ?= marlito

release: package-release

package-release:
	appctl app release --path .

update-version:
	@test -n "$(VERSION)" || { echo "Usage: make update-version VERSION=v0.1.176" >&2; exit 2; }
	@test "$$(git branch --show-current)" = "$(BRANCH)" || { echo "Switch to $(BRANCH) before updating." >&2; exit 2; }
	@test -z "$$(git status --porcelain)" || { echo "Commit or stash working-tree changes before updating." >&2; exit 2; }
	git fetch --no-tags upstream refs/tags/$(VERSION):refs/tags/$(VERSION)
	git merge $(VERSION)
	git push origin $(BRANCH)
