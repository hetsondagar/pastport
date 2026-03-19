from __future__ import annotations

import os
from pathlib import Path


TRUE_VALUES = {"1", "true", "yes", "on"}
FALSE_VALUES = {"0", "false", "no", "off"}


def _env_value(name: str) -> str:
    return (os.getenv(name) or "").strip().lower()


def env_flag(name: str) -> bool:
    return _env_value(name) in TRUE_VALUES


def _read_cgroup_memory_limit_mb() -> float | None:
    # Works on modern cgroup v2 and older cgroup v1 Linux setups.
    candidates = [
        Path("/sys/fs/cgroup/memory.max"),
        Path("/sys/fs/cgroup/memory/memory.limit_in_bytes"),
    ]

    for p in candidates:
        try:
            if not p.exists():
                continue
            raw = p.read_text(encoding="utf-8").strip().lower()
            if raw in {"", "max"}:
                continue
            limit_bytes = int(raw)
            if limit_bytes <= 0:
                continue
            # Ignore effectively unlimited values.
            if limit_bytes >= (1 << 60):
                continue
            return limit_bytes / (1024 * 1024)
        except Exception:
            continue
    return None


def low_memory_instance(threshold_mb: int = 700) -> bool:
    limit_mb = _read_cgroup_memory_limit_mb()
    return bool(limit_mb is not None and limit_mb <= threshold_mb)


def fast_mode_enabled() -> bool:
    # Explicit override for cases where full models are required.
    if env_flag("PASTPORT_ML_FORCE_FULL_MODE"):
        return False

    val = _env_value("PASTPORT_ML_FAST_MODE")
    if val in TRUE_VALUES:
        return True
    if val in FALSE_VALUES:
        return False

    if env_flag("RENDER"):
        return True

    # Auto-protect low-memory instances, even outside Render.
    return low_memory_instance()
