#!/bin/bash
# Install system dependencies for PostgreSQL
apt-get update
apt-get install -y libpq-dev gcc
pip install --upgrade pip
pip install -r requirements.txt
