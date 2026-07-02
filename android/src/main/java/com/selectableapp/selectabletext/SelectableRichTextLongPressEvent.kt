package com.selectableapp.selectabletext

import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.Event

// TextLongPressEvent 是 menuThenParagraph 模式命中段落后发送给 JS 的 Fabric 事件。
class SelectableRichTextLongPressEvent(surfaceId: Int, viewId: Int, private val payload: WritableMap) :
    Event<SelectableRichTextLongPressEvent>(surfaceId, viewId) {
  // getEventName 返回 Codegen view config 识别的 top-level event 名称。
  override fun getEventName(): String = EVENT_NAME

  // canCoalesce=false 保证连续长按不会合并掉业务菜单请求。
  override fun canCoalesce(): Boolean = false

  // getEventData 返回原生视图构造好的段落和菜单锚点 payload。
  override fun getEventData(): WritableMap = payload

  companion object {
    // EVENT_NAME 对应 JS prop onTextLongPress。
    const val EVENT_NAME = "topTextLongPress"
  }
}
