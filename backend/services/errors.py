from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class ApiError:
    code: str
    message: str
    suggestion: str | None = None
    http_status: int = 400

    def to_dict(self) -> dict:
        d = {"error": True, "code": self.code, "message": self.message}
        if self.suggestion:
            d["suggestion"] = self.suggestion
        return d

