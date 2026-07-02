#pragma once

#include <react/renderer/components/text/ParagraphEventEmitter.h>

namespace facebook::react {

/*
 * Event emitter for SelectableRichText.
 * It keeps Paragraph's onTextLayout support and adds selection menu events.
 */
class SelectableRichTextEventEmitter : public ParagraphEventEmitter {
 public:
  using ParagraphEventEmitter::ParagraphEventEmitter;

  struct OnMenuAction {
    std::string id;
    std::string title;
    std::string selectedText;
    int selectionStart{0};
    int selectionEnd{0};
  };

  struct OnTextLongPress {
    std::string paragraphText;
    int selectionStart{0};
    int selectionEnd{0};
    double locationX{0};
    double locationY{0};
    double pageX{0};
    double pageY{0};
  };

  // onMenuAction 把原生自定义菜单点击结果发送给 JS。
  void onMenuAction(OnMenuAction value) const;

  // onTextLongPress 把 menuThenParagraph 模式命中的段落和菜单锚点发送给 JS。
  void onTextLongPress(OnTextLongPress value) const;
};

} // namespace facebook::react
