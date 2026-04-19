#!/usr/bin/env python3
"""Django's command-line utility for administrative tasks."""
import os
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[2]
VENV_PY = ROOT_DIR / '.venv' / 'bin' / 'python'
if VENV_PY.exists() and Path(sys.executable).resolve() != VENV_PY.resolve():
    print('DEBUG: re-exec to', VENV_PY, 'from', sys.executable)
    os.execv(str(VENV_PY), [str(VENV_PY)] + sys.argv)


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
