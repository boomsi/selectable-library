package com.selectableapp.selectabletext

import com.facebook.react.bridge.JSApplicationIllegalArgumentException
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.views.text.ReactTextView
import com.facebook.react.views.text.ReactTextViewManager

// SelectableRichTextViewManager 继承 RN Text manager，复用 Text props、Spannable 和测量链路。
@ReactModule(name = SelectableRichTextViewManager.REACT_CLASS)
class SelectableRichTextViewManager : ReactTextViewManager() {
  // getName 导出给 JS Fabric HostComponent 使用的组件名。
  override fun getName(): String = REACT_CLASS

  // createViewInstance 创建真正承载 Android 原生选区能力的 ReactTextView 子类。
  override fun createViewInstance(context: ThemedReactContext): SelectableRichTextView =
      SelectableRichTextView(context)

  // shadow node 直接复用 ReactTextViewManager 的实现，避免绑定 RN 具体版本的内部 TextShadowNode 类。

  // setMenuItems 把 JS menuItems 数组转换成 Android ActionMode 菜单配置。
  @ReactProp(name = "menuItems")
  fun setMenuItems(view: SelectableRichTextView, menuItems: ReadableArray?) {
    val parsedMenuItems = mutableListOf<SelectableRichTextMenuItem>()

    // menuItems 为空时清空自定义菜单配置。
    if (menuItems == null) {
      view.menuItems = parsedMenuItems
      return
    }

    for (index in 0 until menuItems.size()) {
      val item = menuItems.getMap(index)

      // 缺少 id 或 title 的项不传给原生菜单，避免点击后 JS 无法区分动作。
      if (item == null || !item.hasKey("id") || !item.hasKey("title")) {
        continue
      }

      val id = item.getString("id")
      val title = item.getString("title")

      // id/title 不是有效字符串时跳过该菜单项。
      if (id.isNullOrBlank() || title.isNullOrBlank()) {
        continue
      }

      parsedMenuItems.add(SelectableRichTextMenuItem(id, title))
    }

    view.menuItems = parsedMenuItems
  }

  // setShowSystemMenuItems 控制 Android ActionMode 是否保留系统菜单项。
  @ReactProp(name = "showSystemMenuItems", defaultBoolean = true)
  fun setShowSystemMenuItems(view: SelectableRichTextView, showSystemMenuItems: Boolean) {
    view.showSystemMenuItems = showSystemMenuItems
  }

  // setClearSelectionOnMenuAction 控制自定义菜单点击后是否清空选区。
  @ReactProp(name = "clearSelectionOnMenuAction", defaultBoolean = false)
  fun setClearSelectionOnMenuAction(view: SelectableRichTextView, clearSelectionOnMenuAction: Boolean) {
    view.clearSelectionOnMenuAction = clearSelectionOnMenuAction
  }

  // setSelectionMode 保持 Android 与 iOS 的 JS API 对齐；Android 当前先走原生长按选区。
  @ReactProp(name = "selectionMode")
  fun setSelectionMode(view: SelectableRichTextView, selectionMode: String?) {
    view.selectionMode = selectionMode ?: SelectableRichTextView.SELECTION_MODE_DEFAULT
  }

  // receiveCommand 处理 Fabric dispatchCommand 传入的字符串命令。
  override fun receiveCommand(root: ReactTextView, commandId: String, args: ReadableArray?) {
    val selectableTextView = root as? SelectableRichTextView

    // command 只处理本 manager 创建的 SelectableRichTextView，避免错误 view 类型执行选区命令。
    if (selectableTextView == null) {
      return
    }

    when (commandId) {
      COMMAND_SELECT_RANGE -> handleSelectRangeCommand(selectableTextView, args)
      COMMAND_CLEAR_SELECTION -> selectableTextView.clearSelection()
      COMMAND_COPY_RANGE -> handleCopyRangeCommand(selectableTextView, args)
    }
  }

  // handleSelectRangeCommand 校验 selectRange 命令参数并转发给原生视图。
  private fun handleSelectRangeCommand(view: SelectableRichTextView, args: ReadableArray?) {
    // selectRange 必须包含 start/end 两个数字参数。
    if (args == null || args.size() < 2) {
      throw JSApplicationIllegalArgumentException("selectRange requires start and end arguments")
    }

    view.selectRange(args.getInt(0), args.getInt(1))
  }

  // handleCopyRangeCommand 校验 copyRange 命令参数并复制指定文本范围。
  private fun handleCopyRangeCommand(view: SelectableRichTextView, args: ReadableArray?) {
    // copyRange 必须包含 start/end 两个数字参数。
    if (args == null || args.size() < 2) {
      throw JSApplicationIllegalArgumentException("copyRange requires start and end arguments")
    }

    view.copyRange(args.getInt(0), args.getInt(1))
  }

  companion object {
    // REACT_CLASS 是 Android Fabric 注册名。
    // RN 0.85 的 FabricNameComponentMapping 不在映射表里的名字会原样透传，
    // ViewManagerRegistry.get 再尝试加 "RCT" 前缀查找。
    // 因此 JS viewName "SelectableRichText" 会查 "SelectableRichText" 和 "RCTSelectableRichText"，
    // 这里注册名用 "RCTSelectableRichText" 命中后者。
    // 不能用 "RCTSelectableText"，否则会和 RN 自带的 SelectableRichTextViewManager 冲突。
    const val REACT_CLASS = "RCTSelectableRichText"

    // COMMAND_SELECT_RANGE 是 JS ref.selectRange 派发的 command 名称。
    private const val COMMAND_SELECT_RANGE = "selectRange"

    // COMMAND_CLEAR_SELECTION 是 JS ref.clearSelection 派发的 command 名称。
    private const val COMMAND_CLEAR_SELECTION = "clearSelection"

    // COMMAND_COPY_RANGE 是 JS ref.copyRange 派发的 command 名称。
    private const val COMMAND_COPY_RANGE = "copyRange"
  }
}
