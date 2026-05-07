package com.anonymous.CounterAssignment

import android.os.Handler
import android.os.Looper
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.turbomodule.core.interfaces.TurboModule

class NativeCounterModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext), TurboModule {
  companion object {
    const val MODULE_NAME = "NativeCounter"
  }

  private var value: Double = 0.0
  private var incrementPressCount: Int = 0
  private val handler = Handler(Looper.getMainLooper())
  private var inactivityTimeoutMs = 4000L
  private var autoDecrementIntervalMs = 1000L
  private var inactivityConfigured = false
  private var inactivityTimeoutRunnable: Runnable? = null
  private var autoDecrementRunnable: Runnable? = null
  private var gradualResetRunnable: Runnable? = null
  private var gradualResetIntervalMs = 90L
  private var isGradualResetActive = false

  override fun getName(): String = MODULE_NAME

  @ReactMethod(isBlockingSynchronousMethod = true)
  fun getValue(): Double = value

  @ReactMethod(isBlockingSynchronousMethod = true)
  fun increment(): Double {
    stopGradualReset()
    incrementPressCount += 1
    val incrementBy = if (incrementPressCount % 5 == 0) 5.0 else 1.0
    value += incrementBy
    scheduleInactivityIfConfigured()
    emitValueChanged()
    return value
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  fun decrement(): Double {
    stopGradualReset()
    value = maxOf(0.0, value - 1.0)
    scheduleInactivityIfConfigured()
    emitValueChanged()
    return value
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  fun reset(): Double {
    stopGradualReset()
    value = 0.0
    scheduleInactivityIfConfigured()
    emitValueChanged()
    return value
  }

  @ReactMethod
  fun configureInactivity(timeoutMs: Double, intervalMs: Double) {
    inactivityTimeoutMs = timeoutMs.toLong().coerceAtLeast(300L)
    autoDecrementIntervalMs = intervalMs.toLong().coerceAtLeast(100L)
    inactivityConfigured = true
    scheduleInactivityIfConfigured()
  }

  @ReactMethod
  fun clearInactivity() {
    inactivityConfigured = false
    stopInactivityTimeout()
    stopAutoDecrement()
  }

  @ReactMethod
  fun startGradualReset(intervalMs: Double) {
    stopInactivityTimeout()
    stopAutoDecrement()
    stopGradualReset()

    gradualResetIntervalMs = intervalMs.toLong().coerceAtLeast(40L)
    if (value <= 0.0) {
      emitValueChanged()
      return
    }

    isGradualResetActive = true
    val runnable = object : Runnable {
      override fun run() {
        if (!isGradualResetActive) {
          return
        }
        value = maxOf(0.0, value - 1.0)
        if (value <= 0.0) {
          stopGradualReset()
          emitValueChanged()
          if (inactivityConfigured) {
            scheduleInactivityIfConfigured()
          }
          return
        }
        emitValueChanged()
        handler.postDelayed(this, gradualResetIntervalMs)
      }
    }
    gradualResetRunnable = runnable
    handler.post(runnable)
  }

  @ReactMethod
  fun stopGradualReset() {
    isGradualResetActive = false
    gradualResetRunnable?.let {
      handler.removeCallbacks(it)
    }
    gradualResetRunnable = null
  }

  @ReactMethod
  fun addListener(eventName: String) {
    // Required for React Native event emitter contract.
  }

  @ReactMethod
  fun removeListeners(count: Double) {
    // Required for React Native event emitter contract.
  }

  private fun emitValueChanged() {
    if (!reactApplicationContext.hasActiveReactInstance()) {
      return
    }
    val payload = Arguments.createMap().apply {
      putDouble("value", value)
      putBoolean("isGradualResetActive", isGradualResetActive)
    }
    reactApplicationContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit("NativeCounter:onValueChanged", payload)
  }

  private fun scheduleInactivityIfConfigured() {
    if (!inactivityConfigured) {
      return
    }
    stopInactivityTimeout()
    stopAutoDecrement()

    val timeoutRunnable = Runnable {
      startAutoDecrement()
    }
    inactivityTimeoutRunnable = timeoutRunnable
    handler.postDelayed(timeoutRunnable, inactivityTimeoutMs)
  }

  private fun startAutoDecrement() {
    stopAutoDecrement()
    val runnable = object : Runnable {
      override fun run() {
        if (value <= 0.0 || isGradualResetActive) {
          stopAutoDecrement()
          return
        }
        value = maxOf(0.0, value - 1.0)
        emitValueChanged()
        if (value <= 0.0) {
          stopAutoDecrement()
          return
        }
        handler.postDelayed(this, autoDecrementIntervalMs)
      }
    }
    autoDecrementRunnable = runnable
    handler.postDelayed(runnable, autoDecrementIntervalMs)
  }

  private fun stopInactivityTimeout() {
    inactivityTimeoutRunnable?.let {
      handler.removeCallbacks(it)
    }
    inactivityTimeoutRunnable = null
  }

  private fun stopAutoDecrement() {
    autoDecrementRunnable?.let {
      handler.removeCallbacks(it)
    }
    autoDecrementRunnable = null
  }
}

