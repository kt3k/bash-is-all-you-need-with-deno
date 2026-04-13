#!/usr/bin/env bash
set -euo pipefail

get_local_ip() {
  if command -v ip >/dev/null 2>&1; then
    ip route get 1.1.1.1 2>/dev/null | awk '/src/ {for (i = 1; i <= NF; i++) if ($i == "src") {print $(i+1); exit}}'
  elif command -v hostname >/dev/null 2>&1; then
    hostname -I 2>/dev/null | awk '{print $1}'
  elif command -v ifconfig >/dev/null 2>&1; then
    ifconfig 2>/dev/null | awk '/inet / && $2 != "127.0.0.1" {print $2; exit}'
  fi
}

get_public_ip() {
  if command -v curl >/dev/null 2>&1; then
    curl -fsS --max-time 5 https://api.ipify.org \
      || curl -fsS --max-time 5 https://ifconfig.me \
      || curl -fsS --max-time 5 https://icanhazip.com
  elif command -v wget >/dev/null 2>&1; then
    wget -qO- --timeout=5 https://api.ipify.org \
      || wget -qO- --timeout=5 https://ifconfig.me \
      || wget -qO- --timeout=5 https://icanhazip.com
  fi
}

local_ip="$(get_local_ip || true)"
public_ip="$(get_public_ip || true)"

printf 'Local IP:  %s\n' "${local_ip:-unavailable}"
printf 'Public IP: %s\n' "${public_ip:-unavailable}"
