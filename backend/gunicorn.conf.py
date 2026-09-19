"""
gunicorn.conf.py
----------------
Production WSGI web server configuration for Flask Backend API.
"""

import os
import multiprocessing

bind = "0.0.0.0:5000"
workers = int(os.getenv("GUNICORN_WORKERS", "4"))
threads = int(os.getenv("GUNICORN_THREADS", "2"))
worker_class = "gthread"
timeout = 120
keepalive = 5
max_requests = 1000
max_requests_jitter = 50

loglevel = "info"
accesslog = "-"
errorlog = "-"
