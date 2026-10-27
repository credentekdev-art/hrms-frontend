"""Run only via the approved Release workflow as hrmsdeploy, on the server."""
import fcntl
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import time
import urllib.request


def run(*args, **kwargs):
    subprocess.run(args, check=True, **kwargs)


def check_health(port):
    # Explicitly bypass proxies; no_proxy CIDR is not portable across clients.
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
    for attempt in range(30):
        try:
            with opener.open(f"http://localhost:{port}/health", timeout=3) as response:
                if response.status == 200 and json.load(response).get("status") == "ok":
                    return
        except Exception:
            pass
        time.sleep(2)
    raise RuntimeError("Backend health check failed; frontend deployment must stop")


def atomic_json(path, value):
    temporary = path.with_suffix(".tmp")
    temporary.write_text(json.dumps(value) + "\n")
    temporary.replace(path)


def previous_release(current):
    if not current.is_symlink():
        if current.exists():
            raise RuntimeError("current must be a release symlink")
        return None
    previous = current.resolve(strict=True)
    assert previous.parent == (current.parent / "releases").resolve()
    return previous


def activate(release, current):
    temporary = current.with_name("current.next")
    if temporary.exists() or temporary.is_symlink():
        raise RuntimeError("Unresolved current.next; inspect previous deployment")
    temporary.symlink_to(release)
    temporary.replace(current)


target = os.environ["TARGET"]
sha = os.environ["SOURCE_SHA"]
run_id = os.environ["CI_RUN_ID"]
assert target in {"staging", "production"}
assert re.fullmatch(r"[a-f0-9]{40}", sha)
assert run_id.isdigit()
assert __import__("pwd").getpwuid(os.getuid()).pw_name == "hrmsdeploy"
root = Path("/srv/hrms") / target
shared = root / "shared"
# Both repository runners take the same lock for this environment.
lock = (shared / "deployment.lock").open("a")
fcntl.flock(lock, fcntl.LOCK_EX)
port = 8001 if target == "staging" else 8002
artifact = Path(os.environ["ARTIFACT_DIR"])
release_id = f"{sha}-{run_id}-{os.environ['GITHUB_RUN_ID']}-{os.environ['GITHUB_RUN_ATTEMPT']}"
record = {"sha": sha, "ci_run_id": run_id, "release_id": release_id}

backend_sha = os.environ["BACKEND_SHA"]
assert re.fullmatch(r"[a-f0-9]{40}", backend_sha)
backend = json.loads((shared / "backend-release.json").read_text())
assert backend.get("status") == "healthy" and backend.get("sha") == backend_sha, "Release backend first"
check_health(port)
assert (artifact / "index.html").is_file()
assert not any(p.is_symlink() for p in artifact.rglob("*"))
release = root / "frontend/releases" / release_id
shutil.copytree(artifact, release)  # Fails if release exists.
# nginx www-data can traverse/read the static build, never backend.env.
for path in release.rglob("*"):
    path.chmod(0o755 if path.is_dir() else 0o644)
release.chmod(0o755)
current = root / "frontend/current"
previous = previous_release(current)
web_port = 8080 if target == "staging" else 80
opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))


def check_frontend(expected):
    with opener.open(f"http://192.168.0.188:{web_port}/", timeout=10) as response:
        assert response.status == 200
        assert response.read() == (expected / "index.html").read_bytes()


try:
    run("sudo", "-n", "/usr/sbin/nginx", "-t")
    activate(release, current)
    run("sudo", "-n", "/usr/bin/systemctl", "reload", "nginx.service")
    check_frontend(release)
except Exception:
    if previous is None:
        raise RuntimeError("First deployment failed; no previous frontend release exists for rollback") from None
    try:
        activate(previous, current)
        run("sudo", "-n", "/usr/bin/systemctl", "reload", "nginx.service")
        check_frontend(previous)
    except Exception:
        raise RuntimeError("Automatic frontend rollback failed; operator intervention required") from None
    raise RuntimeError("Deployment failed; previous frontend release restored and checked") from None
record["backend_sha"] = backend_sha
atomic_json(shared / "frontend-release.json", record)
print("Frontend release healthy:", release_id)
