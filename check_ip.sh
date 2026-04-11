#!/bin/bash

# ─────────────────────────────────────────
#         IP Address Checker Script
# ─────────────────────────────────────────

BOLD="\033[1m"
CYAN="\033[1;36m"
GREEN="\033[1;32m"
YELLOW="\033[1;33m"
RED="\033[1;31m"
RESET="\033[0m"

print_header() {
  echo ""
  echo -e "${CYAN}╔══════════════════════════════════════╗${RESET}"
  echo -e "${CYAN}║        🌐  IP Address Checker        ║${RESET}"
  echo -e "${CYAN}╚══════════════════════════════════════╝${RESET}"
  echo ""
}

print_section() {
  echo -e "${BOLD}$1${RESET}"
  echo -e "  ──────────────────────────────────"
}

get_local_ip() {
  print_section "🔒  Local / Private IP Address"

  # Try ip command first (Linux), fall back to ifconfig (macOS/BSD)
  if command -v ip &>/dev/null; then
    LOCAL_IP=$(ip route get 1.1.1.1 2>/dev/null | grep -oP 'src \K[\d.]+')
  elif command -v ifconfig &>/dev/null; then
    LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)
  fi

  if [[ -n "$LOCAL_IP" ]]; then
    echo -e "  ${GREEN}✔  IP Address : ${BOLD}$LOCAL_IP${RESET}"
  else
    echo -e "  ${RED}✘  Could not determine local IP address.${RESET}"
  fi
  echo ""
}

get_public_ip() {
  print_section "🌍  Public / External IP Address"

  # Try multiple public IP services for reliability
  PUBLIC_IP=$(curl -sf --max-time 5 https://api.ipify.org \
           || curl -sf --max-time 5 https://ifconfig.me \
           || curl -sf --max-time 5 https://icanhazip.com \
           || curl -sf --max-time 5 https://ipecho.net/plain)

  if [[ -n "$PUBLIC_IP" ]]; then
    echo -e "  ${GREEN}✔  IP Address : ${BOLD}$PUBLIC_IP${RESET}"
  else
    echo -e "  ${RED}✘  Could not determine public IP. Check your internet connection.${RESET}"
  fi
  echo ""
}

print_footer() {
  echo -e "${CYAN}  ──────────────────────────────────────${RESET}"
  echo -e "  ${YELLOW}Checked at: $(date '+%Y-%m-%d %H:%M:%S %Z')${RESET}"
  echo -e "${CYAN}  ──────────────────────────────────────${RESET}"
  echo ""
}

print_header
get_local_ip
get_public_ip
print_footer
