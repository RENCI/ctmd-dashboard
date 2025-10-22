import os
import json
import secrets
import requests
from urllib.parse import urlparse
from flask import redirect as flask_redirect


def authorize(apikey, provider, return_url, code, redirect):
    # Use constant-time comparison to prevent timing attacks
    server_api_key = os.getenv("API_KEY", "")
    if not server_api_key or not apikey:
        return "Unauthorized", 401
    if not secrets.compare_digest(apikey, server_api_key):
        return "Unauthorized", 401
    # Validate return_url to prevent open redirect
    allowed_domains = os.getenv("ALLOWED_RETURN_DOMAINS", "").split(",")
    allowed_domains = [d.strip() for d in allowed_domains if d.strip()]

    if allowed_domains:
        parsed_url = urlparse(return_url)
        if parsed_url.netloc not in allowed_domains:
            return "Invalid return_url domain", 400

    providers = os.getenv("PROVIDERS", "")
    if not providers:
        return "No provider is supported", 500

    try:
        providers = json.loads(providers)
    except json.JSONDecodeError:
        return "Invalid provider configuration", 500

    if provider not in providers.keys():
        return "requested provider is not supported", 500

    auth_url = providers[provider]['AUTH_URL']
    if not code and 'LOGIN_URL' not in providers[provider]:
        return "Fail to authenticate: no token code is provided for the provider", 400

    # Sanitize code parameter to prevent injection
    if code and (len(code) > 512 or any(c in code for c in ['\n', '\r', '\0'])):
        return "Invalid code parameter", 400

    q_auth_url = f"{auth_url}?code={code}"

    # Add timeout to prevent hanging requests
    try:
        r = requests.get(q_auth_url, timeout=10)
    except requests.Timeout:
        return "Authentication provider timeout", 504
    except requests.RequestException as e:
        return f"Failed to connect to authentication provider", 502
    if return_url.endswith('/'):
        return_url = return_url[:-1]
    if r.status_code == 200:
        r_json = r.json()
        # print(r_json, flush=True)
        if redirect:
            key_val_str = ''
            for key, val in r.json().items():
                key_val_str = f"{key_val_str}&{key}={val}"
            redirect_url = f"{return_url}?status=success{key_val_str}"
            #return redirect_url, 200
            return flask_redirect(redirect_url)
        else:
            return r_json
    else:
        r_json = {'content': str(r.content),
                  'status_code': r.status_code}
        # print(r_json, flush=True)
        if redirect:
            # print(r.status_code, r.content, flush=True)
            status_code = r.status_code
            redirect_url = f"{return_url}?status=failure&status_code={status_code}"
            # return redirect_url, status_code
            return flask_redirect(redirect_url)
        else:
            return r_json, r.status_code
