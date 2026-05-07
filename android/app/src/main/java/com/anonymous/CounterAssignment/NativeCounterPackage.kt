package com.anonymous.CounterAssignment

import com.facebook.react.TurboReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
import java.util.HashMap

class NativeCounterPackage : TurboReactPackage() {
  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
    return if (name == NativeCounterModule.MODULE_NAME) {
      NativeCounterModule(reactContext)
    } else {
      null
    }
  }

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
    return ReactModuleInfoProvider {
      val moduleInfos = HashMap<String, ReactModuleInfo>()
      moduleInfos[NativeCounterModule.MODULE_NAME] = ReactModuleInfo(
        NativeCounterModule.MODULE_NAME,
        NativeCounterModule::class.java.name,
        false,
        false,
        false,
        true
      )
      moduleInfos
    }
  }
}

