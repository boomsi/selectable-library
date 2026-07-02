#pragma once

#include <react/renderer/components/text/ParagraphProps.h>
#include <react/renderer/core/PropsParserContext.h>
#include <react/renderer/core/RawProps.h>
#include <react/renderer/core/RawValue.h>

#include <memory>
#include <string>
#include <vector>

namespace facebook::react {

// SelectableRichTextMenuItem 保存 JS menuItems 中的单个自定义菜单配置。
struct SelectableRichTextMenuItem {
  std::string id;
  std::string title;

  bool operator==(const SelectableRichTextMenuItem &) const = default;
};

// SelectableRichTextSelectionMode 对齐 JS selectionMode 字符串，控制默认选区或段落菜单优先模式。
enum class SelectableRichTextSelectionMode { Default, MenuThenParagraph };

// fromRawValue 把 JS object 形式的 menu item 转成 C++ props 结构。
void fromRawValue(const PropsParserContext &context, const RawValue &value, SelectableRichTextMenuItem &result);

// fromRawValue 把 JS selectionMode 字符串转成 C++ enum。
void fromRawValue(const PropsParserContext &context, const RawValue &value, SelectableRichTextSelectionMode &result);

// toString 把 C++ selectionMode enum 转回原生层更容易消费的字符串。
std::string toString(const SelectableRichTextSelectionMode &value);

#ifdef RN_SERIALIZABLE_STATE
folly::dynamic toDynamic(const SelectableRichTextMenuItem &value);
folly::dynamic toDynamic(const SelectableRichTextSelectionMode &value);
#endif

/*
 * Props for <SelectableRichText>.
 * It inherits ParagraphProps so all RN Text style, layout and selectable props keep existing behavior.
 */
class SelectableRichTextProps final : public ParagraphProps {
 public:
  SelectableRichTextProps() = default;
  SelectableRichTextProps(
      const PropsParserContext &context,
      const SelectableRichTextProps &sourceProps,
      const RawProps &rawProps);

  // menuItems 是 JS 传入的自定义文本选区菜单项。
  std::vector<SelectableRichTextMenuItem> menuItems{};

  // showSystemMenuItems 控制是否保留系统复制、全选等菜单项。
  bool showSystemMenuItems{true};

  // clearSelectionOnMenuAction 控制点击自定义菜单后是否自动清空选区。
  bool clearSelectionOnMenuAction{false};

  // selectionMode 控制长按直接进入系统选区，还是先回调 JS 段落菜单。
  SelectableRichTextSelectionMode selectionMode{SelectableRichTextSelectionMode::Default};

  // setProp 支持 RN C++ props iterator 路径下的增量 prop 更新。
  void setProp(const PropsParserContext &context, RawPropsPropNameHash hash, const char *propName, const RawValue &value);

#if RN_DEBUG_STRING_CONVERTIBLE
  SharedDebugStringConvertibleList getDebugProps() const override;
#endif

#ifdef RN_SERIALIZABLE_STATE
  ComponentName getDiffPropsImplementationTarget() const override;
  folly::dynamic getDiffProps(const Props *prevProps) const override;
#endif
};

} // namespace facebook::react
