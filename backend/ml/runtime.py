from __future__ import annotations

import os
from dataclasses import dataclass

import numpy as np

from services.settings import Settings


class ModelNotReadyError(RuntimeError):
    pass


@dataclass(frozen=True)
class ModelRuntime:
    model_type: str
    model_path: str | None
    _session: object | None

    @staticmethod
    def from_settings(settings: Settings) -> "ModelRuntime":
        model_path = settings.onnx_model_path
        if not model_path:
            return ModelRuntime(model_type="onnx", model_path=None, _session=None)

        if not os.path.exists(model_path):
            raise ModelNotReadyError(f"ONNX model not found at {model_path}")

        import onnxruntime as ort

        sess = ort.InferenceSession(model_path, providers=["CPUExecutionProvider"])
        return ModelRuntime(model_type="onnx", model_path=model_path, _session=sess)

    def predict_proba(self, nhwc_float32: np.ndarray) -> np.ndarray:
        if self._session is None:
            raise ModelNotReadyError(
                "ONNX_MODEL_PATH not configured. Set it to a 7-class fish disease ONNX model."
            )
        import numpy as _np

        sess = self._session  # type: ignore[assignment]
        inputs = sess.get_inputs()
        if not inputs:
            raise ModelNotReadyError("Invalid ONNX model: no inputs")
        input_name = inputs[0].name

        outputs = sess.run(None, {input_name: nhwc_float32.astype(_np.float32)})
        if not outputs:
            raise ModelNotReadyError("Invalid ONNX model: no outputs")

        logits = outputs[0]
        arr = _np.array(logits).reshape(-1)

        # If model already returns probabilities, keep them. Otherwise softmax.
        if (arr >= 0).all() and _np.isclose(arr.sum(), 1.0, atol=1e-2):
            probs = arr
        else:
            ex = _np.exp(arr - _np.max(arr))
            probs = ex / (ex.sum() + 1e-9)

        # Expect 7 classes; tolerate mismatches but keep stable response.
        if probs.shape[0] != 7:
            probs = _np.pad(probs[:7], (0, max(0, 7 - probs.shape[0])), constant_values=0)
            probs = probs / (probs.sum() + 1e-9)
        return probs

