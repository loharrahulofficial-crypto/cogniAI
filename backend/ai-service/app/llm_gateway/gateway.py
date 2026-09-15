import httpx
import time
import asyncio
from typing import Optional
from app.core.config import settings
from app.models.schemas import LLMRequest, LLMResponse


class LLMGateway:
    """
    Single gateway for all LLM calls.
    Supports: ollama, anthropic, openai, vllm
    Swap provider via LLM_PROVIDER env var — no business logic changes.
    """

    def __init__(self):
        self._call_count = 0
        self._window_start = time.time()

    async def _check_rate_limit(self):
        now = time.time()
        if now - self._window_start > 60:
            self._call_count = 0
            self._window_start = now
        if self._call_count >= settings.MAX_CALLS_PER_MINUTE:
            raise Exception("Rate limit exceeded: max calls per minute reached")
        self._call_count += 1

    async def generate(self, request: LLMRequest) -> LLMResponse:
        await self._check_rate_limit()

        provider = settings.LLM_PROVIDER.lower()
        if provider == "ollama":
            return await self._call_ollama(request)
        elif provider == "openai":
            return await self._call_openai(request)
        elif provider == "anthropic":
            return await self._call_anthropic(request)
        else:
            return await self._call_ollama(request)  # Default to ollama

    async def _call_ollama(self, request: LLMRequest) -> LLMResponse:
        system = request.system_prompt or "You are a helpful assistant for government training and competency development."
        prompt = f"{system}\n\n{request.prompt}"

        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(
                f"{settings.LLM_BASE_URL}/api/generate",
                json={
                    "model": settings.LLM_MODEL,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": request.temperature,
                        "num_predict": request.max_tokens,
                    },
                },
            )
            resp.raise_for_status()
            data = resp.json()

            return LLMResponse(
                content=data.get("response", ""),
                model=settings.LLM_MODEL,
                usage={"prompt_eval_count": data.get("prompt_eval_count", 0), "eval_count": data.get("eval_count", 0)},
                rationale="Generated via Ollama gateway",
            )

    async def _call_openai(self, request: LLMRequest) -> LLMResponse:
        messages = []
        if request.system_prompt:
            messages.append({"role": "system", "content": request.system_prompt})
        messages.append({"role": "user", "content": request.prompt})

        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {settings.LLM_API_KEY}"},
                json={
                    "model": settings.LLM_MODEL,
                    "messages": messages,
                    "max_tokens": request.max_tokens,
                    "temperature": request.temperature,
                },
            )
            resp.raise_for_status()
            data = resp.json()

            return LLMResponse(
                content=data["choices"][0]["message"]["content"],
                model=settings.LLM_MODEL,
                usage=data.get("usage", {}),
                rationale="Generated via OpenAI gateway",
            )

    async def _call_anthropic(self, request: LLMRequest) -> LLMResponse:
        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": settings.LLM_API_KEY,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json={
                    "model": settings.LLM_MODEL,
                    "max_tokens": request.max_tokens,
                    "system": request.system_prompt or "You are a helpful assistant.",
                    "messages": [{"role": "user", "content": request.prompt}],
                },
            )
            resp.raise_for_status()
            data = resp.json()

            return LLMResponse(
                content=data["content"][0]["text"],
                model=settings.LLM_MODEL,
                usage=data.get("usage", {}),
                rationale="Generated via Anthropic gateway",
            )


llm_gateway = LLMGateway()
